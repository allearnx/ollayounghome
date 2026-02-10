import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TAX_RATE = 0.033;

const toKstDateString = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(d);

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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '200', 10), 1), 500);

    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 11);
    start.setDate(1);

    const startDate = toKstDateString(start);
    const endDate = toKstDateString(end);

    const { data, error } = await supabase
      .from('teacher_expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Teacher expenses fetch error:', error);
      return NextResponse.json({ error: '강사료 내역을 불러올 수 없습니다.' }, { status: 500 });
    }

    return NextResponse.json({ expenses: data || [] });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Teacher expenses API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();

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
      expense_date: string;
      teacher_name: string;
      pay_type?: 'HOURLY' | 'PERCENT';
      class_hours?: number;
      hourly_rate?: number;
      tuition_per_student?: number;
      student_count?: number;
      percent_rate?: number;
      insurance_applicable?: boolean;
      insurance_amount?: number;
    };

    if (!expense_date) {
      return NextResponse.json({ error: '날짜를 입력해주세요.' }, { status: 400 });
    }
    if (!teacher_name?.trim()) {
      return NextResponse.json({ error: '선생님 이름을 입력해주세요.' }, { status: 400 });
    }
    const payType: 'HOURLY' | 'PERCENT' = pay_type === 'PERCENT' ? 'PERCENT' : 'HOURLY';

    let amounts: { grossAmount: number; taxAmount: number; netAmount: number };
    if (payType === 'HOURLY') {
      if (!class_hours || class_hours <= 0) {
        return NextResponse.json({ error: '수업 시간을 입력해주세요.' }, { status: 400 });
      }
      if (!hourly_rate || hourly_rate <= 0) {
        return NextResponse.json({ error: '시간당 페이를 입력해주세요.' }, { status: 400 });
      }
      amounts = computeHourlyAmounts(class_hours, hourly_rate);
    } else {
      if (!tuition_per_student || tuition_per_student <= 0) {
        return NextResponse.json({ error: '수강료를 입력해주세요.' }, { status: 400 });
      }
      if (!student_count || student_count <= 0) {
        return NextResponse.json({ error: '인원을 입력해주세요.' }, { status: 400 });
      }
      if (!percent_rate || percent_rate <= 0) {
        return NextResponse.json({ error: '비율(%)을 입력해주세요.' }, { status: 400 });
      }
      amounts = computePercentAmounts(tuition_per_student, student_count, percent_rate);
    }

    const insuranceApplicable = Boolean(insurance_applicable);
    const insuranceAmount = insuranceApplicable ? Math.max(0, Math.round(insurance_amount ?? 0)) : 0;
    const netAfterInsurance = amounts.netAmount - insuranceAmount;

    const { data, error } = await supabase
      .from('teacher_expenses')
      .insert({
        expense_date,
        teacher_name: teacher_name.trim(),
        pay_type: payType,
        class_hours: payType === 'HOURLY' ? class_hours : null,
        hourly_rate: payType === 'HOURLY' ? hourly_rate : null,
        tuition_per_student: payType === 'PERCENT' ? tuition_per_student : null,
        student_count: payType === 'PERCENT' ? student_count : null,
        percent_rate: payType === 'PERCENT' ? percent_rate : null,
        insurance_applicable: insuranceApplicable,
        insurance_amount: insuranceAmount,
        tax_rate: TAX_RATE,
        gross_amount: amounts.grossAmount,
        tax_amount: amounts.taxAmount,
        net_amount: netAfterInsurance,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Teacher expenses create error:', error);
      return NextResponse.json({ error: '강사료 등록에 실패했습니다.' }, { status: 500 });
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
