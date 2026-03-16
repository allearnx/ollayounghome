'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/adminApi.client';
import { formatPrice, formatDateTime } from '@/lib/utils';
import type { IntegratedPayment, PaymentDetail } from '../_types';

interface DetailModalProps {
  payment: IntegratedPayment;
  onClose: () => void;
}

function getTossStatusBadge(status: string) {
  switch (status) {
    case 'DONE':
      return <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">완료</span>;
    case 'CANCELED':
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">전액취소</span>;
    case 'PARTIAL_CANCELED':
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">부분취소</span>;
    case 'WAITING_FOR_DEPOSIT':
      return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">입금대기</span>;
    case 'ABORTED':
      return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">중단</span>;
    case 'EXPIRED':
      return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">만료</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">{status}</span>;
  }
}

export default function DetailModal({ payment, onClose }: DetailModalProps) {
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!payment.payment_key) {
      setDetailError('결제가 완료되지 않아 상세 정보를 조회할 수 없습니다.');
      return;
    }
    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const response = await adminFetch(`/api/payments/inquiry?paymentKey=${payment.payment_key}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '결제 정보를 조회할 수 없습니다.');
        setPaymentDetail(data);
      } catch (error) {
        console.error('Payment detail error:', error);
        setDetailError(error instanceof Error ? error.message : '결제 정보를 조회할 수 없습니다.');
      } finally {
        setIsLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [payment.payment_key]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-slate-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">결제 상세 정보</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoadingDetail ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-violet-500 mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-slate-500 mt-2">결제 정보를 조회 중...</p>
            </div>
          ) : detailError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-slate-600">{detailError}</p>
            </div>
          ) : paymentDetail ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-3">기본 정보</h4>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">주문번호</span>
                    <span className="text-slate-800 font-mono text-sm">{paymentDetail.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">주문명</span>
                    <span className="text-slate-800">{paymentDetail.orderName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">상태</span>
                    {getTossStatusBadge(paymentDetail.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">결제수단</span>
                    <span className="text-slate-800">{paymentDetail.method}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-3">금액 정보</h4>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">총 결제금액</span>
                    <span className="text-slate-800 font-bold">{formatPrice(paymentDetail.totalAmount)}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">잔여금액</span>
                    <span className="text-slate-800">{formatPrice(paymentDetail.balanceAmount)}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">공급가액</span>
                    <span className="text-slate-800">{formatPrice(paymentDetail.suppliedAmount)}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">부가세</span>
                    <span className="text-slate-800">{formatPrice(paymentDetail.vat)}원</span>
                  </div>
                </div>
              </div>

              {paymentDetail.card && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-3">카드 정보</h4>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">카드사</span>
                      <span className="text-slate-800">{paymentDetail.card.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">카드번호</span>
                      <span className="text-slate-800 font-mono">{paymentDetail.card.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">할부</span>
                      <span className="text-slate-800">
                        {paymentDetail.card.installmentPlanMonths === 0 ? '일시불' : `${paymentDetail.card.installmentPlanMonths}개월`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">승인번호</span>
                      <span className="text-slate-800 font-mono">{paymentDetail.card.approveNo}</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentDetail.easyPay && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-3">간편결제 정보</h4>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">결제사</span>
                      <span className="text-slate-800">{paymentDetail.easyPay.provider}</span>
                    </div>
                    {paymentDetail.easyPay.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">할인금액</span>
                        <span className="text-emerald-600">-{formatPrice(paymentDetail.easyPay.discountAmount)}원</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentDetail.cancels && paymentDetail.cancels.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-3">취소 내역</h4>
                  <div className="space-y-2">
                    {paymentDetail.cancels.map((cancel, index) => (
                      <div key={index} className="bg-red-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">취소금액</span>
                          <span className="text-red-600 font-bold">-{formatPrice(cancel.cancelAmount)}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">취소사유</span>
                          <span className="text-slate-800">{cancel.cancelReason}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">취소일시</span>
                          <span className="text-slate-800 text-sm">{formatDateTime(cancel.canceledAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-3">시간 정보</h4>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">요청일시</span>
                    <span className="text-slate-800 text-sm">{formatDateTime(paymentDetail.requestedAt)}</span>
                  </div>
                  {paymentDetail.approvedAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">승인일시</span>
                      <span className="text-slate-800 text-sm">{formatDateTime(paymentDetail.approvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {paymentDetail.receipt?.url && (
                <a
                  href={paymentDetail.receipt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 text-center border-2 border-violet-200 text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-colors"
                >
                  영수증 보기
                </a>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
