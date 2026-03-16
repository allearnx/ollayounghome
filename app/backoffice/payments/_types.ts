export interface IntegratedPayment {
  id: string;
  type: 'PG' | 'MANUAL';
  amount: number;
  status: string;
  method: string | null;
  paid_at: string | null;
  created_at: string;
  student: { id: string; student_name: string; parent_phone: string } | null;
  course: { id: string; title: string; price: number } | null;
  // PG 전용
  order_id?: string;
  payment_key?: string;
  receipt_url?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  voca_activated?: boolean;
  voca_activated_at?: string | null;
  // 수동 결제 전용
  category?: string;
  memo?: string;
}

export interface Student {
  id: string;
  student_name: string;
  parent_phone: string;
  status: string;
}

export interface Course {
  id: string;
  title: string;
  price: number;
}

export interface PaymentDetail {
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
