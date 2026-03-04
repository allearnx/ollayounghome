export type MonthBucket = {
  month: string;
  gross: number;
  refunds: number;
  net: number;
  expenses: number;
  profit: number;
  paidCount: number;
  cancelledCount: number;
};

export function monthKeyFromKst(dateLike: string | null | undefined): string | null {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
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

export function lastNMonthsKeys(n: number): string[] {
  const keys: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    keys.push(`${y}-${m}`);
    d.setMonth(d.getMonth() - 1);
  }
  return keys.reverse();
}

export function monthRangeKst(month: string): { startIso: string; endIso: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) throw new Error('invalid_month');
  const year = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(m) || m < 1 || m > 12) throw new Error('invalid_month');

  const startIso = new Date(`${month}-01T00:00:00+09:00`).toISOString();
  const nextMonth = m === 12 ? `${year + 1}-01` : `${year}-${String(m + 1).padStart(2, '0')}`;
  const endIso = new Date(`${nextMonth}-01T00:00:00+09:00`).toISOString();
  return { startIso, endIso };
}

export function finalizeMonthBucket(bucket: MonthBucket) {
  return {
    ...bucket,
    net: bucket.gross - bucket.refunds,
    profit: bucket.gross - bucket.refunds - bucket.expenses,
  };
}
