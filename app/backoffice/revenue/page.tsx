'use client';

import AdminLayout from '@/components/AdminLayout';

export default function RevenuePage() {
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
          <p className="text-2xl font-bold text-slate-800">₩0</p>
          <p className="text-xs text-emerald-600 mt-1">+0% 전월 대비</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">미수금</p>
          <p className="text-2xl font-bold text-red-600">₩0</p>
          <p className="text-xs text-slate-500 mt-1">0명 미납</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">수납률</p>
          <p className="text-2xl font-bold text-slate-800">100%</p>
          <p className="text-xs text-slate-500 mt-1">목표: 95%</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">총 학생 수</p>
          <p className="text-2xl font-bold text-slate-800">0명</p>
          <p className="text-xs text-slate-500 mt-1">활성 수강생</p>
        </div>
      </div>

      {/* 수납 현황 테이블 */}
      <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">학생별 수납 현황</h3>
          <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-300">
            <option>2026년 1월</option>
            <option>2025년 12월</option>
            <option>2025년 11월</option>
          </select>
        </div>
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-1">수납 데이터가 없습니다</p>
          <p className="text-slate-400 text-sm">학생 등록 후 수납 정보가 표시됩니다</p>
        </div>
      </div>

      {/* Admin 전용 안내 */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-amber-800">관리자 전용 페이지</p>
            <p className="text-sm text-amber-700 mt-1">
              이 페이지는 관리자(Admin)만 접근할 수 있습니다. 수납 정보를 안전하게 관리하세요.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}



