import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Public teachers error:', error);
      return NextResponse.json({ error: '선생님 목록을 불러올 수 없습니다.' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Public teachers unexpected error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

