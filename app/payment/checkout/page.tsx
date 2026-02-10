'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentWidget from '@/components/PaymentWidget';

interface PaymentInfo {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  courses: { title: string } | null;
  students: { student_name: string; parent_phone: string } | null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [isSavingPayer, setIsSavingPayer] = useState(false);
  const [payerError, setPayerError] = useState<string | null>(null);

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
          // Prefill from DB/student if present
          setStudentName(data.students?.student_name || data.customer_name || '');
          setParentPhone(data.students?.parent_phone || data.customer_phone || '');
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

  const canPay = !!studentName.trim() && !!parentPhone.trim();

  const savePayerInfo = async () => {
    if (!orderId) return;
    setPayerError(null);
    if (!studentName.trim()) {
      setPayerError('학생이름을 입력해주세요.');
      return;
    }
    if (!parentPhone.trim()) {
      setPayerError('학부모 연락처를 입력해주세요.');
      return;
    }
    setIsSavingPayer(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName: studentName.trim(),
          customerPhone: parentPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || '결제자 정보를 저장할 수 없습니다.');
      }
      // reflect locally
      setPaymentInfo((prev) => (prev ? { ...prev, customer_name: studentName.trim(), customer_phone: parentPhone.trim() } : prev));
    } catch (e) {
      setPayerError(e instanceof Error ? e.message : '결제자 정보를 저장할 수 없습니다.');
    } finally {
      setIsSavingPayer(false);
    }
  };

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

          {/* 결제자(학생/학부모) 정보 입력 */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">결제 정보 입력</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  학생이름 <span className="text-red-500">*</span> (필수)
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="학생이름 입력"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  학부모 연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none bg-white"
                  required
                />
                <p className="mt-1 text-xs text-slate-400">하이픈(-) 포함 입력 가능</p>
              </div>

              {payerError && <p className="text-sm text-red-600 font-medium">{payerError}</p>}

              <button
                onClick={savePayerInfo}
                disabled={isSavingPayer || !canPay}
                className="w-full py-3 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingPayer ? '저장 중...' : '정보 저장'}
              </button>
            </div>
          </div>

          {/* 결제 위젯 */}
          {canPay ? (
            <PaymentWidget
              amount={paymentInfo.amount}
              orderName={orderName}
              orderId={paymentInfo.order_id}
              customerName={studentName.trim()}
              customerPhone={parentPhone.trim()}
            />
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              결제를 진행하려면 학생이름과 학부모 연락처를 입력해주세요.
            </div>
          )}
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
