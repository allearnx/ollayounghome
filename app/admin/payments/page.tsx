'use client';

import AdminLayout from '@/components/AdminLayout';

export default function PaymentsPage() {
  return (
    <AdminLayout requiredRole="admin">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">💳 결제 관리</h2>
        <p className="text-slate-500 mt-1">결제 내역을 관리하고 처리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">대기 중</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">완료</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">취소/환불</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>
      </div>

      {/* 결제 내역 테이블 */}
      <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">최근 결제 내역</h3>
        </div>
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-1">결제 내역이 없습니다</p>
          <p className="text-slate-400 text-sm">결제가 발생하면 여기에 표시됩니다</p>
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
              이 페이지는 관리자(Admin)만 접근할 수 있습니다. 결제 정보를 안전하게 관리하세요.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

