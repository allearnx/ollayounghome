'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { CATEGORY_LABELS } from '@/lib/domain';
import { adminFetch } from '@/lib/adminApi.client';
import { formatKRW } from '@/lib/utils';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [report, setReport] = useState<{
    months: Array<{
      month: string;
      gross: number;
      refunds: number;
      net: number;
      expenses: number;
      profit: number;
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
  const [expenses, setExpenses] = useState<Array<{
    id: string;
    expense_date: string;
    teacher_name: string;
    pay_type: 'HOURLY' | 'PERCENT';
    class_hours: number;
    hourly_rate: number;
    tuition_per_student: number | null;
    student_count: number | null;
    percent_rate: number | null;
    insurance_applicable: boolean | null;
    insurance_amount: number | null;
    gross_amount: number;
    tax_amount: number;
    net_amount: number;
  }>>([]);
  const [expenseForm, setExpenseForm] = useState({
    expense_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }),
    teacher_name: '',
    pay_type: 'HOURLY' as 'HOURLY' | 'PERCENT',
    class_hours: '',
    hourly_rate: '',
    tuition_per_student: '',
    student_count: '',
    percent_rate: '',
    insurance_applicable: false,
    insurance_amount: '0',
  });
  const [hourCalc, setHourCalc] = useState({
    sessions_per_week: '',
    weeks_count: '',
    minutes_per_session: '',
  });
  const [isManualHours, setIsManualHours] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  const parseNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const computeExpenseAmounts = (form: typeof expenseForm) => {
    const hours = parseNumber(form.class_hours);
    const rate = parseNumber(form.hourly_rate);
    const tuition = parseNumber(form.tuition_per_student);
    const students = parseNumber(form.student_count);
    const percent = parseNumber(form.percent_rate) / 100;
    const gross =
      form.pay_type === 'PERCENT'
        ? Math.round(tuition * students * percent)
        : Math.round(hours * rate);
    const tax = Math.round(gross * 0.033);
    const insurance = form.insurance_applicable ? parseNumber(form.insurance_amount) : 0;
    const net = gross - tax - insurance;
    return { gross, tax, insurance, net };
  };

  const computedMinutes =
    parseNumber(hourCalc.sessions_per_week) *
    parseNumber(hourCalc.weeks_count) *
    parseNumber(hourCalc.minutes_per_session);
  const computedHours = Math.round((computedMinutes / 60) * 100) / 100;

  useEffect(() => {
    if (expenseForm.pay_type !== 'HOURLY') return;
    if (isManualHours) return;
    if (!computedHours || computedHours <= 0) return;
    setExpenseForm((prev) => ({ ...prev, class_hours: String(computedHours) }));
  }, [computedHours, expenseForm.pay_type, isManualHours]);

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
      const res = await adminFetch('/api/admin/reports');
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

  const fetchExpenses = async () => {
    try {
      const res = await adminFetch('/api/admin/teacher-expenses?limit=200', {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '강사료 내역을 불러올 수 없습니다.');
      setExpenses(data?.expenses || []);
    } catch (e) {
      console.error('Teacher expenses fetch error:', e);
      setExpenses([]);
    }
  };

  const saveExpense = async () => {
    if (!expenseForm.expense_date) {
      alert('날짜를 입력해주세요.');
      return;
    }
    if (!expenseForm.teacher_name.trim()) {
      alert('선생님 이름을 입력해주세요.');
      return;
    }
    const hours = parseNumber(expenseForm.class_hours);
    const rate = parseNumber(expenseForm.hourly_rate);
    const tuition = parseNumber(expenseForm.tuition_per_student);
    const students = parseNumber(expenseForm.student_count);
    const percent = parseNumber(expenseForm.percent_rate);
    const insuranceAmount = parseNumber(expenseForm.insurance_amount);

    if (expenseForm.pay_type === 'HOURLY') {
      if (!hours || hours <= 0) {
        alert('수업 시간을 입력해주세요.');
        return;
      }
      if (!rate || rate <= 0) {
        alert('시간당 페이를 입력해주세요.');
        return;
      }
    } else {
      if (!tuition || tuition <= 0) {
        alert('수강료를 입력해주세요.');
        return;
      }
      if (!students || students <= 0) {
        alert('인원을 입력해주세요.');
        return;
      }
      if (!percent || percent <= 0) {
        alert('비율(%)을 입력해주세요.');
        return;
      }
    }

    setIsSavingExpense(true);
    try {
      const payload = {
        expense_date: expenseForm.expense_date,
        teacher_name: expenseForm.teacher_name.trim(),
        pay_type: expenseForm.pay_type,
        class_hours: expenseForm.pay_type === 'HOURLY' ? hours : null,
        hourly_rate: expenseForm.pay_type === 'HOURLY' ? rate : null,
        tuition_per_student: expenseForm.pay_type === 'PERCENT' ? tuition : null,
        student_count: expenseForm.pay_type === 'PERCENT' ? students : null,
        percent_rate: expenseForm.pay_type === 'PERCENT' ? percent / 100 : null,
        insurance_applicable: expenseForm.insurance_applicable,
        insurance_amount: expenseForm.insurance_applicable ? insuranceAmount : 0,
      };

      const url = editingExpenseId
        ? `/api/admin/teacher-expenses/${editingExpenseId}`
        : '/api/admin/teacher-expenses';
      const method = editingExpenseId ? 'PATCH' : 'POST';
      const res = await adminFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '강사료 저장에 실패했습니다.');

      setExpenseForm({
        expense_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }),
        teacher_name: '',
        pay_type: 'HOURLY',
        class_hours: '',
        hourly_rate: '',
        tuition_per_student: '',
        student_count: '',
        percent_rate: '',
        insurance_applicable: false,
        insurance_amount: '0',
      });
      setHourCalc({ sessions_per_week: '', weeks_count: '', minutes_per_session: '' });
      setIsManualHours(false);
      setEditingExpenseId(null);
      fetchExpenses();
      fetchReport();
    } catch (e) {
      alert(e instanceof Error ? e.message : '강사료 저장에 실패했습니다.');
    } finally {
      setIsSavingExpense(false);
    }
  };

  const startEditExpense = (expense: (typeof expenses)[number]) => {
    setEditingExpenseId(expense.id);
    setIsManualHours(true);
    setExpenseForm({
      expense_date: expense.expense_date,
      teacher_name: expense.teacher_name,
      pay_type: expense.pay_type || 'HOURLY',
      class_hours: expense.class_hours ? String(expense.class_hours) : '',
      hourly_rate: expense.hourly_rate ? String(expense.hourly_rate) : '',
      tuition_per_student: expense.tuition_per_student ? String(expense.tuition_per_student) : '',
      student_count: expense.student_count ? String(expense.student_count) : '',
      percent_rate: expense.percent_rate ? String(Math.round(expense.percent_rate * 10000) / 100) : '',
      insurance_applicable: Boolean(expense.insurance_applicable),
      insurance_amount: String(expense.insurance_amount ?? 0),
    });
    setHourCalc({ sessions_per_week: '', weeks_count: '', minutes_per_session: '' });
  };

  const cancelEditExpense = () => {
    setEditingExpenseId(null);
    setExpenseForm({
      expense_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }),
      teacher_name: '',
      pay_type: 'HOURLY',
      class_hours: '',
      hourly_rate: '',
      tuition_per_student: '',
      student_count: '',
      percent_rate: '',
      insurance_applicable: false,
      insurance_amount: '0',
    });
    setHourCalc({ sessions_per_week: '', weeks_count: '', minutes_per_session: '' });
    setIsManualHours(false);
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('강사료 내역을 삭제할까요?')) return;
    try {
      const res = await adminFetch(`/api/admin/teacher-expenses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '강사료 삭제에 실패했습니다.');
      fetchExpenses();
      fetchReport();
    } catch (e) {
      alert(e instanceof Error ? e.message : '강사료 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchReport();
    fetchExpenses();
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

  const formAmounts = computeExpenseAmounts(expenseForm);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">이번 달 지출</p>
          <p className="text-2xl font-bold text-slate-800">
            {isLoading ? '—' : formatKRW(currentMonth?.expenses ?? 0)}
          </p>
          <p className="text-xs text-slate-500 mt-4">
            {isLoading ? '' : `순이익 ${formatKRW(currentMonth?.profit ?? 0)}`}
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

      {/* 강사료 입력/목록 */}
      <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">강사료 입력</h3>
          <p className="text-sm text-slate-500 mt-1">수업 시간과 시간당 페이를 입력하면 자동 계산됩니다.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">날짜</label>
              <input
                type="date"
                value={expenseForm.expense_date}
                onChange={(e) => setExpenseForm((prev) => ({ ...prev, expense_date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">선생님 이름</label>
              <input
                type="text"
                value={expenseForm.teacher_name}
                onChange={(e) => setExpenseForm((prev) => ({ ...prev, teacher_name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">지급 방식</label>
              <select
                value={expenseForm.pay_type}
                onChange={(e) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    pay_type: e.target.value as 'HOURLY' | 'PERCENT',
                  }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
              >
                <option value="HOURLY">시간당</option>
                <option value="PERCENT">비율제</option>
              </select>
            </div>
            {expenseForm.pay_type === 'HOURLY' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">수업 시간</label>
                  <input
                    type="number"
                    step="0.5"
                    value={expenseForm.class_hours}
                    onChange={(e) => {
                      setIsManualHours(true);
                      setExpenseForm((prev) => ({ ...prev, class_hours: e.target.value }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">시간당 페이</label>
                  <input
                    type="number"
                    value={expenseForm.hourly_rate}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, hourly_rate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">자동 계산</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="주당 횟수"
                      value={hourCalc.sessions_per_week}
                      onChange={(e) => {
                        setIsManualHours(false);
                        setHourCalc((prev) => ({ ...prev, sessions_per_week: e.target.value }));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                    />
                    <input
                      type="number"
                      placeholder="주수"
                      value={hourCalc.weeks_count}
                      onChange={(e) => {
                        setIsManualHours(false);
                        setHourCalc((prev) => ({ ...prev, weeks_count: e.target.value }));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                    />
                    <input
                      type="number"
                      placeholder="회당 분"
                      value={hourCalc.minutes_per_session}
                      onChange={(e) => {
                        setIsManualHours(false);
                        setHourCalc((prev) => ({ ...prev, minutes_per_session: e.target.value }));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    총 {computedMinutes || 0}분 = {computedHours || 0}시간
                    {isManualHours && (
                      <button
                        type="button"
                        onClick={() => setIsManualHours(false)}
                        className="ml-2 text-violet-600 hover:text-violet-700"
                      >
                        자동 계산 사용
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">수강료</label>
                  <input
                    type="number"
                    value={expenseForm.tuition_per_student}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, tuition_per_student: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">인원</label>
                  <input
                    type="number"
                    value={expenseForm.student_count}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, student_count: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">비율(%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={expenseForm.percent_rate}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, percent_rate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                  />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">4대보험</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={expenseForm.insurance_applicable}
                    onChange={(e) =>
                      setExpenseForm((prev) => ({ ...prev, insurance_applicable: e.target.checked }))
                    }
                    className="h-4 w-4 text-violet-500 border-gray-300 rounded"
                  />
                  대상
                </label>
                <input
                  type="number"
                  value={expenseForm.insurance_amount}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, insurance_amount: e.target.value }))}
                  disabled={!expenseForm.insurance_applicable}
                  className="w-full max-w-[200px] px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-400 disabled:bg-slate-100"
                />
                <span className="text-xs text-slate-500">기본 0원</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <div>총액: <strong>{formatKRW(formAmounts.gross || 0)}</strong></div>
            <div>세금 3.3%: <strong>{formatKRW(formAmounts.tax || 0)}</strong></div>
            <div>4대보험: <strong>{formatKRW(formAmounts.insurance || 0)}</strong></div>
            <div>실 지급금: <strong>{formatKRW(formAmounts.net || 0)}</strong></div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveExpense}
              disabled={isSavingExpense}
              className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50"
            >
              {editingExpenseId ? '수정 저장' : '추가'}
            </button>
            {editingExpenseId && (
              <button
                onClick={cancelEditExpense}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                취소
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-slate-100">
          {expenses.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">등록된 강사료가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">날짜</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">선생님</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">방식</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">기준</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">총액</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">세금</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">4대보험</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">실지급</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-700">{expense.expense_date}</td>
                      <td className="px-5 py-3 text-slate-800 font-medium">{expense.teacher_name}</td>
                      <td className="px-5 py-3 text-slate-700">
                        {expense.pay_type === 'PERCENT' ? '비율제' : '시간당'}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700">
                        {expense.pay_type === 'PERCENT'
                          ? `${formatKRW(expense.tuition_per_student || 0)} × ${expense.student_count || 0}명 × ${Math.round((expense.percent_rate || 0) * 10000) / 100}%`
                          : `${expense.class_hours || 0}시간 × ${formatKRW(expense.hourly_rate || 0)}`}
                      </td>
                      <td className="px-5 py-3 text-right">{formatKRW(expense.gross_amount)}</td>
                      <td className="px-5 py-3 text-right text-red-600">{formatKRW(expense.tax_amount)}</td>
                      <td className="px-5 py-3 text-right text-slate-700">{formatKRW(expense.insurance_amount || 0)}</td>
                      <td className="px-5 py-3 text-right font-semibold">{formatKRW(expense.net_amount)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEditExpense(expense)}
                            className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">지출</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">순이익</th>
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
                    <td className="px-6 py-4 text-right text-slate-700">{formatKRW(m.expenses)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">{formatKRW(m.profit)}</td>
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



