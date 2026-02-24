import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';

function getTossSecretKey() {
  return process.env.TOSS_SECRET_KEY!;
}

// GET: 토스페이먼츠 결제 상세 조회 (관리자 전용)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const TOSS_SECRET_KEY = getTossSecretKey();
    const { searchParams } = new URL(request.url);
    const paymentKey = searchParams.get('paymentKey');

    if (!paymentKey) {
      return NextResponse.json(
        { error: 'paymentKey가 필요합니다.' },
        { status: 400 }
      );
    }

    // 토스페이먼츠 결제 조회 API 호출
    const authHeader = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');

    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Toss inquiry error:', data);
      return NextResponse.json(
        {
          error: data.message || '결제 정보를 조회할 수 없습니다.',
          code: data.code,
        },
        { status: response.status }
      );
    }

    // 결제 상세 정보 반환
    return NextResponse.json({
      paymentKey: data.paymentKey,
      orderId: data.orderId,
      orderName: data.orderName,
      status: data.status,
      method: data.method,
      totalAmount: data.totalAmount,
      balanceAmount: data.balanceAmount,
      suppliedAmount: data.suppliedAmount,
      vat: data.vat,
      requestedAt: data.requestedAt,
      approvedAt: data.approvedAt,
      // 카드 정보
      card: data.card
        ? {
            company: data.card.company,
            number: data.card.number,
            installmentPlanMonths: data.card.installmentPlanMonths,
            isInterestFree: data.card.isInterestFree,
            approveNo: data.card.approveNo,
            cardType: data.card.cardType,
            ownerType: data.card.ownerType,
          }
        : null,
      // 가상계좌 정보
      virtualAccount: data.virtualAccount
        ? {
            accountNumber: data.virtualAccount.accountNumber,
            bankCode: data.virtualAccount.bankCode,
            customerName: data.virtualAccount.customerName,
            dueDate: data.virtualAccount.dueDate,
            expired: data.virtualAccount.expired,
            refundStatus: data.virtualAccount.refundStatus,
          }
        : null,
      // 계좌이체 정보
      transfer: data.transfer,
      // 간편결제 정보
      easyPay: data.easyPay
        ? {
            provider: data.easyPay.provider,
            amount: data.easyPay.amount,
            discountAmount: data.easyPay.discountAmount,
          }
        : null,
      // 취소 내역
      cancels: data.cancels || [],
      // 영수증
      receipt: data.receipt,
      // 현금영수증
      cashReceipt: data.cashReceipt,
      // 기타
      currency: data.currency,
      country: data.country,
      failure: data.failure,
      isPartialCancelable: data.isPartialCancelable,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Payment inquiry error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
