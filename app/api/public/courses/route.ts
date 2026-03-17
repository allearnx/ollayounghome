import { NextRequest, NextResponse } from 'next/server';
import { getSupabasePublic } from '@/lib/supabase.public.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabasePublic();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('courses')
      .select(`*, teachers (*)`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Public courses error:', error);
      return NextResponse.json({ error: '강의 목록을 불러올 수 없습니다.' }, { status: 500, headers: cacheHeaders });
    }

    return NextResponse.json(data || [], { headers: cacheHeaders });
  } catch (error) {
    console.error('Public courses unexpected error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500, headers: cacheHeaders });
  }
}

