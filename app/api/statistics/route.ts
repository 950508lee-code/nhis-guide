import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET: 전체 통계 조회
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // 병렬로 모든 데이터 조회
    const [usersResult, satisfactionResult, branchesResult] = await Promise.all([
      supabase.from('statistics_users').select('month, count'),
      supabase.from('statistics_satisfaction').select('type, count'),
      supabase.from('statistics_branch_searches').select('branch_name, count'),
    ]);

    // 월별 이용자 수 및 총 이용자 수 계산
    const monthlyUsers: { [month: string]: number } = {};
    let totalUsers = 0;
    usersResult.data?.forEach((row) => {
      monthlyUsers[row.month] = row.count;
      totalUsers += row.count;
    });

    // 만족도 데이터 변환
    const satisfaction = { good: 0, neutral: 0, bad: 0 };
    satisfactionResult.data?.forEach((row) => {
      const type = row.type as keyof typeof satisfaction;
      satisfaction[type] = row.count;
    });

    // 지사 검색 데이터 변환
    const byBranch: { [branchName: string]: number } = {};
    let branchTotal = 0;
    branchesResult.data?.forEach((row) => {
      byBranch[row.branch_name] = row.count;
      branchTotal += row.count;
    });

    return NextResponse.json({
      totalUsers,
      monthlyUsers,
      satisfaction,
      branchSearches: { total: branchTotal, byBranch },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
