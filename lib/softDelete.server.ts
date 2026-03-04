import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function softDeleteById(
  supabase: SupabaseClient,
  table: 'payments' | 'manual_payments',
  id: string
) {
  const { data, error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: '결제를 찾을 수 없거나 이미 삭제되었습니다.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, id: data.id });
}
