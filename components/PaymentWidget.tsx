'use client';

import { useEffect, useRef, useState } from 'react';
import { loadTossPayments, TossPaymentsWidgets, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

interface PaymentWidgetProps {
  amount: number;
  orderName: string;
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess?: (paymentKey: string, orderId: string, amount: number) => void;
  onFail?: (errorCode: string, errorMessage: string) => void;
}

export default function PaymentWidget({
  amount,
  orderName,
  orderId,
  customerName,
  customerPhone,
  customerEmail,
  onSuccess,
  onFail,
}: PaymentWidgetProps) {
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentMethodsRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

  useEffect(() => {
    async function initWidget() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        
        // 비회원 결제 (ANONYMOUS 사용)
        const widgetsInstance = tossPayments.widgets({
          customerKey: ANONYMOUS,
        });

        setWidgets(widgetsInstance);
      } catch (err) {
        console.error('Failed to initialize TossPayments:', err);
        setError('결제 위젯 초기화에 실패했습니다.');
      }
    }

    initWidget();
  }, [clientKey]);

  useEffect(() => {
    async function renderWidget() {
      if (!widgets || !paymentMethodsRef.current || !agreementRef.current) return;

      try {
        // 결제 금액 설정
        await widgets.setAmount({
          currency: 'KRW',
          value: amount,
        });

        // 결제 UI 렌더링
        await widgets.renderPaymentMethods({
          selector: '#payment-methods',
          variantKey: 'DEFAULT',
        });

        // 약관 UI 렌더링
        await widgets.renderAgreement({
          selector: '#agreement',
          variantKey: 'AGREEMENT',
        });

        setIsReady(true);
      } catch (err) {
        console.error('Failed to render payment widget:', err);
        setError('결제 위젯 렌더링에 실패했습니다.');
      }
    }

    renderWidget();
  }, [widgets, amount]);

  // 금액이 변경되면 업데이트
  useEffect(() => {
    async function updateAmount() {
      if (!widgets || !isReady) return;

      try {
        await widgets.setAmount({
          currency: 'KRW',
          value: amount,
        });
      } catch (err) {
        console.error('Failed to update amount:', err);
      }
    }

    updateAmount();
  }, [widgets, isReady, amount]);

  const handlePayment = async () => {
    if (!widgets || !isReady) return;

    setIsLoading(true);
    setError(null);

    try {
      await widgets.requestPayment({
        orderId,
        orderName,
        customerName: customerName || '고객',
        customerMobilePhone: customerPhone?.replace(/-/g, ''),
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
            {amount.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 결제 수단 선택 UI */}
      <div
        id="payment-methods"
        ref={paymentMethodsRef}
        className="min-h-[300px]"
      />

      {/* 약관 동의 UI */}
      <div id="agreement" ref={agreementRef} />

      {/* 결제 버튼 */}
      <button
        onClick={handlePayment}
        disabled={!isReady || isLoading}
        className={`
          w-full py-4 rounded-xl font-semibold text-white text-lg
          transition-all duration-200
          ${
            isReady && !isLoading
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
            처리 중...
          </span>
        ) : isReady ? (
          `${amount.toLocaleString()}원 결제하기`
        ) : (
          '결제 준비 중...'
        )}
      </button>

      {/* 안내 문구 */}
      <p className="text-xs text-slate-400 text-center">
        결제 버튼을 클릭하면 토스페이먼츠 결제창이 열립니다.
      </p>
    </div>
  );
}
