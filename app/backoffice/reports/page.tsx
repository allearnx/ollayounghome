'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase, CATEGORY_LABELS } from '@/lib/supabase';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [report, setReport] = useState<{
    months: Array<{
      month: string;
      gross: number;
      refunds: number;
      net: number;
      paidCount: number;
      cancelledCount: number;
    }>;
    byCategory: Array<{
      category: string;
      gross: number;
      refunds: number;
      net: number;
      paidCount: number;
      cancelledCount: number;
    }>;
  } | null>(null);

  const formatKRW = (n: number) => `₩${new Intl.NumberFormat('ko-KR').format(n)}`;

  const currentMonth = useMemo(() => {
    if (!report?.months?.length) return null;
    return report.months[report.months.length - 1];
  }, [report]);

  const prevMonth = useMemo(() => {
    if (!report?.months?.length || report.months.length < 2) return null;
    return report.months[report.months.length - 2];
  }, [report]);

  const mom = useMemo(() => {
    if (!currentMonth || !prevMonth) return null;
    const diff = currentMonth.net - prevMonth.net;
    const pct = prevMonth.net === 0 ? null : (diff / prevMonth.net) * 100;
    return { diff, pct };
  }, [currentMonth, prevMonth]);

  const fetchReport = async () => {
    setIsLoading(true);
    setError('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('관리자 인증이 필요합니다.');

      const res = await fetch('/api/admin/reports', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '매출 리포트를 불러올 수 없습니다.');
      setReport(data);
    } catch (e) {
      setReport(null);
      setError(e instanceof Error ? e.message : '매출 리포트를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxNet = useMemo(() => {
    const vals = report?.months?.map((m) => m.net) ?? [];
    return Math.max(1, ...vals);
  }, [report]);

  const maxCatNet = useMemo(() => {
    const vals = report?.byCategory?.map((c) => c.net) ?? [];
    return Math.max(1, ...vals);
  }, [report]);

  return (
    <AdminLayout requiredRole="admin">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📊 매출 리포트</h2>
        <p className="text-slate-500 mt-1">매출 현황을 분석하고 리포트를 확인합니다.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700 font-medium">{error}</p>
          <button
            onClick={fetchReport}
            className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-violet-100 mb-1">이번 달 총매출</p>
          <p className="text-3xl font-bold">
            {isLoading ? '—' : formatKRW(currentMonth?.gross ?? 0)}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-sm text-violet-100">
              {isLoading
                ? '불러오는 중...'
                : mom?.pct == null
                  ? '전월 대비 —'
                  : `전월 대비 ${mom.pct >= 0 ? '+' : ''}${mom.pct.toFixed(1)}%`}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">이번 달 환불</p>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? '—' : formatKRW(currentMonth?.refunds ?? 0)}
          </p>
          <p className="text-xs text-slate-500 mt-4">
            {isLoading ? '' : `환불 ${currentMonth?.cancelledCount ?? 0}건`}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">이번 달 순매출</p>
          <p className="text-2xl font-bold text-slate-800">
            {isLoading ? '—' : formatKRW(currentMonth?.net ?? 0)}
          </p>
          <p className="text-xs text-slate-500 mt-4">
            {isLoading ? '' : `결제 ${currentMonth?.paidCount ?? 0}건`}
          </p>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 월별 매출 차트 */}
        <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">월별 매출 추이</h3>
          </div>
          <div className="p-6">
            <div className="h-64 bg-slate-50 rounded-lg p-4">
              {isLoading || !report?.months?.length ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500">불러오는 중...</div>
              ) : (
                <div className="h-full flex items-end gap-2">
                  {report.months.map((m) => {
                    const h = Math.max(2, Math.round((m.net / maxNet) * 220));
                    const label = m.month.slice(5);
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          title={`${m.month}\n총: ${formatKRW(m.gross)}\n환불: ${formatKRW(m.refunds)}\n순: ${formatKRW(m.net)}`}
                          className="w-full rounded-md bg-violet-500/70 hover:bg-violet-600 transition-colors"
                          style={{ height: `${h}px` }}
                        />
                        <span className="text-[11px] text-slate-500">{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 강의별 매출 */}
        <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">카테고리별 매출</h3>
          </div>
          <div className="p-6">
            <div className="h-64 bg-slate-50 rounded-lg p-4 overflow-auto">
              {isLoading || !report?.byCategory?.length ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500">불러오는 중...</div>
              ) : (
                <div className="space-y-3">
                  {report.byCategory.map((c) => {
                    const w = Math.max(2, Math.round((c.net / maxCatNet) * 100));
                    const label =
                      // CATEGORY_LABELS comes from domain export via supabase.ts
                      (CATEGORY_LABELS as any)?.[c.category] ?? (c.category === 'unknown' ? '기타' : c.category);
                    return (
                      <div key={c.category} className="bg-white rounded-lg border border-slate-100 p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-800">{label}</div>
                          <div className="text-sm font-bold text-slate-800">{formatKRW(c.net)}</div>
                        </div>
                        <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-2 bg-emerald-500" style={{ width: `${w}%` }} />
                        </div>
                        <div className="mt-2 text-xs text-slate-500 flex gap-3">
                          <span>총 {formatKRW(c.gross)}</span>
                          <span className="text-red-600">환불 {formatKRW(c.refunds)}</span>
                          <span>결제 {c.paidCount}건</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 리포트 테이블 */}
      <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">상세 매출 내역</h3>
          <button
            onClick={fetchReport}
            className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
          >
            새로고침
          </button>
        </div>
        {isLoading || !report?.months?.length ? (
          <div className="text-center py-16 text-sm text-slate-500">불러오는 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">월</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">총매출</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">환불</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">순매출</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">결제/환불(건)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.months.map((m) => (
                  <tr key={m.month} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{m.month}</td>
                    <td className="px-6 py-4 text-right text-slate-800">{formatKRW(m.gross)}</td>
                    <td className="px-6 py-4 text-right text-red-600">{formatKRW(m.refunds)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">{formatKRW(m.net)}</td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {m.paidCount} / {m.cancelledCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}



