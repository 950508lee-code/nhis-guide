import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET: 전체 지사 검색 통계 조회
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('statistics_branch_searches')
      .select('branch_name, count')
      .order('count', { ascending: false });

    if (error) {
      console.error('Error fetching branch searches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch branch searches' },
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
    console.error('Error fetching branch searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch searches' },
      { status: 500 }
    );
  }
}

// POST: 지사 검색 기록
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { branchName } = body;

    if (!branchName) {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      );
    }

    // RPC 함수 호출로 원자적 증가
    const { error } = await supabase.rpc('increment_branch_search', {
      target_branch: branchName,
    });

    if (error) {
      console.error('Error recording branch search:', error);
      return NextResponse.json(
        { error: 'Failed to record branch search' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording branch search:', error);
    return NextResponse.json(
      { error: 'Failed to record branch search' },
      { status: 500 }
    );
  }
}
