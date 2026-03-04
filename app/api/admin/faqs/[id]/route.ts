import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireStaffOrAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffOrAdmin(request);
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { data, error } = await supabase.from('faqs').select('*').eq('id', id).single();
    if (error || !data) {
      return NextResponse.json({ error: 'FAQ를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ faq: data });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffOrAdmin(request);
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    const body = (await request.json()) as {
      question?: string;
      answer?: string;
      category?: string;
      display_order?: number;
      is_visible?: boolean;
    };

    const updatePayload = {
      ...(body.question !== undefined ? { question: body.question.trim() } : {}),
      ...(body.answer !== undefined ? { answer: body.answer.trim() } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.display_order !== undefined ? { display_order: Number(body.display_order) || 0 } : {}),
      ...(body.is_visible !== undefined ? { is_visible: Boolean(body.is_visible) } : {}),
    };

    const { error } = await supabase.from('faqs').update(updatePayload).eq('id', id);
    if (error) {
      console.error('Admin faqs PATCH error:', error);
      return NextResponse.json({ error: 'FAQ 수정에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffOrAdmin(request);
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) {
      console.error('Admin faqs DELETE error:', error);
      return NextResponse.json({ error: 'FAQ 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
