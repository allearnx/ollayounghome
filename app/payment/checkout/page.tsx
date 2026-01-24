'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentWidget from '@/components/PaymentWidget';

interface PaymentInfo {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  courses: { title: string } | null;
  students: { student_name: string } | null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!orderId) {
        setError('주문 정보가 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payments?orderId=${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '결제 정보를 불러올 수 없습니다.');
        }

        if (data.status === 'paid') {
          setError('이미 결제가 완료된 주문입니다.');
        } else if (data.status === 'cancelled') {
          setError('취소된 주문입니다.');
        } else if (data.status === 'failed') {
          setError('결제에 실패한 주문입니다. 다시 시도해주세요.');
        } else {
          setPaymentInfo(data);
        }
      } catch (err) {
        console.error('Error fetching payment info:', err);
        setError(err instanceof Error ? err.message : '결제 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [orderId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-violet-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-600">결제 정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !paymentInfo) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">결제 오류</h1>
          <p className="text-slate-600 mb-6">{error || '결제 정보를 찾을 수 없습니다.'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>
      </main>
    );
  }

  const orderName = paymentInfo.courses?.title || 
    (paymentInfo.students?.student_name ? `${paymentInfo.students.student_name} 수강료` : '수강료 결제');

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">수강료 결제</h1>
          <p className="text-slate-500 mt-1">올라운더영어</p>
        </div>

        {/* 결제 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* 결제 정보 */}
          <div className="mb-6 pb-6 border-b border-slate-100">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">주문번호</span>
                <span className="text-slate-800 font-mono text-sm">{paymentInfo.order_id}</span>
              </div>
              {paymentInfo.students?.student_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">학생명</span>
                  <span className="text-slate-800 font-medium">{paymentInfo.students.student_name}</span>
                </div>
              )}
              {paymentInfo.courses?.title && (
                <div className="flex justify-between">
                  <span className="text-slate-500">강좌</span>
                  <span className="text-slate-800 font-medium">{paymentInfo.courses.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* 결제 위젯 */}
          <PaymentWidget
            amount={paymentInfo.amount}
            orderName={orderName}
            orderId={paymentInfo.order_id}
            customerName={paymentInfo.students?.student_name || undefined}
          />
        </div>

        {/* 안내 문구 */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>결제 관련 문의: 카카오톡 [올라영]</p>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
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
      <CheckoutContent />
    </Suspense>
  );
}
