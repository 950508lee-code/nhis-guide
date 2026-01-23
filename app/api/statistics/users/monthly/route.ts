import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET: 월별 이용자 수 조회
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // 해당 연도의 월별 데이터 조회
    const { data, error } = await supabase
      .from('statistics_users')
      .select('month, count')
      .like('month', `${year}-%`)
      .order('month', { ascending: true });

    if (error) {
      console.error('Error fetching monthly users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch monthly users' },
        { status: 500 }
      );
    }

    // 1월부터 12월까지 모든 월 데이터 생성 (없는 월은 0)
    const result = [];
    for (let i = 1; i <= 12; i++) {
      const monthKey = `${year}-${String(i).padStart(2, '0')}`;
      const found = data?.find((d) => d.month === monthKey);
      result.push({
        month: monthKey,
        count: found?.count || 0,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching monthly users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly users' },
      { status: 500 }
    );
  }
}
