import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireStaffOrAdmin } from '@/lib/adminAuth.server';
import { sendTelegramMessage } from '@/lib/telegram.server';

// GET: 모든 학생 목록 조회
export async function GET(request: NextRequest) {
  try {
    await requireStaffOrAdmin(request);
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
    const { student_name, parent_phone, grade, interest_course_ids } = body as {
      student_name: string;
      parent_phone: string;
      grade: string;
      interest_course_ids?: string[];
    };

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
    if (!Array.isArray(interest_course_ids) || interest_course_ids.length === 0) {
      return NextResponse.json({ error: '관심 있는 수업을 선택해주세요.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('students').insert({
      student_name: student_name.trim(),
      grade: grade.trim(),
      parent_phone,
      status: 'new',
      memo: '',
      interest_course_ids,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 텔레그램 상담 신청 알림
    try {
      const { data: courses } = await supabase
        .from('courses')
        .select('title')
        .in('id', interest_course_ids);

      const courseNames = courses?.map((c) => c.title).join(', ') || '-';

      const dateStr = new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });

      await sendTelegramMessage([
        `📋 <b>상담 신청이 들어왔습니다!</b>`,
        ``,
        `👤 학생 이름: ${student_name.trim()}`,
        `📚 학년: ${grade.trim()}`,
        `📱 학부모 연락처: ${parent_phone}`,
        `🎯 관심 강의: ${courseNames}`,
        `🕐 신청 시각: ${dateStr}`,
      ].join('\n'));
    } catch (telegramError) {
      console.error('[students] 텔레그램 알림 실패:', telegramError);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Error creating student:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





