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
    const courseId = params.id;

    const { data, error } = await supabase
      .from('courses')
      .select(`*, teachers (*)`)
      .eq('id', courseId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '강좌를 찾을 수 없습니다.' }, { status: 404, headers: cacheHeaders });
    }

    return NextResponse.json(data, { headers: cacheHeaders });
  } catch (error) {
    console.error('Public course detail error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500, headers: cacheHeaders });
  }
}

