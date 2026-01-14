import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST: 토스페이먼츠 웹훅 수신
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    const { eventType, data } = body;

    // 이벤트 타입에 따른 처리
    switch (eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        await handlePaymentStatusChanged(data);
        break;

      case 'DEPOSIT_CALLBACK':
        // 가상계좌 입금 완료
        await handleVirtualAccountDeposit(data);
        break;

      case 'CANCEL_STATUS_CHANGED':
        // 결제 취소 상태 변경
        await handleCancelStatusChanged(data);
        break;

      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    // 웹훅 수신 성공 응답 (10초 이내에 200 응답 필요)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // 에러가 발생해도 200을 반환하여 재전송 방지
    // (실제 운영에서는 로깅 후 별도 처리 필요)
    return NextResponse.json({ success: false, error: 'Internal error' });
  }
}

// 결제 상태 변경 처리
async function handlePaymentStatusChanged(data: {
  orderId: string;
  status: string;
  transactionKey?: string;
  paymentKey?: string;
  secret?: string;
}) {
  const { orderId, status, paymentKey } = data;

  // 상태 매핑
  let dbStatus: string;
  switch (status) {
    case 'DONE':
      dbStatus = 'paid';
      break;
    case 'CANCELED':
      dbStatus = 'cancelled';
      break;
    case 'ABORTED':
    case 'EXPIRED':
      dbStatus = 'failed';
      break;
    default:
      dbStatus = 'pending';
  }

  // DB 업데이트
  const updateData: Record<string, unknown> = {
    status: dbStatus,
    updated_at: new Date().toISOString(),
  };

  if (paymentKey) {
    updateData.payment_key = paymentKey;
  }

  if (dbStatus === 'paid') {
    updateData.paid_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('order_id', orderId);

  if (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }

  // 학생 상태도 업데이트
  if (dbStatus === 'paid') {
    const { data: payment } = await supabase
      .from('payments')
      .select('student_id')
      .eq('order_id', orderId)
      .single();

    if (payment?.student_id) {
      await supabase
        .from('students')
        .update({ status: 'paid' })
        .eq('id', payment.student_id);
    }
  }

  console.log(`Payment ${orderId} status updated to ${dbStatus}`);
}

// 가상계좌 입금 완료 처리
async function handleVirtualAccountDeposit(data: {
  orderId: string;
  status: string;
  secret?: string;
}) {
  const { orderId, status, secret } = data;

  if (status === 'DONE') {
    // 입금 완료 - secret 값 검증 후 처리
    // (실제 운영에서는 secret 값을 결제 승인 시 저장해두고 비교해야 함)
    
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (error) {
      console.error('Failed to update virtual account deposit:', error);
      throw error;
    }

    // 학생 상태 업데이트
    const { data: payment } = await supabase
      .from('payments')
      .select('student_id')
      .eq('order_id', orderId)
      .single();

    if (payment?.student_id) {
      await supabase
        .from('students')
        .update({ status: 'paid' })
        .eq('id', payment.student_id);
    }

    console.log(`Virtual account deposit completed for order ${orderId}`);
  }
}

// 결제 취소 상태 변경 처리
async function handleCancelStatusChanged(data: {
  orderId: string;
  paymentKey: string;
  cancelStatus: string;
}) {
  const { orderId, cancelStatus } = data;

  if (cancelStatus === 'DONE') {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (error) {
      console.error('Failed to update cancel status:', error);
      throw error;
    }

    console.log(`Payment ${orderId} cancelled`);
  }
}
