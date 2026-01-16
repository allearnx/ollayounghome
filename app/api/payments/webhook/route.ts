import { NextRequest, NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase.server';

function getTossSecretKey() {
  return process.env.TOSS_SECRET_KEY!;
}

async function fetchTossPayment(paymentKey: string) {
  const secretKey = getTossSecretKey();
  const authHeader = Buffer.from(`${secretKey}:`).toString('base64');

  const res = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${authHeader}`,
    },
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// POST: 토스페이먼츠 웹훅 수신
export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  
  try {
    const body = await request.json();
    
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    const { eventType, data } = body;

    // 운영 보안: webhook payload를 그대로 신뢰하지 않고 토스에 재조회하여 검증
    // (서명 검증을 사용할 수 있으면 더 좋지만, 최소한 paymentKey/orderId 일치 검증을 한다)
    if (data?.paymentKey) {
      const verified = await fetchTossPayment(data.paymentKey);
      if (!verified.ok) {
        console.error('Webhook verification failed (toss inquiry):', verified.data);
        return NextResponse.json({ success: false }, { status: 200 });
      }
      if (verified.data.orderId && data.orderId && verified.data.orderId !== data.orderId) {
        console.error('Webhook mismatch: orderId does not match toss record', {
          webhookOrderId: data.orderId,
          tossOrderId: verified.data.orderId,
        });
        return NextResponse.json({ success: false }, { status: 200 });
      }
      // overwrite with verified minimal fields
      data.status = verified.data.status ?? data.status;
      data.orderId = verified.data.orderId ?? data.orderId;
    }

    // 이벤트 타입에 따른 처리
    switch (eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        await handlePaymentStatusChanged(supabase, data);
        break;

      case 'DEPOSIT_CALLBACK':
        // 가상계좌 입금 완료
        await handleVirtualAccountDeposit(supabase, data);
        break;

      case 'CANCEL_STATUS_CHANGED':
        // 결제 취소 상태 변경
        await handleCancelStatusChanged(supabase, data);
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
async function handlePaymentStatusChanged(
  supabase: SupabaseClient,
  data: {
    orderId: string;
    status: string;
    transactionKey?: string;
    paymentKey?: string;
    secret?: string;
  }
) {
  const { orderId, status, paymentKey } = data;

  // idempotency: 이미 paid/cancelled/failure로 끝난 건은 덮어쓰지 않음 (pending -> terminal만 허용)
  const { data: existing } = await supabase
    .from('payments')
    .select('status')
    .eq('order_id', orderId)
    .maybeSingle();
  const existingStatus = existing?.status as string | undefined;
  if (existingStatus && ['paid', 'cancelled', 'failed'].includes(existingStatus)) {
    console.log(`Skip webhook update (already terminal): ${orderId} -> ${existingStatus}`);
    return;
  }

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
async function handleVirtualAccountDeposit(
  supabase: SupabaseClient,
  data: {
    orderId: string;
    status: string;
    secret?: string;
  }
) {
  const { orderId, status } = data;

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
async function handleCancelStatusChanged(
  supabase: SupabaseClient,
  data: {
    orderId: string;
    paymentKey: string;
    cancelStatus: string;
  }
) {
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
