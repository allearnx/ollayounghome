import { NextRequest, NextResponse } from 'next/server';
import { getSupabasePublic } from '@/lib/supabase.public.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabasePublic();
    const teacherId = params.id;

    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json({ error: '선생님을 찾을 수 없습니다.' }, { status: 404, headers: cacheHeaders });
    }

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('Public teacher courses error:', coursesError);
      return NextResponse.json({ error: '강의 목록을 불러올 수 없습니다.' }, { status: 500, headers: cacheHeaders });
    }

    return NextResponse.json({ teacher, courses: courses || [] }, { headers: cacheHeaders });
  } catch (error) {
    console.error('Public teacher detail error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500, headers: cacheHeaders });
  }
}

