import { createClient } from '@supabase/supabase-js';

function getAllGrammarSupabaseAdmin() {
  const url = process.env.ALLGRAMMAR_SUPABASE_URL;
  const key = process.env.ALLGRAMMAR_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('ALLGRAMMAR_SUPABASE_URL 또는 ALLGRAMMAR_SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * 올킬보카 결제 완료 후 계정 생성 및 서비스 활성화
 * - AllGrammar Supabase에 연결 (홈페이지 Supabase와 별개)
 * - 에러 발생 시 결제는 취소하지 않고 로그만 기록
 * - 이미 동일 이메일 계정이 있으면 서비스 활성화만 진행
 */
export async function activateVoca(params: {
  name: string;
  email: string;
  phone: string;
  orderId: string;
}): Promise<void> {
  const { name, email, phone, orderId } = params;

  try {
    const supabase = getAllGrammarSupabaseAdmin();
    let userId: string;

    // 1. RPC로 auth.users + public.users 생성 (트리거 자동 실행)
    //    이미 있으면 기존 ID 반환, 없으면 새로 생성
    const { data: rpcUserId, error: rpcError } = await supabase.rpc('create_voca_user', {
      _email: email,
      _password: phone.replace(/\D/g, ''),
      _name: name,
      _phone: phone,
    });

    if (rpcError) {
      console.error(`[vocaActivation] 계정 생성 RPC 실패 (orderId: ${orderId}):`, rpcError);
      return;
    }

    userId = rpcUserId;
    console.log(`[vocaActivation] 계정 준비 완료 (email: ${email}, userId: ${userId})`);

    // 3. voca 서비스 활성화 (중복 삽입 방지)
    const { data: existing } = await supabase
      .from('service_assignments')
      .select('id')
      .eq('student_id', userId)
      .eq('service', 'voca')
      .maybeSingle();

    if (existing) {
      console.log(`[vocaActivation] 이미 활성화된 voca 서비스 (userId: ${userId})`);
      return;
    }

    const { error: assignError } = await supabase.from('service_assignments').insert({
      student_id: userId,
      service: 'voca',
      assigned_by: userId,
    });

    if (assignError) {
      console.error(`[vocaActivation] service_assignments 삽입 실패 (orderId: ${orderId}):`, assignError);
    } else {
      console.log(`[vocaActivation] 올킬보카 서비스 활성화 완료 (userId: ${userId}, orderId: ${orderId})`);
    }
  } catch (err) {
    // 결제는 이미 완료됐으므로 에러를 throw하지 않고 로그만 기록
    console.error(`[vocaActivation] 예상치 못한 에러 (orderId: ${orderId}):`, err);
  }
}
