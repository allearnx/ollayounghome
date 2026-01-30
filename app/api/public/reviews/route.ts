import { NextResponse } from 'next/server';
import { getSupabasePublic } from '@/lib/supabase.public.server';

export async function GET() {
  try {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Public reviews error:', error);
      return NextResponse.json({ error: '후기를 불러올 수 없습니다.' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Public reviews unexpected error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

