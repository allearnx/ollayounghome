import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type MonthBucket = {
  month: string; // YYYY-MM
  gross: number;
  refunds: number;
  net: number;
  paidCount: number;
  cancelledCount: number;
};

type CategoryBucket = {
  category: string; // course category or 'unknown'
  gross: number;
  refunds: number;
  net: number;
  paidCount: number;
  cancelledCount: number;
};

function monthKeyFromKst(dateLike: string | null | undefined): string | null {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  // Convert to KST calendar month using Intl
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  if (!year || !month) return null;
  return `${year}-${month}`;
}

function lastNMonthsKeys(n: number): string[] {
  const keys: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    keys.push(`${y}-${m}`);
    d.setMonth(d.getMonth() - 1);
  }
  return keys.reverse(); // oldest -> newest
}

function monthRangeKst(month: string): { startIso: string; endIso: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) throw new Error('invalid_month');
  const year = Number(match[1]);
  const m = Number(match[2]); // 1-12
  if (!Number.isFinite(year) || !Number.isFinite(m) || m < 1 || m > 12) throw new Error('invalid_month');

  const startIso = new Date(`${month}-01T00:00:00+09:00`).toISOString();
  const nextMonth = m === 12 ? `${year + 1}-01` : `${year}-${String(m + 1).padStart(2, '0')}`;
  const endIso = new Date(`${nextMonth}-01T00:00:00+09:00`).toISOString();
  return { startIso, endIso };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();

    const months = lastNMonthsKeys(12);
    const first = months[0];
    const last = months[months.length - 1];
    const { startIso: rangeStart } = monthRangeKst(first);
    const { endIso: rangeEnd } = monthRangeKst(last);

    const monthMap = new Map<string, MonthBucket>();
    months.forEach((m) => {
      monthMap.set(m, { month: m, gross: 0, refunds: 0, net: 0, paidCount: 0, cancelledCount: 0 });
    });

    const catMap = new Map<string, CategoryBucket>();
    const ensureCat = (category: string) => {
      const key = category || 'unknown';
      const existing = catMap.get(key);
      if (existing) return existing;
      const fresh: CategoryBucket = { category: key, gross: 0, refunds: 0, net: 0, paidCount: 0, cancelledCount: 0 };
      catMap.set(key, fresh);
      return fresh;
    };

    // PG 결제(paid)와 수동 결제를 병렬로 조회 (삭제되지 않은 것만)
    const [paidResult, manualResult] = await Promise.all([
      supabase
        .from('payments')
        .select('amount, paid_at, course_id, courses(category)')
        .eq('status', 'paid')
        .is('deleted_at', null)
        .gte('paid_at', rangeStart)
        .lt('paid_at', rangeEnd),
      supabase
        .from('manual_payments')
        .select('amount, paid_at, category, course_id, courses(category)')
        .is('deleted_at', null)
        .gte('paid_at', rangeStart)
        .lt('paid_at', rangeEnd),
    ]);

    if (paidResult.error) {
      console.error('Admin reports paidErr:', paidResult.error);
      return NextResponse.json({ error: '매출 데이터를 불러올 수 없습니다.' }, { status: 500 });
    }

    if (manualResult.error) {
      console.error('Admin reports manualErr:', manualResult.error);
      return NextResponse.json({ error: '수동 결제 데이터를 불러올 수 없습니다.' }, { status: 500 });
    }

    // PG 결제 매출 집계
    (paidResult.data ?? []).forEach((r: any) => {
      const mk = monthKeyFromKst(r?.paid_at);
      if (!mk || !monthMap.has(mk)) return;
      const amount = Number(r?.amount ?? 0) || 0;
      const bucket = monthMap.get(mk)!;
      bucket.gross += amount;
      bucket.paidCount += 1;

      const category = r?.courses?.category ?? 'unknown';
      const cb = ensureCat(String(category));
      cb.gross += amount;
      cb.paidCount += 1;
    });

    // 수동 결제 매출 집계 (항상 paid 상태, 환불 없음)
    (manualResult.data ?? []).forEach((r: any) => {
      const mk = monthKeyFromKst(r?.paid_at);
      if (!mk || !monthMap.has(mk)) return;
      const amount = Number(r?.amount ?? 0) || 0;
      const bucket = monthMap.get(mk)!;
      bucket.gross += amount;
      bucket.paidCount += 1;

      // 수동 결제의 카테고리: manual_payments.category (TUITION/MATERIAL)를 사용하거나,
      // 연결된 course의 category를 사용
      const category = r?.courses?.category ?? r?.category ?? 'unknown';
      const cb = ensureCat(String(category));
      cb.gross += amount;
      cb.paidCount += 1;
    });

    // Cancelled (refunds). Prefer cancelled_at + cancelled_amount. (삭제되지 않은 것만)
    const { data: cancelledRows, error: cancelledErr } = await supabase
      .from('payments')
      .select('cancelled_at, cancelled_amount, amount, updated_at, course_id, courses(category)')
      .eq('status', 'cancelled')
      .is('deleted_at', null)
      .gte('cancelled_at', rangeStart)
      .lt('cancelled_at', rangeEnd);

    if (cancelledErr) {
      const msg = String((cancelledErr as any)?.message ?? '');
      // If schema isn't migrated yet, fallback to updated_at + amount. (삭제되지 않은 것만)
      if (/column .*cancelled_/i.test(msg)) {
        const { data: legacyRows, error: legacyErr } = await supabase
          .from('payments')
          .select('amount, updated_at, course_id, courses(category)')
          .eq('status', 'cancelled')
          .is('deleted_at', null)
          .gte('updated_at', rangeStart)
          .lt('updated_at', rangeEnd);
        if (legacyErr) {
          console.error('Admin reports legacy cancelledErr:', legacyErr);
          return NextResponse.json({ error: '환불 데이터를 불러올 수 없습니다.' }, { status: 500 });
        }
        (legacyRows ?? []).forEach((r: any) => {
          const mk = monthKeyFromKst(r?.updated_at);
          if (!mk || !monthMap.has(mk)) return;
          const refund = Number(r?.amount ?? 0) || 0;
          const bucket = monthMap.get(mk)!;
          bucket.refunds += refund;
          bucket.cancelledCount += 1;

          const category = r?.courses?.category ?? 'unknown';
          const cb = ensureCat(String(category));
          cb.refunds += refund;
          cb.cancelledCount += 1;
        });
      } else {
        console.error('Admin reports cancelledErr:', cancelledErr);
        return NextResponse.json({ error: '환불 데이터를 불러올 수 없습니다.' }, { status: 500 });
      }
    } else {
      (cancelledRows ?? []).forEach((r: any) => {
        const mk = monthKeyFromKst(r?.cancelled_at);
        if (!mk || !monthMap.has(mk)) return;
        const refund = Number(r?.cancelled_amount ?? r?.amount ?? 0) || 0;
        const bucket = monthMap.get(mk)!;
        bucket.refunds += refund;
        bucket.cancelledCount += 1;

        const category = r?.courses?.category ?? 'unknown';
        const cb = ensureCat(String(category));
        cb.refunds += refund;
        cb.cancelledCount += 1;
      });
    }

    // finalize net
    monthMap.forEach((b) => {
      b.net = b.gross - b.refunds;
    });
    catMap.forEach((b) => {
      b.net = b.gross - b.refunds;
    });

    const monthsOut = months.map((m) => monthMap.get(m)!);
    const byCategory = Array.from(catMap.values()).sort((a, b) => b.net - a.net);

    return NextResponse.json({
      range: { startIso: rangeStart, endIso: rangeEnd },
      months: monthsOut,
      byCategory,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

