import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH: 학생 정보 업데이트 (상태, 메모)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // 허용된 필드만 업데이트
    const allowedFields = ['status', 'memo'];
    const updateData: Record<string, string> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '업데이트할 필드가 없습니다.' }, { status: 400 });
    }

    // status 유효성 검사
    if (updateData.status) {
      const validStatuses = ['new', 'payment_requested', 'paid', 'completed'];
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json({ error: '유효하지 않은 상태값입니다.' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error updating student:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: 특정 학생 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching student:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


