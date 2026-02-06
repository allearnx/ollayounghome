import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface IntegratedPayment {
  id: string;
  type: 'PG' | 'MANUAL';
  amount: number;
  status: string;
  method: string | null;
  paid_at: string | null;
  created_at: string;
  student: { id: string; student_name: string; parent_phone: string } | null;
  course: { id: string; title: string; price: number } | null;
  // PG 전용 필드
  order_id?: string;
  payment_key?: string;
  receipt_url?: string;
  customer_name?: string;
  customer_phone?: string;
  // 수동 결제 전용 필드
  category?: string;
  memo?: string;
}

// GET - PG 결제 + 수동 결제 통합 조회
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '100', 10), 1),
      500
    );

    // PG 결제와 수동 결제를 병렬로 조회
    const [pgResult, manualResult] = await Promise.all([
      supabase
        .from('payments')
        .select(`
          id,
          created_at,
          order_id,
          payment_key,
          amount,
          status,
          method,
          receipt_url,
          paid_at,
          customer_name,
          customer_phone,
          students (id, student_name, parent_phone),
          courses (id, title, price)
        `)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('manual_payments')
        .select(`
          id,
          created_at,
          amount,
          category,
          method,
          memo,
          paid_at,
          students (id, student_name, parent_phone),
          courses (id, title, price)
        `)
        .order('paid_at', { ascending: false })
        .limit(limit),
    ]);

    if (pgResult.error) {
      console.error('PG payments fetch error:', pgResult.error);
      return NextResponse.json({ error: 'PG 결제 내역을 불러올 수 없습니다.' }, { status: 500 });
    }

    if (manualResult.error) {
      console.error('Manual payments fetch error:', manualResult.error);
      return NextResponse.json({ error: '수동 결제 내역을 불러올 수 없습니다.' }, { status: 500 });
    }

    // 헬퍼 함수: Supabase의 embedded relation 결과를 단일 객체로 변환
    const extractSingleRelation = <T>(data: T | T[] | null): T | null => {
      if (!data) return null;
      if (Array.isArray(data)) return data[0] || null;
      return data;
    };

    // PG 결제 데이터 변환
    const pgPayments: IntegratedPayment[] = (pgResult.data || []).map((p) => ({
      id: p.id,
      type: 'PG' as const,
      amount: p.amount,
      status: p.status,
      method: p.method,
      paid_at: p.paid_at,
      created_at: p.created_at,
      student: extractSingleRelation(p.students) as IntegratedPayment['student'],
      course: extractSingleRelation(p.courses) as IntegratedPayment['course'],
      order_id: p.order_id,
      payment_key: p.payment_key,
      receipt_url: p.receipt_url,
      customer_name: p.customer_name,
      customer_phone: p.customer_phone,
    }));

    // 수동 결제 데이터 변환
    const manualPayments: IntegratedPayment[] = (manualResult.data || []).map((p) => ({
      id: p.id,
      type: 'MANUAL' as const,
      amount: p.amount,
      status: 'paid', // 수동 결제는 항상 완료 상태
      method: p.method,
      paid_at: p.paid_at,
      created_at: p.created_at,
      student: extractSingleRelation(p.students) as IntegratedPayment['student'],
      course: extractSingleRelation(p.courses) as IntegratedPayment['course'],
      category: p.category,
      memo: p.memo,
    }));

    // 두 데이터를 합치고 날짜순 정렬 (paid_at 우선, 없으면 created_at)
    const integrated = [...pgPayments, ...manualPayments].sort((a, b) => {
      const dateA = new Date(a.paid_at || a.created_at).getTime();
      const dateB = new Date(b.paid_at || b.created_at).getTime();
      return dateB - dateA; // 최신순
    });

    // limit 적용
    const result = integrated.slice(0, limit);

    return NextResponse.json({
      payments: result,
      summary: {
        total: result.length,
        pg_count: pgPayments.length,
        manual_count: manualPayments.length,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Integrated payments API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
