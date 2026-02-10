import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TAX_RATE = 0.033;

const computeTax = (grossAmount: number) => {
  const taxAmount = Math.round(grossAmount * TAX_RATE);
  const netAmount = grossAmount - taxAmount;
  return { grossAmount, taxAmount, netAmount };
};

const computeHourlyAmounts = (hours: number, rate: number) => {
  const grossAmount = Math.round(hours * rate);
  return computeTax(grossAmount);
};

const computePercentAmounts = (tuitionPerStudent: number, studentCount: number, percentRate: number) => {
  const grossAmount = Math.round(tuitionPerStudent * studentCount * percentRate);
  return computeTax(grossAmount);
};

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();
    const { id } = params;

    const body = await request.json();
    const {
      expense_date,
      teacher_name,
      pay_type,
      class_hours,
      hourly_rate,
      tuition_per_student,
      student_count,
      percent_rate,
      insurance_applicable,
      insurance_amount,
    } = body as {
      expense_date?: string;
      teacher_name?: string;
      pay_type?: 'HOURLY' | 'PERCENT';
      class_hours?: number;
      hourly_rate?: number;
      tuition_per_student?: number;
      student_count?: number;
      percent_rate?: number;
      insurance_applicable?: boolean;
      insurance_amount?: number;
    };

    const updateData: Record<string, unknown> = {};
    if (expense_date) updateData.expense_date = expense_date;
    if (teacher_name?.trim()) updateData.teacher_name = teacher_name.trim();
    if (pay_type) {
      if (pay_type !== 'HOURLY' && pay_type !== 'PERCENT') {
        return NextResponse.json({ error: '유효하지 않은 지급 방식입니다.' }, { status: 400 });
      }
      updateData.pay_type = pay_type;
    }
    if (typeof class_hours === 'number' && class_hours > 0) updateData.class_hours = class_hours;
    if (typeof hourly_rate === 'number' && hourly_rate > 0) updateData.hourly_rate = hourly_rate;
    if (typeof tuition_per_student === 'number' && tuition_per_student > 0) updateData.tuition_per_student = tuition_per_student;
    if (typeof student_count === 'number' && student_count > 0) updateData.student_count = student_count;
    if (typeof percent_rate === 'number' && percent_rate > 0) updateData.percent_rate = percent_rate;
    if (typeof insurance_applicable === 'boolean') updateData.insurance_applicable = insurance_applicable;
    if (typeof insurance_amount === 'number' && insurance_amount >= 0) updateData.insurance_amount = Math.round(insurance_amount);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '업데이트할 필드가 없습니다.' }, { status: 400 });
    }

    if (typeof class_hours === 'number' && class_hours <= 0) {
      return NextResponse.json({ error: '수업 시간을 확인해주세요.' }, { status: 400 });
    }
    if (typeof hourly_rate === 'number' && hourly_rate <= 0) {
      return NextResponse.json({ error: '시간당 페이를 확인해주세요.' }, { status: 400 });
    }
    if (typeof tuition_per_student === 'number' && tuition_per_student <= 0) {
      return NextResponse.json({ error: '수강료를 확인해주세요.' }, { status: 400 });
    }
    if (typeof student_count === 'number' && student_count <= 0) {
      return NextResponse.json({ error: '인원을 확인해주세요.' }, { status: 400 });
    }
    if (typeof percent_rate === 'number' && percent_rate <= 0) {
      return NextResponse.json({ error: '비율(%)을 확인해주세요.' }, { status: 400 });
    }

    const existing = await supabase
      .from('teacher_expenses')
      .select('pay_type, class_hours, hourly_rate, tuition_per_student, student_count, percent_rate, insurance_applicable, insurance_amount')
      .eq('id', id)
      .single();

    if (existing.error || !existing.data) {
      return NextResponse.json({ error: '강사료 내역을 찾을 수 없습니다.' }, { status: 404 });
    }

    const nextPayType = (updateData.pay_type as 'HOURLY' | 'PERCENT' | undefined) ?? existing.data.pay_type ?? 'HOURLY';
    const nextHours = (updateData.class_hours as number | undefined) ?? existing.data.class_hours;
    const nextRate = (updateData.hourly_rate as number | undefined) ?? existing.data.hourly_rate;
    const nextTuition = (updateData.tuition_per_student as number | undefined) ?? existing.data.tuition_per_student;
    const nextStudents = (updateData.student_count as number | undefined) ?? existing.data.student_count;
    const nextPercent = (updateData.percent_rate as number | undefined) ?? existing.data.percent_rate;

    let amounts: { grossAmount: number; taxAmount: number; netAmount: number };
    if (nextPayType === 'HOURLY') {
      if (!nextHours || !nextRate) {
        return NextResponse.json({ error: '시간당 항목의 값을 확인해주세요.' }, { status: 400 });
      }
      amounts = computeHourlyAmounts(nextHours, nextRate);
      updateData.tuition_per_student = null;
      updateData.student_count = null;
      updateData.percent_rate = null;
    } else {
      if (!nextTuition || !nextStudents || !nextPercent) {
        return NextResponse.json({ error: '비율제 항목의 값을 확인해주세요.' }, { status: 400 });
      }
      amounts = computePercentAmounts(nextTuition, nextStudents, nextPercent);
      updateData.class_hours = null;
      updateData.hourly_rate = null;
    }

    const nextInsuranceApplicable =
      (updateData.insurance_applicable as boolean | undefined) ?? existing.data.insurance_applicable ?? false;
    const nextInsuranceAmount =
      (updateData.insurance_amount as number | undefined) ?? existing.data.insurance_amount ?? 0;
    const insuranceAmount = nextInsuranceApplicable ? Math.max(0, Math.round(nextInsuranceAmount)) : 0;

    updateData.tax_rate = TAX_RATE;
    updateData.gross_amount = amounts.grossAmount;
    updateData.tax_amount = amounts.taxAmount;
    updateData.insurance_applicable = nextInsuranceApplicable;
    updateData.insurance_amount = insuranceAmount;
    updateData.net_amount = amounts.netAmount - insuranceAmount;
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
