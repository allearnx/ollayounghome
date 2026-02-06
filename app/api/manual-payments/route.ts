import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - 수동 결제 생성
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();

    const body = await request.json();
    const {
      student_id,
      student_name,
      parent_phone,
      course_id,
      amount,
      category,
      method,
      memo,
      paid_at,
    } = body as {
      student_id?: string;
      student_name?: string;
      parent_phone?: string;
      course_id: string;
      amount: number;
      category: string;
      method: string;
      memo?: string;
      paid_at?: string;
    };

    // 학생 정보 검증: student_id 또는 (student_name + parent_phone) 필수
    if (!student_id && (!student_name || !parent_phone)) {
      return NextResponse.json({ error: '학생 정보를 입력해주세요.' }, { status: 400 });
    }
    if (!course_id) {
      return NextResponse.json({ error: '강좌를 선택해주세요.' }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: '유효한 금액을 입력해주세요.' }, { status: 400 });
    }
    if (!category || !['TUITION', 'MATERIAL'].includes(category)) {
      return NextResponse.json({ error: '유효한 카테고리를 선택해주세요.' }, { status: 400 });
    }
    if (!method || !['CASH', 'PAYMENT_TEACHER', 'TRANSFER'].includes(method)) {
      return NextResponse.json({ error: '유효한 결제수단을 선택해주세요.' }, { status: 400 });
    }

    // 강좌 존재 여부 확인 (학생은 student_id가 있을 때만 검증)
    const validationPromises: Promise<unknown>[] = [
      supabase.from('courses').select('id').eq('id', course_id).single(),
    ];
    
    let resolvedStudentName = student_name?.trim();
    let resolvedParentPhone = parent_phone?.trim();
    
    if (student_id) {
      validationPromises.push(
        supabase.from('students').select('id, student_name, parent_phone').eq('id', student_id).single()
      );
    }

    const results = await Promise.all(validationPromises);
    const courseResult = results[0] as { error: unknown; data: unknown };
    
    if (courseResult.error || !courseResult.data) {
      return NextResponse.json({ error: '존재하지 않는 강좌입니다.' }, { status: 404 });
    }

    // 기존 학생 선택 시: students 테이블에서 이름/연락처 가져오기
    if (student_id && results[1]) {
      const studentResult = results[1] as { error: unknown; data: { id: string; student_name: string; parent_phone: string } | null };
      if (studentResult.error || !studentResult.data) {
        return NextResponse.json({ error: '존재하지 않는 학생입니다.' }, { status: 404 });
      }
      // 기존 학생의 정보로 채우기
      resolvedStudentName = studentResult.data.student_name;
      resolvedParentPhone = studentResult.data.parent_phone;
    }

    // 수동 결제 생성 (student_name, parent_phone 직접 저장)
    const { data, error } = await supabase
      .from('manual_payments')
      .insert({
        student_id: student_id || null,
        student_name: resolvedStudentName,
        parent_phone: resolvedParentPhone,
        course_id,
        amount,
        category,
        method,
        memo: memo || null,
        paid_at: paid_at || new Date().toISOString(),
      })
      .select(`
        *,
        courses (id, title, price)
      `)
      .single();

    if (error) {
      console.error('Manual payment creation error:', error);
      return NextResponse.json({ error: '수동 결제 생성에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Manual payment API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// GET - 수동 결제 목록 조회
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '50', 10), 1),
      200
    );

    const { data, error } = await supabase
      .from('manual_payments')
      .select(`
        *,
        courses (id, title, price)
      `)
      .is('deleted_at', null)
      .order('paid_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Manual payments fetch error:', error);
      return NextResponse.json({ error: '수동 결제 목록을 불러올 수 없습니다.' }, { status: 500 });
    }

    return NextResponse.json({ payments: data || [] });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Manual payments API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
