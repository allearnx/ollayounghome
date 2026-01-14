import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getTossSecretKey() {
  return process.env.TOSS_SECRET_KEY!;
}

// POST: 결제 승인 요청
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const TOSS_SECRET_KEY = getTossSecretKey();
    
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 1. DB에서 주문 정보 확인 (금액 검증)
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json(
        { error: '주문 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 금액 검증 (악의적인 금액 변조 방지)
    if (payment.amount !== amount) {
      return NextResponse.json(
        { error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 이미 결제된 주문인지 확인
    if (payment.status === 'paid') {
      return NextResponse.json(
        { error: '이미 결제가 완료된 주문입니다.' },
        { status: 400 }
      );
    }

    // 2. 토스페이먼츠 결제 승인 API 호출
    const authHeader = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
    
    const tossResponse = await fetch(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error('Toss API error:', tossData);
      
      // 결제 실패 상태로 업데이트
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      return NextResponse.json(
        { 
          error: tossData.message || '결제 승인에 실패했습니다.',
          code: tossData.code,
        },
        { status: tossResponse.status }
      );
    }

    // 3. 결제 성공 - DB 업데이트
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        payment_key: paymentKey,
        status: 'paid',
        method: tossData.method,
        receipt_url: tossData.receipt?.url || null,
        paid_at: tossData.approvedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('DB update error:', updateError);
      // 결제는 성공했으나 DB 업데이트 실패 - 로그 기록 필요
    }

    // 4. 학생 상태 업데이트 (결제 완료)
    if (payment.student_id) {
      await supabase
        .from('students')
        .update({ status: 'paid' })
        .eq('id', payment.student_id);
    }

    return NextResponse.json({
      success: true,
      payment: {
        orderId,
        paymentKey,
        amount: tossData.totalAmount,
        method: tossData.method,
        approvedAt: tossData.approvedAt,
        receiptUrl: tossData.receipt?.url,
      },
    });
  } catch (error) {
    console.error('Payment confirm error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
