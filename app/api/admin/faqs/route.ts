import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireStaffOrAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireStaffOrAdmin(request);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Admin faqs GET error:', error);
      return NextResponse.json({ error: 'FAQ 목록을 불러올 수 없습니다.' }, { status: 500 });
    }

    return NextResponse.json({ faqs: data || [] });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaffOrAdmin(request);
    const supabase = getSupabaseAdmin();
    const body = (await request.json()) as {
      question?: string;
      answer?: string;
      category?: string;
      display_order?: number;
    };

    const question = (body.question ?? '').trim();
    const answer = (body.answer ?? '').trim();
    const category = (body.category ?? 'general').trim();
    const displayOrder = Number.isFinite(body.display_order) ? Number(body.display_order) : 0;

    if (!question) {
      return NextResponse.json({ error: '질문을 입력해주세요.' }, { status: 400 });
    }
    if (!answer) {
      return NextResponse.json({ error: '답변을 입력해주세요.' }, { status: 400 });
    }

    const { error } = await supabase.from('faqs').insert({
      question,
      answer,
      category,
      display_order: displayOrder,
      is_visible: true,
    });

    if (error) {
      console.error('Admin faqs POST error:', error);
      return NextResponse.json({ error: 'FAQ 등록에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
