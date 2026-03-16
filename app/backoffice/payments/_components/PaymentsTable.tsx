import { formatPrice, formatDateTime } from '@/lib/utils';
import type { IntegratedPayment } from '../_types';
import { MANUAL_METHOD_LABELS, MANUAL_CATEGORY_LABELS } from '../_constants';

interface PaymentsTableProps {
  payments: IntegratedPayment[];
  isLoading: boolean;
  onRefresh: () => void;
  onDetail: (payment: IntegratedPayment) => void;
  onRefund: (payment: IntegratedPayment) => void;
  onDelete: (payment: IntegratedPayment) => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">대기</span>;
    case 'paid':
      return <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">완료</span>;
    case 'cancelled':
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">취소</span>;
    case 'failed':
      return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">실패</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">{status}</span>;
  }
}

export default function PaymentsTable({
  payments,
  isLoading,
  onRefresh,
  onDetail,
  onRefund,
  onDelete,
}: PaymentsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">최근 결제 내역</h3>
        <button
          onClick={onRefresh}
          className="text-sm text-violet-600 hover:text-violet-700 font-medium"
        >
          새로고침
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <svg className="animate-spin h-8 w-8 text-violet-500 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-1">결제 내역이 없습니다</p>
          <p className="text-slate-400 text-sm">청구서를 생성하면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">결제일</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">학생명</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">연락처</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">이메일</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">강좌명</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">구분</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">결제수단</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">금액</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">올킬계정</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-600">
                      {payment.paid_at ? formatDateTime(payment.paid_at) : formatDateTime(payment.created_at)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-slate-800">
                      {payment.type === 'PG'
                        ? (payment.customer_name || payment.student?.student_name || '-')
                        : (payment.student?.student_name || '-')
                      }
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-600">
                      {payment.type === 'PG'
                        ? (payment.customer_phone || payment.student?.parent_phone || '-')
                        : (payment.student?.parent_phone || '-')
                      }
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-600">
                      {payment.type === 'PG' ? (payment.customer_email || '-') : '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-600">{payment.course?.title || '-'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-600">
                      {payment.type === 'MANUAL' && payment.category
                        ? (MANUAL_CATEGORY_LABELS[payment.category] || payment.category)
                        : '-'
                      }
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.type === 'PG' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {payment.method || '카드'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {MANUAL_METHOD_LABELS[payment.method || ''] || payment.method || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-slate-800">{formatPrice(payment.amount)}원</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.type === 'PG' && payment.status === 'paid' && payment.voca_activated !== undefined ? (
                      payment.voca_activated ? (
                        <span className="px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded-full">✓ 생성됨</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">⚠ 미생성</span>
                      )
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {payment.type === 'PG' ? (
                        <>
                          <button
                            onClick={() => onDetail(payment)}
                            className="text-xs px-2 py-1 text-violet-600 hover:bg-violet-50 rounded font-medium transition-colors"
                          >
                            상세
                          </button>
                          {payment.status === 'paid' && payment.payment_key && (
                            <button
                              onClick={() => onRefund(payment)}
                              className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded font-medium transition-colors"
                            >
                              환불
                            </button>
                          )}
                          {payment.receipt_url && (
                            <a
                              href={payment.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2 py-1 text-slate-600 hover:bg-slate-50 rounded font-medium transition-colors"
                            >
                              영수증
                            </a>
                          )}
                          <button
                            onClick={() => onDelete(payment)}
                            className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-100 rounded font-medium transition-colors"
                          >
                            삭제
                          </button>
                        </>
                      ) : (
                        <>
                          {payment.memo && (
                            <span className="text-xs text-slate-500 max-w-[100px] truncate" title={payment.memo}>
                              📝 {payment.memo}
                            </span>
                          )}
                          <button
                            onClick={() => onDelete(payment)}
                            className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-100 rounded font-medium transition-colors"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
