'use client';

import { useState, useEffect } from 'react';

interface PaymentWidgetProps {
  amount: number;
  orderName: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  onFail?: (errorCode: string, errorMessage: string) => void;
}

type PaymentServerInfo = {
  order_id: string;
  amount: number;
  status: string;
  courses: { title: string } | null;
  students?: { student_name: string } | null;
};

declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestPayment: (
        method: string,
        options: {
          amount: number;
          orderId: string;
          orderName: string;
          customerName?: string;
          customerEmail?: string;
          customerMobilePhone?: string;
          successUrl: string;
          failUrl: string;
        }
      ) => Promise<void>;
    };
  }
}

export default function PaymentWidget({
  amount,
  orderName,
  orderId,
  customerName,
  customerPhone,
  customerEmail,
  onFail,
}: PaymentWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [serverInfo, setServerInfo] = useState<PaymentServerInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

  // TossPayments 스크립트 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ('TossPayments' in window) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setError('결제 모듈을 불러오는데 실패했습니다.');
    document.head.appendChild(script);
  }, []);

  // 결제 직전/표시용: 서버(DB)에 저장된 주문 정보로 금액/주문명 동기화
  useEffect(() => {
    if (!orderId) return;
    let isMounted = true;
    (async () => {
      try {
        setIsRefreshing(true);
        const res = await fetch(`/api/payments?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || '결제 정보를 불러올 수 없습니다.');
        if (isMounted) setServerInfo(data as PaymentServerInfo);
      } catch (e) {
        console.error('Failed to sync payment info:', e);
        // 표시/결제에 치명적이면 버튼 클릭 시 다시 막는다.
      } finally {
        if (isMounted) setIsRefreshing(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const resolvedAmount = serverInfo?.amount ?? amount;
  const resolvedOrderName =
    serverInfo?.courses?.title ||
    (serverInfo?.students?.student_name ? `${serverInfo.students.student_name} 수강료` : null) ||
    orderName;

  const handlePayment = async () => {
    if (!isScriptLoaded || !window.TossPayments) {
      setError('결제 모듈이 로드되지 않았습니다.');
      return;
    }

    if (!customerName.trim()) {
      setError('학생이름을 입력해주세요.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('학부모 연락처를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 결제 직전에 고객 정보(학생명, 연락처)를 DB에 저장
      setIsRefreshing(true);
      const saveRes = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      });
      if (!saveRes.ok) {
        const saveErr = await saveRes.json();
        throw new Error(saveErr?.error || '고객 정보를 저장할 수 없습니다.');
      }

      // 서버 값으로 재검증 (금액/상태 불일치 사고 방지)
      const res = await fetch(`/api/payments?orderId=${encodeURIComponent(orderId)}`);
      const latest = await res.json();
      if (!res.ok) {
        throw new Error(latest?.error || '결제 정보를 다시 확인할 수 없습니다.');
      }
      const latestInfo = latest as PaymentServerInfo;
      setServerInfo(latestInfo);

      if (latestInfo.status === 'paid') {
        setError('이미 결제가 완료된 주문입니다.');
        return;
      }
      if (latestInfo.status === 'cancelled') {
        setError('취소된 주문입니다.');
        return;
      }
      if (latestInfo.status === 'failed') {
        setError('결제에 실패한 주문입니다. 다시 시도해주세요.');
        return;
      }

      const tossPayments = window.TossPayments(clientKey);

      await tossPayments.requestPayment('카드', {
        amount: latestInfo.amount,
        orderId: latestInfo.order_id,
        orderName: latestInfo.courses?.title || resolvedOrderName,
        customerName: customerName.trim(),
        customerMobilePhone: customerPhone.replace(/\D/g, ''),
        customerEmail: customerEmail || undefined,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Payment request failed:', error);
      
      if (error.code === 'USER_CANCEL') {
        setError('결제가 취소되었습니다.');
      } else {
        setError(error.message || '결제 요청 중 오류가 발생했습니다.');
      }

      if (onFail) {
        onFail(error.code || 'UNKNOWN', error.message || '알 수 없는 오류');
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-sm text-red-500 underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 결제 금액 표시 */}
      <div className="p-4 bg-violet-50 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="text-slate-600">결제 금액</span>
          <span className="text-2xl font-bold text-violet-600">
            {resolvedAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 결제 수단 안내 */}
      <div className="p-4 bg-slate-50 rounded-xl">
        <p className="text-sm text-slate-600 mb-2">결제 수단</p>
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-slate-700 font-medium">신용/체크카드</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          결제 버튼을 클릭하면 토스페이먼츠 결제창이 열립니다.
        </p>
      </div>

      {/* 결제 버튼 */}
      <button
        onClick={handlePayment}
        disabled={isLoading || isRefreshing || !isScriptLoaded}
        className={`
          w-full py-4 rounded-xl font-semibold text-white text-lg
          transition-all duration-200
          ${
            !isLoading && !isRefreshing && isScriptLoaded
              ? 'bg-violet-600 hover:bg-violet-700 active:scale-[0.98]'
              : 'bg-slate-300 cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            결제창 로딩 중...
          </span>
        ) : isRefreshing ? (
          '결제 정보 확인 중...'
        ) : !isScriptLoaded ? (
          '결제 모듈 로딩 중...'
        ) : (
          `${resolvedAmount.toLocaleString()}원 결제하기`
        )}
      </button>
    </div>
  );
}
