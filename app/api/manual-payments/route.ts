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
      course_id,
      amount,
      category,
      method,
      memo,
      paid_at,
    } = body as {
      student_id: string;
      course_id: string;
      amount: number;
      category: string;
      method: string;
      memo?: string;
      paid_at?: string;
    };

    // 필수 필드 검증
    if (!student_id) {
      return NextResponse.json({ error: '학생을 선택해주세요.' }, { status: 400 });
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

    // 학생/강좌 존재 여부 병렬 확인
    const [studentResult, courseResult] = await Promise.all([
      supabase.from('students').select('id').eq('id', student_id).single(),
      supabase.from('courses').select('id').eq('id', course_id).single(),
    ]);

    if (studentResult.error || !studentResult.data) {
      return NextResponse.json({ error: '존재하지 않는 학생입니다.' }, { status: 404 });
    }
    if (courseResult.error || !courseResult.data) {
      return NextResponse.json({ error: '존재하지 않는 강좌입니다.' }, { status: 404 });
    }

    // 수동 결제 생성
    const { data, error } = await supabase
      .from('manual_payments')
      .insert({
        student_id,
        course_id,
        amount,
        category,
        method,
        memo: memo || null,
        paid_at: paid_at || new Date().toISOString(),
      })
      .select(`
        *,
        students (id, student_name, parent_phone),
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
        students (id, student_name, parent_phone),
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
