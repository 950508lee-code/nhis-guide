import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET: 상위 지사 검색 통계 조회
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const { data, error } = await supabase
      .from('statistics_branch_searches')
      .select('branch_name, count')
      .order('count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top branches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch top branches' },
        { status: 500 }
      );
    }

    // 형식 변환
    const result = data?.map((row) => ({
      name: row.branch_name,
      count: row.count,
    })) || [];

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching top branches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top branches' },
      { status: 500 }
    );
  }
}
