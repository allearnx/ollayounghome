'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminApi.client';
import { formatPrice } from '@/lib/utils';
import type { IntegratedPayment } from '../_types';

interface DeleteModalProps {
  payment: IntegratedPayment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteModal({ payment, onClose, onSuccess }: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const processDelete = async () => {
    setIsDeleting(true);
    try {
      const endpoint = payment.type === 'PG'
        ? `/api/payments/${payment.id}`
        : `/api/manual-payments/${payment.id}`;

      const response = await adminFetch(endpoint, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || '삭제에 실패했습니다.');

      alert('결제 내역이 삭제되었습니다.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : '삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">결제 내역 삭제</h3>
          <p className="text-sm text-slate-500 mt-1">삭제된 내역은 매출 리포트에서 제외됩니다.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">학생명</span>
              <span className="text-slate-800 font-medium">
                {payment.type === 'PG'
                  ? (payment.customer_name || payment.student?.student_name || '-')
                  : (payment.student?.student_name || '-')
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">강좌명</span>
              <span className="text-slate-800">{payment.course?.title || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">결제금액</span>
              <span className="text-slate-800 font-bold">{formatPrice(payment.amount)}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">결제유형</span>
              <span className="text-slate-800">{payment.type === 'PG' ? '카드(PG)' : '수기결제'}</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-700">
              ⚠️ 삭제된 결제 내역은 매출 리포트에서 제외됩니다. 실제 환불이 필요한 경우 환불 기능을 사용하세요.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={processDelete}
              disabled={isDeleting}
              className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
