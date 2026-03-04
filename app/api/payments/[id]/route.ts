import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';
import { softDeleteById } from '@/lib/softDelete.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// DELETE - PG 결제 소프트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '결제 ID가 필요합니다.' }, { status: 400 });
    }

    return await softDeleteById(supabase, 'payments', id);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Payment delete API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
