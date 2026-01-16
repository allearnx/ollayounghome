import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();

    const limit = Math.min(
      Math.max(parseInt(new URL(request.url).searchParams.get('limit') || '50', 10), 1),
      200
    );

    const [{ data: paymentsData, error: paymentsError }, { data: studentsData, error: studentsError }, { data: coursesData, error: coursesError }] =
      await Promise.all([
        supabase
          .from('payments')
          .select(
            `
            *,
            students (id, student_name, parent_phone),
            courses (id, title, price)
          `
          )
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('students')
          .select('id, student_name, parent_phone, status')
          .order('created_at', { ascending: false }),
        supabase.from('courses').select('id, title, price').order('title', { ascending: true }),
      ]);

    if (paymentsError) {
      console.error('Admin overview paymentsError:', paymentsError);
      return NextResponse.json({ error: '결제 내역을 불러올 수 없습니다.' }, { status: 500 });
    }
    if (studentsError) {
      console.error('Admin overview studentsError:', studentsError);
      return NextResponse.json({ error: '학생 목록을 불러올 수 없습니다.' }, { status: 500 });
    }
    if (coursesError) {
      console.error('Admin overview coursesError:', coursesError);
      return NextResponse.json({ error: '강좌 목록을 불러올 수 없습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      payments: paymentsData || [],
      students: studentsData || [],
      courses: coursesData || [],
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

