import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// POST: 만족도 기록
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { type } = body;

    // 유효한 타입인지 확인
    if (!['good', 'neutral', 'bad'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid satisfaction type' },
        { status: 400 }
      );
    }

    // RPC 함수 호출로 원자적 증가
    const { error } = await supabase.rpc('increment_satisfaction', {
      target_type: type,
    });

    if (error) {
      console.error('Error recording satisfaction:', error);
      return NextResponse.json(
        { error: 'Failed to record satisfaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording satisfaction:', error);
    return NextResponse.json(
      { error: 'Failed to record satisfaction' },
      { status: 500 }
    );
  }
}
