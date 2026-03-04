import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';
import { cancelTossPayment } from '@/lib/toss.server';
import { summarizeCancels } from '@/lib/paymentTransition.server';

// POST: 결제 취소 (전액/부분)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();
    
    const body = await request.json();
    const { paymentKey, cancelReason, cancelAmount, refundReceiveAccount } = body;

    if (!paymentKey) {
      return NextResponse.json(
        { error: 'paymentKey가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!cancelReason) {
      return NextResponse.json(
        { error: '취소 사유를 입력해주세요.' },
        { status: 400 }
      );
    }

    const cancelBody: Record<string, unknown> = {
      cancelReason,
    };

    // 부분 취소인 경우 금액 추가
    if (cancelAmount && cancelAmount > 0) {
      cancelBody.cancelAmount = cancelAmount;
    }

    // 가상계좌 환불 계좌 정보 (가상계좌 결제 취소 시 필요)
    if (refundReceiveAccount) {
      cancelBody.refundReceiveAccount = {
        bank: refundReceiveAccount.bank,
        accountNumber: refundReceiveAccount.accountNumber,
        holderName: refundReceiveAccount.holderName,
      };
    }

    const toss = await cancelTossPayment(paymentKey, cancelBody);
    const data = toss.data;

    if (!toss.ok) {
      console.error('Toss cancel error:', data);
      return NextResponse.json(
        {
          error: data.message || '결제 취소에 실패했습니다.',
          code: data.code,
        },
        { status: toss.status }
      );
    }

    // DB 업데이트 - 결제 상태를 cancelled로 변경
    const newStatus = data.status === 'CANCELED' ? 'cancelled' : 
                      data.status === 'PARTIAL_CANCELED' ? 'paid' : 'cancelled';

    const cancels = Array.isArray(data.cancels) ? data.cancels : [];
    const { totalCancelledAmount, latestCancel } = summarizeCancels(cancels);

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'cancelled'
          ? {
              cancelled_at: latestCancel?.canceledAt ?? new Date().toISOString(),
              cancelled_amount: totalCancelledAmount || null,
            }
          : {}),
      })
      .eq('payment_key', paymentKey);

    if (updateError) {
      console.error('DB update error after cancel:', updateError);
      // 토스 취소는 성공했으므로 에러를 던지지 않고 로그만 남김
    }

    return NextResponse.json({
      success: true,
      paymentKey: data.paymentKey,
      orderId: data.orderId,
      status: data.status,
      balanceAmount: data.balanceAmount,
      cancel: latestCancel
        ? {
            cancelAmount: latestCancel.cancelAmount,
            cancelReason: latestCancel.cancelReason,
            canceledAt: latestCancel.canceledAt,
            refundableAmount: latestCancel.refundableAmount,
            cancelStatus: latestCancel.cancelStatus,
          }
        : null,
      totalCancels: cancels.length || 0,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Payment cancel error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
