'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Payment {
  id: string;
  created_at: string;
  order_id: string;
  payment_key: string | null;
  amount: number;
  status: string;
  method: string | null;
  receipt_url: string | null;
  paid_at: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  students: { id: string; student_name: string; parent_phone: string } | null;
  courses: { id: string; title: string; price: number } | null;
}

interface Student {
  id: string;
  student_name: string;
  parent_phone: string;
  status: string;
}

interface Course {
  id: string;
  title: string;
  price: number;
}

interface PaymentDetail {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  method: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  requestedAt: string;
  approvedAt: string;
  card: {
    company: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    cardType: string;
    ownerType: string;
  } | null;
  easyPay: {
    provider: string;
    amount: number;
    discountAmount: number;
  } | null;
  cancels: Array<{
    cancelAmount: number;
    cancelReason: string;
    canceledAt: string;
    refundableAmount: number;
    cancelStatus: string;
  }>;
  receipt: { url: string } | null;
  isPartialCancelable: boolean;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 청구서 생성 모달
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCreatingBilling, setIsCreatingBilling] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 결제 상세 모달
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // 환불 모달
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [isPartialRefund, setIsPartialRefund] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // 통계
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const cancelledCount = payments.filter(p => p.status === 'cancelled' || p.status === 'failed').length;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setPayments([]);
        setStudents([]);
        setCourses([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/admin/overview?limit=50', {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '데이터를 불러올 수 없습니다.');
      }

      setPayments(data.payments || []);
      setStudents(data.students || []);
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Admin overview fetch error:', err);
      setPayments([]);
      setStudents([]);
      setCourses([]);
      alert(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 청구서 생성
  const createBilling = async () => {
    const course = courses.find(c => c.id === selectedCourse);
    const student = students.find(s => s.id === selectedStudent);
    
    const amount = customAmount ? parseInt(customAmount) : (course?.price || 0);

    const finalName = (customerName || student?.student_name || '').trim();
    const finalPhone = (customerPhone || student?.parent_phone || '').trim();
    
    if (amount <= 0) {
      alert('결제 금액을 입력해주세요.');
      return;
    }

    if (!finalName) {
      alert('학생이름을 입력해주세요.');
      return;
    }
    if (!finalPhone) {
      alert('학부모 연락처를 입력해주세요.');
      return;
    }

    setIsCreatingBilling(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent || null,
          courseId: selectedCourse || null,
          amount,
          customerName: finalName,
          customerPhone: finalPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '청구서 생성에 실패했습니다.');
      }

      // 결제 링크 생성
      const paymentLink = `${window.location.origin}/payment/checkout?orderId=${data.orderId}`;
      setGeneratedLink(paymentLink);

      // 학생 상태 업데이트
      // 학생 상태는 /api/payments (서버)에서 처리됨

      // 목록 새로고침
      fetchData();
    } catch (error) {
      console.error('Billing creation error:', error);
      alert(error instanceof Error ? error.message : '청구서 생성에 실패했습니다.');
    } finally {
      setIsCreatingBilling(false);
    }
  };

  // 링크 복사
  const copyLink = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = generatedLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // 모달 닫기
  const closeBillingModal = () => {
    setShowBillingModal(false);
    setSelectedStudent('');
    setSelectedCourse('');
    setCustomAmount('');
    setCustomerName('');
    setCustomerPhone('');
    setGeneratedLink(null);
  };

  // 결제 상세 조회
  const openDetailModal = async (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
    setDetailError(null);
    setPaymentDetail(null);

    if (!payment.payment_key) {
      setDetailError('결제가 완료되지 않아 상세 정보를 조회할 수 없습니다.');
      return;
    }

    setIsLoadingDetail(true);

    try {
      const response = await fetch(`/api/payments/inquiry?paymentKey=${payment.payment_key}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '결제 정보를 조회할 수 없습니다.');
      }

      setPaymentDetail(data);
    } catch (error) {
      console.error('Payment detail error:', error);
      setDetailError(error instanceof Error ? error.message : '결제 정보를 조회할 수 없습니다.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
    setPaymentDetail(null);
    setDetailError(null);
  };

  // 환불 모달 열기
  const openRefundModal = (payment: Payment) => {
    setRefundPayment(payment);
    setRefundAmount(payment.amount.toString());
    setRefundReason('');
    setIsPartialRefund(false);
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundPayment(null);
    setRefundReason('');
    setRefundAmount('');
    setIsPartialRefund(false);
  };

  // 환불 처리
  const processRefund = async () => {
    if (!refundPayment?.payment_key) {
      alert('결제 키가 없어 환불할 수 없습니다.');
      return;
    }

    if (!refundReason.trim()) {
      alert('환불 사유를 입력해주세요.');
      return;
    }

    const amount = isPartialRefund ? parseInt(refundAmount) : undefined;
    if (isPartialRefund && (!amount || amount <= 0 || amount > refundPayment.amount)) {
      alert('유효한 환불 금액을 입력해주세요.');
      return;
    }

    setIsProcessingRefund(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('관리자 인증이 필요합니다.');
      }

      const response = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey: refundPayment.payment_key,
          cancelReason: refundReason,
          cancelAmount: isPartialRefund ? amount : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '환불 처리에 실패했습니다.');
      }

      alert('환불이 완료되었습니다.');
      closeRefundModal();
      fetchData();
    } catch (error) {
      console.error('Refund error:', error);
      alert(error instanceof Error ? error.message : '환불 처리에 실패했습니다.');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  // 상태 뱃지
  const getStatusBadge = (status: string) => {
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
  };

  // 토스 상태 뱃지
  const getTossStatusBadge = (status: string) => {
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
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <AdminLayout requiredRole="admin">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">💳 결제 관리</h2>
          <p className="text-slate-500 mt-1">결제 내역을 관리하고 청구서를 발송합니다.</p>
        </div>
        <button
          onClick={() => setShowBillingModal(true)}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-200"
        >
          + 청구서 생성
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">대기 중</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">완료</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{paidCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-violet-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">취소/실패</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{cancelledCount}</p>
        </div>
      </div>

      {/* 결제 내역 테이블 */}
      <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">최근 결제 내역</h3>
          <button
            onClick={fetchData}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">주문번호</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">고객/학생</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">강좌</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">금액</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">결제일</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-mono text-slate-600">{payment.order_id}</p>
                      <p className="text-xs text-slate-400">{formatDate(payment.created_at)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-slate-800">
                        {payment.customer_name || payment.students?.student_name || '-'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {payment.customer_phone || payment.students?.parent_phone || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-600">{payment.courses?.title || '-'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-slate-800">{formatPrice(payment.amount)}원</p>
                      {payment.method && (
                        <p className="text-xs text-slate-400">{payment.method}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-600">
                        {payment.paid_at ? formatDate(payment.paid_at) : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* 상세 보기 버튼 */}
                        <button
                          onClick={() => openDetailModal(payment)}
                          className="text-xs px-2 py-1 text-violet-600 hover:bg-violet-50 rounded font-medium transition-colors"
                        >
                          상세
                        </button>
                        
                        {/* 환불 버튼 (결제 완료 상태일 때만) */}
                        {payment.status === 'paid' && payment.payment_key && (
                          <button
                            onClick={() => openRefundModal(payment)}
                            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded font-medium transition-colors"
                          >
                            환불
                          </button>
                        )}
                        
                        {/* 영수증 링크 */}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 청구서 생성 모달 */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeBillingModal}
          />
          
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">청구서 생성</h3>
              <p className="text-sm text-slate-500 mt-1">학부모에게 전송할 결제 링크를 생성합니다.</p>
            </div>
            
            <div className="p-6 space-y-4">
              {!generatedLink ? (
                <>
                  {/* 학생 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      학생 선택 <span className="text-slate-400">(선택)</span>
                    </label>
                    <select
                      value={selectedStudent}
                      onChange={(e) => {
                        setSelectedStudent(e.target.value);
                        const student = students.find(s => s.id === e.target.value);
                        if (student) {
                          setCustomerName(student.student_name);
                          setCustomerPhone(student.parent_phone);
                        }
                      }}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                    >
                      <option value="">학생을 선택하세요</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.student_name} ({student.parent_phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 강좌 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      강좌 선택 <span className="text-slate-400">(선택)</span>
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        const course = courses.find(c => c.id === e.target.value);
                        if (course) {
                          setCustomAmount(course.price.toString());
                        }
                      }}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                    >
                      <option value="">강좌를 선택하세요</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title} ({formatPrice(course.price)}원)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 결제 금액 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      결제 금액 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="100000"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                    />
                  </div>

                  {/* 고객 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      학생이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="학생이름 입력"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                      required
                    />
                  </div>

                  {/* 고객 연락처 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      학부모 연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-400">하이픈(-) 포함 입력 가능</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={closeBillingModal}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={createBilling}
                      disabled={isCreatingBilling || !customAmount}
                      className="flex-1 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreatingBilling ? '생성 중...' : '청구서 생성'}
                    </button>
                  </div>
                </>
              ) : (
                /* 생성된 링크 표시 */
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-semibold text-emerald-800">청구서가 생성되었습니다!</p>
                    </div>
                    <p className="text-sm text-emerald-700">아래 링크를 학부모에게 전송하세요.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-600 mb-2">결제 링크</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedLink}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono"
                      />
                      <button
                        onClick={copyLink}
                        className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                          copySuccess 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                      >
                        {copySuccess ? '복사됨!' : '복사'}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={closeBillingModal}
                    className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 결제 상세 모달 */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDetailModal}
          />
          
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white p-6 border-b border-slate-100 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">결제 상세 정보</h3>
                <button
                  onClick={closeDetailModal}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
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
                  {/* 기본 정보 */}
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

                  {/* 금액 정보 */}
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

                  {/* 카드 정보 */}
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
                            {paymentDetail.card.installmentPlanMonths === 0 
                              ? '일시불' 
                              : `${paymentDetail.card.installmentPlanMonths}개월`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">승인번호</span>
                          <span className="text-slate-800 font-mono">{paymentDetail.card.approveNo}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 간편결제 정보 */}
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

                  {/* 취소 내역 */}
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
                              <span className="text-slate-800 text-sm">{formatDate(cancel.canceledAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 시간 정보 */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-3">시간 정보</h4>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">요청일시</span>
                        <span className="text-slate-800 text-sm">{formatDate(paymentDetail.requestedAt)}</span>
                      </div>
                      {paymentDetail.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">승인일시</span>
                          <span className="text-slate-800 text-sm">{formatDate(paymentDetail.approvedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 영수증 링크 */}
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
      )}

      {/* 환불 모달 */}
      {showRefundModal && refundPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeRefundModal}
          />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">결제 환불</h3>
              <p className="text-sm text-slate-500 mt-1">환불 처리를 진행합니다.</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* 결제 정보 */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">주문번호</span>
                  <span className="text-slate-800 font-mono text-sm">{refundPayment.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">결제금액</span>
                  <span className="text-slate-800 font-bold">{formatPrice(refundPayment.amount)}원</span>
                </div>
              </div>

              {/* 환불 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">환불 유형</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsPartialRefund(false);
                      setRefundAmount(refundPayment.amount.toString());
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                      !isPartialRefund
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    전액 환불
                  </button>
                  <button
                    onClick={() => {
                      setIsPartialRefund(true);
                      setRefundAmount('');
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                      isPartialRefund
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    부분 환불
                  </button>
                </div>
              </div>

              {/* 부분 환불 금액 입력 */}
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
                    max={refundPayment.amount}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    최대 {formatPrice(refundPayment.amount)}원까지 환불 가능
                  </p>
                </div>
              )}

              {/* 환불 사유 */}
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

              {/* 주의사항 */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700">
                  ⚠️ 환불 처리 후에는 취소할 수 없습니다. 신중하게 진행해주세요.
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeRefundModal}
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
      )}
    </AdminLayout>
  );
}
