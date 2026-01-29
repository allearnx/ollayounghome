import { NextRequest, NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { logTossWebhookError, logTossWebhookReceived, logTossWebhookResult } from '@/lib/webhookLog';

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
  const startedAt = Date.now();
  let body: unknown = null;
  let verifiedPayment: any | null = null;
  
  try {
    body = await request.json();
    logTossWebhookReceived(body);

    const { eventType, data } = body as { eventType?: string; data?: any };

    // 운영 보안: webhook payload를 그대로 신뢰하지 않고 토스에 재조회하여 검증
    // (서명 검증을 사용할 수 있으면 더 좋지만, 최소한 paymentKey/orderId 일치 검증을 한다)
    if (data?.paymentKey) {
      const verified = await fetchTossPayment(data.paymentKey);
      if (!verified.ok) {
        logTossWebhookResult(body, 'verify_failed', { tossStatus: verified.status });
        // 토스 재조회가 실패하면 일시 장애일 수 있으니 재전송을 유도한다.
        return NextResponse.json({ success: false }, { status: 500 });
      }
      if (verified.data.orderId && data.orderId && verified.data.orderId !== data.orderId) {
        logTossWebhookResult(body, 'verify_mismatch_orderId', {
          webhookOrderId: data.orderId,
          tossOrderId: verified.data.orderId,
        });
        return NextResponse.json({ success: false }, { status: 200 });
      }
      verifiedPayment = verified.data;
      // overwrite with verified minimal fields
      data.status = verified.data.status ?? data.status;
      data.orderId = verified.data.orderId ?? data.orderId;
    }

    // 이벤트 타입에 따른 처리
    switch (eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        await handlePaymentStatusChanged(supabase, data, verifiedPayment);
        break;

      case 'DEPOSIT_CALLBACK':
        // 가상계좌 입금 완료
        await handleVirtualAccountDeposit(supabase, data);
        break;

      case 'CANCEL_STATUS_CHANGED':
        // 결제 취소 상태 변경
        await handleCancelStatusChanged(supabase, data, verifiedPayment);
        break;

      default:
        logTossWebhookResult(body, 'unhandled_event', { eventType });
    }

    // 웹훅 수신 성공 응답 (10초 이내에 200 응답 필요)
    logTossWebhookResult(body, 'ok', { durationMs: Date.now() - startedAt });
    return NextResponse.json({ success: true });
  } catch (error) {
    logTossWebhookError(body, error, { durationMs: Date.now() - startedAt });
    // 웹훅 처리에 실패하면 non-2xx를 반환해 토스가 재전송할 수 있게 함.
    // (토스는 최대 7회 재전송)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
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
  },
  verifiedPayment: any | null
) {
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

  // idempotency / transition rules:
  // - paid는 "취소"로 바뀔 수 있으므로 terminal로 취급하면 안 됨 (paid -> cancelled 허용)
  // - cancelled/failed는 terminal로 보고 덮어쓰지 않음
  const { data: existing } = await supabase
    .from('payments')
    .select('status')
    .eq('order_id', orderId)
    .maybeSingle();
  const existingStatus = existing?.status as string | undefined;
  if (existingStatus) {
    if (existingStatus === dbStatus) {
      console.log(`Skip webhook update (no change): ${orderId} stays ${existingStatus}`);
      return;
    }
    if (['cancelled', 'failed'].includes(existingStatus)) {
      console.log(`Skip webhook update (already terminal): ${orderId} -> ${existingStatus}`);
      return;
    }
    if (existingStatus === 'paid' && dbStatus === 'pending') {
      console.log(`Skip webhook update (invalid transition): ${orderId} paid -> pending`);
      return;
    }
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
    updateData.paid_at = verifiedPayment?.approvedAt ?? new Date().toISOString();
  }

  if (dbStatus === 'cancelled') {
    const cancels = Array.isArray(verifiedPayment?.cancels) ? verifiedPayment.cancels : [];
    const totalCancelledAmount = cancels.reduce((sum: number, c: any) => sum + (Number(c?.cancelAmount) || 0), 0);
    const latestCancel = cancels.length ? cancels[cancels.length - 1] : null;
    updateData.cancelled_at = latestCancel?.canceledAt ?? new Date().toISOString();
    updateData.cancelled_amount = totalCancelledAmount || null;
  }

  const { error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('order_id', orderId);

  if (error) {
    // If schema hasn't been migrated yet (missing cancelled_* columns),
    // retry without those optional fields so webhook doesn't break.
    const msg = String((error as any)?.message ?? '');
    if (dbStatus === 'cancelled' && /cancelled_(at|amount)/i.test(msg)) {
      const retryData = { ...updateData };
      delete retryData.cancelled_at;
      delete retryData.cancelled_amount;
      const { error: retryErr } = await supabase.from('payments').update(retryData).eq('order_id', orderId);
      if (retryErr) {
        console.error('Failed to update payment status (retry):', retryErr);
        throw retryErr;
      }
    } else {
      console.error('Failed to update payment status:', error);
      throw error;
    }
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
  },
  verifiedPayment: any | null
) {
  const { orderId, cancelStatus } = data;

  if (cancelStatus === 'DONE') {
    const cancels = Array.isArray(verifiedPayment?.cancels) ? verifiedPayment.cancels : [];
    const totalCancelledAmount = cancels.reduce((sum: number, c: any) => sum + (Number(c?.cancelAmount) || 0), 0);
    const latestCancel = cancels.length ? cancels[cancels.length - 1] : null;

    const { error } = await supabase
      .from('payments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        cancelled_at: latestCancel?.canceledAt ?? new Date().toISOString(),
        cancelled_amount: totalCancelledAmount || null,
      })
      .eq('order_id', orderId);

    if (error) {
      const msg = String((error as any)?.message ?? '');
      if (/cancelled_(at|amount)/i.test(msg)) {
        const { error: retryErr } = await supabase
          .from('payments')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);
        if (retryErr) {
          console.error('Failed to update cancel status (retry):', retryErr);
          throw retryErr;
        }
      } else {
        console.error('Failed to update cancel status:', error);
        throw error;
      }
    }

    console.log(`Payment ${orderId} cancelled`);
  }
}
