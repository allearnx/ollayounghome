'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminApi.client';
import { formatPrice } from '@/lib/utils';
import type { IntegratedPayment } from '../_types';

interface RefundModalProps {
  payment: IntegratedPayment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RefundModal({ payment, onClose, onSuccess }: RefundModalProps) {
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(payment.amount.toString());
  const [isPartialRefund, setIsPartialRefund] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const processRefund = async () => {
    if (!payment.payment_key) {
      alert('결제 키가 없어 환불할 수 없습니다.');
      return;
    }
    if (!refundReason.trim()) {
      alert('환불 사유를 입력해주세요.');
      return;
    }
    const amount = isPartialRefund ? parseInt(refundAmount) : undefined;
    if (isPartialRefund && (!amount || amount <= 0 || amount > payment.amount)) {
      alert('유효한 환불 금액을 입력해주세요.');
      return;
    }

    setIsProcessingRefund(true);
    try {
      const response = await adminFetch('/api/payments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentKey: payment.payment_key,
          cancelReason: refundReason,
          cancelAmount: isPartialRefund ? amount : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '환불 처리에 실패했습니다.');

      alert('환불이 완료되었습니다.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Refund error:', error);
      alert(error instanceof Error ? error.message : '환불 처리에 실패했습니다.');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">결제 환불</h3>
          <p className="text-sm text-slate-500 mt-1">환불 처리를 진행합니다.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-slate-500">주문번호</span>
              <span className="text-slate-800 font-mono text-sm">{payment.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">결제금액</span>
              <span className="text-slate-800 font-bold">{formatPrice(payment.amount)}원</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">환불 유형</label>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsPartialRefund(false); setRefundAmount(payment.amount.toString()); }}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  !isPartialRefund ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                전액 환불
              </button>
              <button
                onClick={() => { setIsPartialRefund(true); setRefundAmount(''); }}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  isPartialRefund ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                부분 환불
              </button>
            </div>
          </div>

          {isPartialRefund && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                환불 금액 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="환불할 금액 입력"
                max={payment.amount}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">최대 {formatPrice(payment.amount)}원까지 환불 가능</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              환불 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="환불 사유를 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none resize-none"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-700">⚠️ 환불 처리 후에는 취소할 수 없습니다. 신중하게 진행해주세요.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={processRefund}
              disabled={isProcessingRefund || !refundReason.trim() || (isPartialRefund && !refundAmount)}
              className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessingRefund ? '처리 중...' : '환불 처리'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
