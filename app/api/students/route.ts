import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

// GET: 모든 학생 목록 조회
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Error fetching students:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 새 학생 등록 (수강 신청)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { student_name, parent_phone, grade } = body;

    // 유효성 검사
    if (!student_name?.trim()) {
      return NextResponse.json({ error: '수강생 이름을 입력해주세요.' }, { status: 400 });
    }

    if (!grade?.trim()) {
      return NextResponse.json({ error: '학년을 선택해주세요.' }, { status: 400 });
    }

    const phoneNumbers = parent_phone?.replace(/[^\d]/g, '') || '';
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      return NextResponse.json({ error: '올바른 연락처를 입력해주세요.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('students').insert({
      student_name: student_name.trim(),
      grade: grade.trim(),
      parent_phone,
      status: 'new',
      memo: '',
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Error creating student:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





