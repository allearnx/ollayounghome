'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function FailContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code') || 'UNKNOWN';
  const errorMessage = searchParams.get('message') || '결제 처리 중 오류가 발생했습니다.';
  const orderId = searchParams.get('orderId');

  // 에러 코드별 사용자 친화적 메시지
  const getErrorDescription = (code: string) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
      case 'USER_CANCEL':
        return '결제가 취소되었습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었습니다.';
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거절했습니다.';
      case 'INVALID_CARD_NUMBER':
        return '카드 정보가 올바르지 않습니다.';
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
        return '일일 결제 한도를 초과했습니다.';
      case 'EXCEED_MAX_PAYMENT_AMOUNT':
        return '결제 금액 한도를 초과했습니다.';
      case 'INVALID_STOPPED_CARD':
        return '사용이 중지된 카드입니다.';
      case 'NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT':
        return '해당 카드는 할부가 지원되지 않습니다.';
      default:
        return errorMessage;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* 실패 아이콘 */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">결제에 실패했습니다</h1>
        <p className="text-slate-600 mb-6">{getErrorDescription(errorCode)}</p>

        {/* 오류 정보 */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
          <div className="space-y-2 text-sm">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-slate-500">주문번호</span>
                <span className="text-slate-800 font-mono">{orderId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">오류 코드</span>
              <span className="text-slate-800 font-mono">{errorCode}</span>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="block w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
          >
            다시 시도하기
          </button>
          <a
            href="/"
            className="block w-full py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>

        {/* 안내 */}
        <div className="mt-6">
          <p className="text-sm text-slate-400">
            문제가 지속되면 카카오톡 [올라영]으로 문의해주세요.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-violet-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </main>
    }>
      <FailContent />
    </Suspense>
  );
}
