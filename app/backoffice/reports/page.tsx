'use client';

import AdminLayout from '@/components/AdminLayout';

export default function ReportsPage() {
  return (
    <AdminLayout requiredRole="admin">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📊 매출 리포트</h2>
        <p className="text-slate-500 mt-1">매출 현황을 분석하고 리포트를 확인합니다.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-violet-100 mb-1">이번 달 총 매출</p>
          <p className="text-3xl font-bold">₩0</p>
          <div className="mt-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-sm text-violet-100">전월 대비 +0%</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">올해 누적 매출</p>
          <p className="text-2xl font-bold text-slate-800">₩0</p>
          <p className="text-xs text-slate-500 mt-4">2026년 1월 ~ 현재</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">평균 객단가</p>
          <p className="text-2xl font-bold text-slate-800">₩0</p>
          <p className="text-xs text-slate-500 mt-4">학생 1인당 평균</p>
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
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm text-slate-500">데이터가 쌓이면 차트가 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>

        {/* 강의별 매출 */}
        <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">카테고리별 매출</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-sm text-slate-500">데이터가 쌓이면 차트가 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 리포트 테이블 */}
      <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">상세 매출 내역</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
              📥 엑셀 다운로드
            </button>
          </div>
        </div>
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-1">매출 데이터가 없습니다</p>
          <p className="text-slate-400 text-sm">결제가 발생하면 리포트가 생성됩니다</p>
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
              이 페이지는 관리자(Admin)만 접근할 수 있습니다. 매출 정보를 안전하게 관리하세요.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}



