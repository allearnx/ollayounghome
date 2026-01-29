'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';

export default function RevenuePage() {
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [metrics, setMetrics] = useState<{
    month: string;
    monthPaidTotal: number;
    monthPaidCount: number;
    monthCancelledTotal: number;
    monthCancelledCount: number;
    totalStudents: number;
  } | null>(null);

  const monthOptions = useMemo(() => {
    // last 12 months (including current)
    const opts: Array<{ value: string; label: string }> = [];
    const d = new Date();
    d.setDate(1);
    for (let i = 0; i < 12; i++) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const value = `${y}-${m}`;
      opts.push({ value, label: `${y}년 ${Number(m)}월` });
      d.setMonth(d.getMonth() - 1);
    }
    return opts;
  }, []);

  const formatKRW = (n: number) => `₩${new Intl.NumberFormat('ko-KR').format(n)}`;

  const fetchMetrics = async (targetMonth: string) => {
    setIsLoading(true);
    setError('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`/api/admin/revenue?month=${encodeURIComponent(targetMonth)}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || '수납 데이터를 불러오지 못했습니다.');
      }

      setMetrics(data);
    } catch (e) {
      setMetrics(null);
      setError(e instanceof Error ? e.message : '수납 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  return (
    <AdminLayout requiredRole="admin">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">💰 수납 현황</h2>
        <p className="text-slate-500 mt-1">학생별 수납 상태를 확인하고 관리합니다.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">이번 달 수납</p>
          <p className="text-2xl font-bold text-slate-800">
            {isLoading ? '—' : formatKRW(metrics?.monthPaidTotal ?? 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isLoading ? '불러오는 중...' : `결제 ${metrics?.monthPaidCount ?? 0}건`}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">이번 달 결제 건수</p>
          <p className="text-2xl font-bold text-slate-800">
            {isLoading ? '—' : `${metrics?.monthPaidCount ?? 0}건`}
          </p>
          <p className="text-xs text-slate-500 mt-1">승인 기준(`paid_at`)</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">이번 달 취소/환불</p>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? '—' : formatKRW(metrics?.monthCancelledTotal ?? 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isLoading ? '' : `취소 ${metrics?.monthCancelledCount ?? 0}건`}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">총 학생 수</p>
          <p className="text-2xl font-bold text-slate-800">
            {isLoading ? '—' : `${metrics?.totalStudents ?? 0}명`}
          </p>
          <p className="text-xs text-slate-500 mt-1">누적 등록 기준</p>
        </div>
      </div>

      {/* 수납 현황 테이블 */}
      <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">학생별 수납 현황</h3>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-300"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="p-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <button
                onClick={() => fetchMetrics(month)}
                className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-800 mb-2">요약</p>
            <ul className="space-y-1">
              <li>
                이번 달 수납: <strong>{isLoading ? '—' : formatKRW(metrics?.monthPaidTotal ?? 0)}</strong>
              </li>
              <li>
                결제 건수: <strong>{isLoading ? '—' : `${metrics?.monthPaidCount ?? 0}건`}</strong>
              </li>
              <li>
                취소/환불(추정):{' '}
                <strong className="text-red-700">{isLoading ? '—' : formatKRW(metrics?.monthCancelledTotal ?? 0)}</strong>
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              * 취소/환불 금액은 `cancelled_at` 기준으로 집계되며, `cancelled_amount`(토스 취소금액 합산)가 있으면 그 값을 사용합니다.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}



