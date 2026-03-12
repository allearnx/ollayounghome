'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatPrice, formatDateTimeLong } from '@/lib/utils';

interface PaymentResult {
  orderId: string;
  paymentKey: string;
  amount: number;
  method?: string;
  approvedAt?: string;
  receiptUrl?: string;
  customerName?: string;
  customerPhone?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '결제 승인에 실패했습니다.');
        }

        setPaymentResult(data.payment);
      } catch (err) {
        console.error('Payment confirmation error:', err);
        setError(err instanceof Error ? err.message : '결제 처리 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams]);


  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-violet-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-600">결제를 처리하고 있습니다...</p>
          <p className="text-sm text-slate-400 mt-1">잠시만 기다려주세요.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">결제 처리 실패</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
            >
              홈으로 돌아가기
            </a>
            <p className="text-sm text-slate-400">
              문제가 지속되면 카카오톡 [올라영]으로 문의해주세요.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* 성공 아이콘 */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">결제가 완료되었습니다!</h1>
          <p className="text-slate-500 mt-1">수강 신청이 정상적으로 처리되었습니다.</p>
        </div>

        {/* 결제 정보 */}
        {paymentResult && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-semibold text-slate-500 mb-3">결제 정보</h2>
            <div className="space-y-2">
              {paymentResult.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">학생명</span>
                  <span className="text-slate-800 font-medium">{paymentResult.customerName}</span>
                </div>
              )}
              {paymentResult.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">연락처</span>
                  <span className="text-slate-800">{paymentResult.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">주문번호</span>
                <span className="text-slate-800 font-mono text-sm">{paymentResult.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">결제금액</span>
                <span className="text-slate-800 font-bold">{formatPrice(paymentResult.amount)}원</span>
              </div>
              {paymentResult.method && (
                <div className="flex justify-between">
                  <span className="text-slate-500">결제수단</span>
                  <span className="text-slate-800">{paymentResult.method}</span>
                </div>
              )}
              {paymentResult.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">결제일시</span>
                  <span className="text-slate-800 text-sm">{formatDateTimeLong(paymentResult.approvedAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="space-y-3">
          {paymentResult?.receiptUrl && (
            <a
              href={paymentResult.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 text-center border-2 border-violet-200 text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-colors"
            >
              영수증 보기
            </a>
          )}
          <a
            href="/"
            className="block w-full py-3 text-center bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>

        {/* 안내 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            문의사항이 있으시면 카카오톡 [올라영]으로 연락해주세요.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
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
      <SuccessContent />
    </Suspense>
  );
}
