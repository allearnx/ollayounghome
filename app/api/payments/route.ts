import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';

import { randomUUID } from 'crypto';

// 주문 ID 생성 함수
function generateOrderId(): string {
  return `ORDER_${randomUUID().replace(/-/g, '').toUpperCase()}`;
}

// POST: 결제 주문 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { studentId, courseId, amount, customerName, customerPhone } = body as {
      studentId?: string | null;
      courseId?: string | null;
      amount?: number;
      customerName?: string | null;
      customerPhone?: string | null;
    };

    // Public flow should not trust amount from client.
    // If courseId is provided, derive amount/orderName from DB.
    let finalAmount = amount;
    let finalCourseId: string | null = courseId || null;

    if (finalCourseId) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, price')
        .eq('id', finalCourseId)
        .single();

      if (courseError || !course) {
        console.error('Course lookup error:', courseError);
        return NextResponse.json(
          { error: '강좌 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      finalAmount = course.price;
    }

    if (!finalAmount || finalAmount <= 0) {
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
        course_id: finalCourseId,
        amount: finalAmount,
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

    // 학생 상태 업데이트 (서버에서만)
    if (studentId) {
      const { error: studentUpdateError } = await supabase
        .from('students')
        .update({ status: 'payment_requested' })
        .eq('id', studentId);
      if (studentUpdateError) {
        console.error('Student status update error:', studentUpdateError);
      }
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
    const supabase = getSupabaseAdmin();
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
        id,
        created_at,
        order_id,
        amount,
        status,
        customer_name,
        customer_phone,
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
