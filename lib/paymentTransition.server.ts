import type { SupabaseClient } from '@supabase/supabase-js';

type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'failed';
type TossStatus = 'DONE' | 'CANCELED' | 'PARTIAL_CANCELED' | 'ABORTED' | 'EXPIRED' | string;

export function mapTossToPaymentStatus(status: TossStatus): PaymentStatus {
  if (status === 'DONE') return 'paid';
  if (status === 'CANCELED') return 'cancelled';
  if (status === 'ABORTED' || status === 'EXPIRED') return 'failed';
  return 'pending';
}

export function canTransitionPaymentStatus(from: PaymentStatus, to: PaymentStatus) {
  if (from === to) return false;
  if (from === 'cancelled' || from === 'failed') return false;
  if (from === 'paid' && to === 'pending') return false;
  return true;
}

export function summarizeCancels(cancels: any[] | undefined) {
  const rows = Array.isArray(cancels) ? cancels : [];
  const totalCancelledAmount = rows.reduce((sum, row) => sum + (Number(row?.cancelAmount) || 0), 0);
  const latestCancel = rows.length ? rows[rows.length - 1] : null;
  return { totalCancelledAmount, latestCancel };
}

export async function updateStudentPaidIfExists(supabase: SupabaseClient, orderId: string) {
  const { data: payment } = await supabase
    .from('payments')
    .select('student_id')
    .eq('order_id', orderId)
    .single();

  if (payment?.student_id) {
    await supabase.from('students').update({ status: 'paid' }).eq('id', payment.student_id);
  }
}

