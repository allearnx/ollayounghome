import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TAX_RATE = 0.033;

const computeAmounts = (hours: number, rate: number) => {
  const grossAmount = Math.round(hours * rate);
  const taxAmount = Math.round(grossAmount * TAX_RATE);
  const netAmount = grossAmount - taxAmount;
  return { grossAmount, taxAmount, netAmount };
};

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();
    const { id } = params;

    const body = await request.json();
    const { expense_date, teacher_name, class_hours, hourly_rate } = body as {
      expense_date?: string;
      teacher_name?: string;
      class_hours?: number;
      hourly_rate?: number;
    };

    const updateData: Record<string, unknown> = {};
    if (expense_date) updateData.expense_date = expense_date;
    if (teacher_name?.trim()) updateData.teacher_name = teacher_name.trim();
    if (typeof class_hours === 'number' && class_hours > 0) updateData.class_hours = class_hours;
    if (typeof hourly_rate === 'number' && hourly_rate > 0) updateData.hourly_rate = hourly_rate;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '업데이트할 필드가 없습니다.' }, { status: 400 });
    }

    if (typeof class_hours === 'number' && class_hours <= 0) {
      return NextResponse.json({ error: '수업 시간을 확인해주세요.' }, { status: 400 });
    }
    if (typeof hourly_rate === 'number' && hourly_rate <= 0) {
      return NextResponse.json({ error: '시간당 페이를 확인해주세요.' }, { status: 400 });
    }

    const existing = await supabase
      .from('teacher_expenses')
      .select('class_hours, hourly_rate')
      .eq('id', id)
      .single();

    if (existing.error || !existing.data) {
      return NextResponse.json({ error: '강사료 내역을 찾을 수 없습니다.' }, { status: 404 });
    }

    const nextHours = (updateData.class_hours as number | undefined) ?? existing.data.class_hours;
    const nextRate = (updateData.hourly_rate as number | undefined) ?? existing.data.hourly_rate;
    const { grossAmount, taxAmount, netAmount } = computeAmounts(nextHours, nextRate);

    updateData.tax_rate = TAX_RATE;
    updateData.gross_amount = grossAmount;
    updateData.tax_amount = taxAmount;
    updateData.net_amount = netAmount;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('teacher_expenses')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Teacher expenses update error:', error);
      return NextResponse.json({ error: '강사료 수정에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ expense: data });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Teacher expenses API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();
    const { id } = params;

    const { error } = await supabase.from('teacher_expenses').delete().eq('id', id);
    if (error) {
      console.error('Teacher expenses delete error:', error);
      return NextResponse.json({ error: '강사료 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Teacher expenses API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
