import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';
import { AdminAuthError, requireAdmin } from '@/lib/adminAuth.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// DELETE - 수동 결제 소프트 삭제
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

    // 삭제되지 않은 결제만 소프트 삭제
    const { data, error } = await supabase
      .from('manual_payments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id')
      .single();

    if (error || !data) {
      console.error('Manual payment soft delete error:', error);
      return NextResponse.json(
        { error: '수동 결제를 찾을 수 없거나 이미 삭제되었습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Manual payment delete API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
