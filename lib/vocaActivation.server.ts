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

    // 1. Supabase Auth에 계정 생성 (이미 있으면 기존 계정 사용)
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: phone.replace(/\D/g, ''), // 숫자만 추출 (010-xxxx-xxxx → 010xxxxxxxx)
      email_confirm: true,
      user_metadata: { name, phone },
    });

    if (createError) {
      // 이미 가입된 이메일인 경우 기존 유저 ID 조회
      if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);
        if (!existingUser) {
          console.error(`[vocaActivation] 기존 유저 조회 실패 (orderId: ${orderId}):`, createError);
          return;
        }
        userId = existingUser.id;
        console.log(`[vocaActivation] 기존 계정 사용 (email: ${email}, userId: ${userId})`);
      } else {
        console.error(`[vocaActivation] Auth 계정 생성 실패 (orderId: ${orderId}):`, createError);
        return;
      }
    } else {
      userId = authData.user.id;
      console.log(`[vocaActivation] 신규 계정 생성 완료 (email: ${email}, userId: ${userId})`);
    }

    // 2. users 테이블에 프로필 생성 (이미 있으면 무시)
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: userId,
        email,
        full_name: name,
        role: 'student',
        is_active: true,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

    if (upsertError) {
      console.error(`[vocaActivation] users 테이블 upsert 실패 (orderId: ${orderId}):`, upsertError);
    }

    // 3. voca 서비스 활성화 (중복 삽입 방지)
    const { data: existing } = await supabase
      .from('service_assignments')
      .select('id')
      .eq('student_id', userId)
      .eq('service', 'voca')
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      console.log(`[vocaActivation] 이미 활성화된 voca 서비스 (userId: ${userId})`);
      return;
    }

    const { error: assignError } = await supabase.from('service_assignments').insert({
      student_id: userId,
      service: 'voca',
      assigned_by: userId,
      source: 'subscription',
      is_active: true,
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
