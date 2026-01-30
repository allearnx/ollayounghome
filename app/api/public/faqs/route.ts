import { NextResponse } from 'next/server';
import { getSupabasePublic } from '@/lib/supabase.public.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET() {
  try {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Public faqs error:', error);
      return NextResponse.json({ error: 'FAQ를 불러올 수 없습니다.' }, { status: 500, headers: cacheHeaders });
    }

    return NextResponse.json(data || [], { headers: cacheHeaders });
  } catch (error) {
    console.error('Public faqs unexpected error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500, headers: cacheHeaders });
  }
}

