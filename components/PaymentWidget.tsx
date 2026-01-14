'use client';

import { useState } from 'react';

interface PaymentWidgetProps {
  amount: number;
  orderName: string;
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onFail?: (errorCode: string, errorMessage: string) => void;
}

export default function PaymentWidget({
  amount,
  orderName,
  orderId,
  customerName,
  customerPhone,
  customerEmail,
}: PaymentWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

  const handlePayment = () => {
    setIsLoading(true);

    // URL 파라미터 구성
    const successUrl = `${window.location.origin}/payment/success`;
    const failUrl = `${window.location.origin}/payment/fail`;

    const params = new URLSearchParams({
      clientKey,
      orderId,
      orderName,
      amount: amount.toString(),
      currency: 'KRW',
      method: '카드',
      successUrl,
      failUrl,
    });

    // 선택적 파라미터 추가
    if (customerName) {
      params.append('customerName', customerName);
    }
    if (customerPhone) {
      params.append('customerMobilePhone', customerPhone.replace(/-/g, ''));
    }
    if (customerEmail) {
      params.append('customerEmail', customerEmail);
    }

    // 토스페이먼츠 결제 페이지로 리다이렉트
    window.location.href = `https://api.tosspayments.com/v1/payments?${params.toString()}`;
  };

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
        disabled={isLoading}
        className={`
          w-full py-4 rounded-xl font-semibold text-white text-lg
          transition-all duration-200
          ${
            !isLoading
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
            결제창 이동 중...
          </span>
        ) : (
          `${amount.toLocaleString()}원 결제하기`
        )}
      </button>
    </div>
  );
}
