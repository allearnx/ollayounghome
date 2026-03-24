'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminFetch } from '@/lib/adminApi.client';
import type { IntegratedPayment, Student, Course } from './_types';
import StatsCards from './_components/StatsCards';
import PaymentsTable from './_components/PaymentsTable';
import DeleteModal from './_modals/DeleteModal';
import RefundModal from './_modals/RefundModal';
import DetailModal from './_modals/DetailModal';
import BillingModal from './_modals/BillingModal';
import ManualPaymentModal from './_modals/ManualPaymentModal';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<IntegratedPayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 필터 탭
  const [filterTab, setFilterTab] = useState<'all' | 'card' | 'cash'>('all');
  
  // 청구서 생성 모달
  const [showBillingModal, setShowBillingModal] = useState(false);

  // 수기 결제 등록 모달
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);

  // 결제 상세 모달
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<IntegratedPayment | null>(null);

  // 환불 모달
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundPayment, setRefundPayment] = useState<IntegratedPayment | null>(null);

  // 삭제 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePayment, setDeletePayment] = useState<IntegratedPayment | null>(null);

  // 필터링된 결제 목록
  const filteredPayments = payments.filter((p) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'card') return p.type === 'PG'; // PG = 카드
    return p.type === 'MANUAL'; // 현금/기타 = 수동 결제
  });

  // 통계 (필터 적용)
  const pendingCount = filteredPayments.filter(p => p.status === 'pending').length;
  const paidCount = filteredPayments.filter(p => p.status === 'paid').length;
  const cancelledCount = filteredPayments.filter(p => p.status === 'cancelled' || p.status === 'failed').length;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      // 통합 결제 내역과 학생/강좌 목록을 병렬로 조회
      const [paymentsRes, overviewRes] = await Promise.all([
        adminFetch('/api/admin/integrated-payments?limit=500', {
          cache: 'no-store',
        }),
        adminFetch('/api/admin/overview?limit=50', {
          cache: 'no-store',
        }),
      ]);

      const paymentsData = await paymentsRes.json();
      const overviewData = await overviewRes.json();

      if (!paymentsRes.ok) {
        throw new Error(paymentsData.error || '결제 내역을 불러올 수 없습니다.');
      }
      if (!overviewRes.ok) {
        throw new Error(overviewData.error || '데이터를 불러올 수 없습니다.');
      }

      setPayments(paymentsData.payments || []);
      setStudents(overviewData.students || []);
      setCourses(overviewData.courses || []);
    } catch (err) {
      console.error('Admin payments fetch error:', err);
      setPayments([]);
      setStudents([]);
      setCourses([]);
      alert(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeBillingModal = () => setShowBillingModal(false);

  const closeManualPaymentModal = () => setShowManualPaymentModal(false);

  // 결제 상세 모달 열기
  const openDetailModal = (payment: IntegratedPayment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  };

  // 환불 모달 열기
  const openRefundModal = (payment: IntegratedPayment) => {
    setRefundPayment(payment);
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundPayment(null);
  };

  // 삭제 모달 열기
  const openDeleteModal = (payment: IntegratedPayment) => {
    setDeletePayment(payment);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePayment(null);
  };


  return (
    <AdminLayout requiredRole="admin">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">💳 결제 관리</h2>
          <p className="text-slate-500 mt-1">결제 내역을 관리하고 청구서를 발송합니다.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowManualPaymentModal(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-200"
          >
            + 수기 결제 등록
          </button>
          <button
            onClick={() => setShowBillingModal(true)}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-200"
          >
            + 청구서 생성
          </button>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterTab === 'all'
              ? 'bg-violet-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilterTab('card')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterTab === 'card'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          카드
        </button>
        <button
          onClick={() => setFilterTab('cash')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterTab === 'cash'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          현금/기타
        </button>
      </div>

      {/* 통계 카드 */}
      <StatsCards
        pendingCount={pendingCount}
        paidCount={paidCount}
        cancelledCount={cancelledCount}
      />

      {/* 결제 내역 테이블 */}
      <PaymentsTable
        payments={filteredPayments}
        isLoading={isLoading}
        onRefresh={fetchData}
        onDetail={openDetailModal}
        onRefund={openRefundModal}
        onDelete={openDeleteModal}
      />

      {/* 청구서 생성 모달 */}
      {showBillingModal && (
        <BillingModal
          students={students}
          courses={courses}
          onClose={closeBillingModal}
          onSuccess={fetchData}
        />
      )}

      {/* 결제 상세 모달 */}
      {showDetailModal && selectedPayment && (
        <DetailModal payment={selectedPayment} onClose={closeDetailModal} />
      )}

      {/* 환불 모달 */}
      {showRefundModal && refundPayment && (
        <RefundModal
          payment={refundPayment}
          onClose={closeRefundModal}
          onSuccess={fetchData}
        />
      )}

      {/* 수기 결제 등록 모달 */}
      {showManualPaymentModal && (
        <ManualPaymentModal
          students={students}
          courses={courses}
          onClose={closeManualPaymentModal}
          onSuccess={fetchData}
        />
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && deletePayment && (
        <DeleteModal
          payment={deletePayment}
          onClose={closeDeleteModal}
          onSuccess={fetchData}
        />
      )}
    </AdminLayout>
  );
}
