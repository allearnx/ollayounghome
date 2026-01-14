import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 주문 ID 생성 함수
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ORDER_${timestamp}_${randomStr}`.toUpperCase();
}

// POST: 결제 주문 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { studentId, courseId, amount, customerName, customerPhone } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '결제 금액이 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();

    // 결제 레코드 생성
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        student_id: studentId || null,
        course_id: courseId || null,
        amount,
        status: 'pending',
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Payment creation error:', error);
      return NextResponse.json(
        { error: '결제 주문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: data.id,
    });
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET: 결제 정보 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: '주문 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        students (id, student_name, parent_phone),
        courses (id, title, price)
      `)
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
