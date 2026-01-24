// 통계 데이터 관리 유틸리티 (API 호출 버전)

export type SatisfactionType = 'good' | 'neutral' | 'bad';

export interface MonthlyData {
  month: string; // YYYY-MM 형식
  count: number;
}

export interface Statistics {
  totalUsers: number;
  monthlyUsers: { [month: string]: number }; // YYYY-MM: count
  satisfaction: {
    good: number;
    neutral: number;
    bad: number;
  };
  branchSearches: {
    total: number;
    byBranch: { [branchName: string]: number };
  };
}

const API_BASE = '/api/statistics';

// 기본 통계 데이터
function getDefaultStats(): Statistics {
  return {
    totalUsers: 0,
    monthlyUsers: {},
    satisfaction: {
      good: 0,
      neutral: 0,
      bad: 0,
    },
    branchSearches: {
      total: 0,
      byBranch: {},
    },
  };
}

// 통계 데이터 가져오기 (API 호출)
export async function getStatistics(): Promise<Statistics> {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return await response.json();
  } catch (error) {
    console.error('Failed to load statistics:', error);
    return getDefaultStats();
  }
}

// 이용자 수 증가 (API 호출)
export async function incrementUserCount(): Promise<void> {
  try {
    await fetch(`${API_BASE}/users`, { method: 'POST' });
  } catch (error) {
    console.error('Failed to increment user count:', error);
  }
}

// 만족도 기록 (API 호출)
export async function recordSatisfaction(type: SatisfactionType): Promise<void> {
  try {
    await fetch(`${API_BASE}/satisfaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
  } catch (error) {
    console.error('Failed to record satisfaction:', error);
  }
}

// 지사 검색 기록 (API 호출)
export async function recordBranchSearch(branchName: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchName }),
    });
  } catch (error) {
    console.error('Failed to record branch search:', error);
  }
}

// 상위 검색 지사 가져오기 (API 호출)
export async function getTopBranches(limit: number = 5): Promise<{ name: string; count: number }[]> {
  try {
    const response = await fetch(`${API_BASE}/branches/top?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch top branches');
    return await response.json();
  } catch (error) {
    console.error('Failed to get top branches:', error);
    return [];
  }
}

// 전체 지사 검색 통계 가져오기 (API 호출)
export async function getAllBranchSearches(): Promise<{ name: string; count: number }[]> {
  try {
    const response = await fetch(`${API_BASE}/branches`);
    if (!response.ok) throw new Error('Failed to fetch all branches');
    return await response.json();
  } catch (error) {
    console.error('Failed to get all branch searches:', error);
    return [];
  }
}

// 월별 이용자 수 가져오기 (API 호출)
export async function getMonthlyUsers(year?: number): Promise<MonthlyData[]> {
  try {
    const targetYear = year || new Date().getFullYear();
    const response = await fetch(`${API_BASE}/users/monthly?year=${targetYear}`);
    if (!response.ok) throw new Error('Failed to fetch monthly users');
    return await response.json();
  } catch (error) {
    console.error('Failed to get monthly users:', error);
    return [];
  }
}

// 월 표시 형식 변환 (YYYY-MM -> M월)
export function formatMonth(monthKey: string): string {
  const month = parseInt(monthKey.split('-')[1], 10);
  return `${month}월`;
}

// 메뉴 방문 시 이용자 카운트 (하루 1회, 어떤 메뉴든 첫 클릭만)
export async function countMenuVisit(): Promise<void> {
  const storageKey = "nhis_daily_counted";
  const today = new Date().toISOString().split('T')[0];

  try {
    const lastCountedDate = localStorage.getItem(storageKey);

    // 오늘 이미 카운트됐으면 무시
    if (lastCountedDate === today) {
      return;
    }

    // 카운트 증가 및 날짜 기록
    await incrementUserCount();
    localStorage.setItem(storageKey, today);
  } catch (error) {
    console.error('Failed to count menu visit:', error);
  }
}
