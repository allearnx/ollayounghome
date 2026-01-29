import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';

function parseMonth(month: string | null): { key: string; startIso: string; endIso: string } {
  // month: YYYY-MM
  const now = new Date();
  const fallbackKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const key = (month ?? '').trim() || fallbackKey;

  const match = /^(\d{4})-(\d{2})$/.exec(key);
  if (!match) {
    throw new Error('invalid_month');
  }
  const year = Number(match[1]);
  const m = Number(match[2]); // 1-12
  if (!Number.isFinite(year) || !Number.isFinite(m) || m < 1 || m > 12) {
    throw new Error('invalid_month');
  }

  // Use KST boundaries to match Korean business expectations.
  const startIso = new Date(`${key}-01T00:00:00+09:00`).toISOString();
  const nextMonth = m === 12 ? `${year + 1}-01` : `${year}-${String(m + 1).padStart(2, '0')}`;
  const endIso = new Date(`${nextMonth}-01T00:00:00+09:00`).toISOString();
  return { key, startIso, endIso };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();

    const { key: month, startIso, endIso } = parseMonth(new URL(request.url).searchParams.get('month'));

    // paid metrics by paid_at within month (KST month boundaries)
    const { data: paidRows, error: paidErr } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('paid_at', startIso)
      .lt('paid_at', endIso);

    if (paidErr) {
      console.error('Admin revenue paidErr:', paidErr);
      return NextResponse.json({ error: '수납 데이터를 불러올 수 없습니다.' }, { status: 500 });
    }

    const monthPaidCount = (paidRows ?? []).length;
    const monthPaidTotal = (paidRows ?? []).reduce((sum, r) => sum + (r?.amount ?? 0), 0);

    // cancelled/refund metrics:
    // Prefer exact cancelled_at + cancelled_amount (derived from Toss cancels[].cancelAmount).
    // Fallback to older rows using updated_at + amount.
    let monthCancelledTotal = 0;
    let monthCancelledCount = 0;
    const { data: cancelledRows, error: cancelledErr } = await supabase
      .from('payments')
      .select('cancelled_at, cancelled_amount, amount, updated_at')
      .eq('status', 'cancelled')
      .gte('cancelled_at', startIso)
      .lt('cancelled_at', endIso);

    if (cancelledErr) {
      const msg = String((cancelledErr as any)?.message ?? '');
      // If schema isn't migrated yet, fallback to legacy calculation.
      if (/column .*cancelled_/i.test(msg)) {
        const { data: legacyRows, error: legacyErr } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'cancelled')
          .gte('updated_at', startIso)
          .lt('updated_at', endIso);
        if (legacyErr) {
          console.error('Admin revenue legacy cancelledErr:', legacyErr);
          return NextResponse.json({ error: '취소/환불 데이터를 불러올 수 없습니다.' }, { status: 500 });
        }
        monthCancelledCount = (legacyRows ?? []).length;
        monthCancelledTotal = (legacyRows ?? []).reduce((sum, r) => sum + (r?.amount ?? 0), 0);
      } else {
        console.error('Admin revenue cancelledErr:', cancelledErr);
        return NextResponse.json({ error: '취소/환불 데이터를 불러올 수 없습니다.' }, { status: 500 });
      }
    } else {
      monthCancelledCount = (cancelledRows ?? []).length;
      monthCancelledTotal = (cancelledRows ?? []).reduce((sum, r: any) => {
        const v = Number(r?.cancelled_amount ?? r?.amount ?? 0) || 0;
        return sum + v;
      }, 0);
    }

    // total students (not month-specific)
    const { count: totalStudents, error: studentsErr } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true });

    if (studentsErr) {
      console.error('Admin revenue studentsErr:', studentsErr);
      return NextResponse.json({ error: '학생 데이터를 불러올 수 없습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      month,
      range: { startIso, endIso },
      monthPaidTotal,
      monthPaidCount,
      monthCancelledTotal,
      monthCancelledCount,
      totalStudents: totalStudents ?? 0,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === 'invalid_month') {
      return NextResponse.json({ error: 'month 파라미터 형식이 올바르지 않습니다. (YYYY-MM)' }, { status: 400 });
    }
    console.error('Admin revenue error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

