import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// POST: 이용자 수 증가
export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // RPC 함수 호출로 원자적 증가
    const { error } = await supabase.rpc('increment_user_count', {
      target_month: month,
    });

    if (error) {
      console.error('Error incrementing user count:', error);
      return NextResponse.json(
        { error: 'Failed to increment user count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing user count:', error);
    return NextResponse.json(
      { error: 'Failed to increment user count' },
      { status: 500 }
    );
  }
}
