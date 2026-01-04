// 통계 데이터 관리 유틸리티

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

const STATS_KEY = 'nhis_statistics';

// 기본 통계 데이터
const defaultStats: Statistics = {
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

// 현재 월 가져오기 (YYYY-MM 형식)
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// 통계 데이터 가져오기
export function getStatistics(): Statistics {
  if (typeof window === 'undefined') return defaultStats;

  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 이전 버전과의 호환성을 위해 monthlyUsers가 없으면 추가
      if (!parsed.monthlyUsers) {
        parsed.monthlyUsers = {};
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
  return defaultStats;
}

// 통계 데이터 저장하기
function saveStatistics(stats: Statistics): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save statistics:', error);
  }
}

// 이용자 수 증가 (월별도 함께)
export function incrementUserCount(): void {
  const stats = getStatistics();
  const currentMonth = getCurrentMonth();

  stats.totalUsers += 1;
  stats.monthlyUsers[currentMonth] = (stats.monthlyUsers[currentMonth] || 0) + 1;

  saveStatistics(stats);
}

// 만족도 기록
export function recordSatisfaction(type: SatisfactionType): void {
  const stats = getStatistics();
  stats.satisfaction[type] += 1;
  saveStatistics(stats);
}

// 지사 검색 기록
export function recordBranchSearch(branchName: string): void {
  const stats = getStatistics();
  stats.branchSearches.total += 1;
  stats.branchSearches.byBranch[branchName] = (stats.branchSearches.byBranch[branchName] || 0) + 1;
  saveStatistics(stats);
}

// 상위 검색 지사 가져오기
export function getTopBranches(limit: number = 5): { name: string; count: number }[] {
  const stats = getStatistics();
  const branches = Object.entries(stats.branchSearches.byBranch)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return branches;
}

// 전체 지사 검색 통계 가져오기
export function getAllBranchSearches(): { name: string; count: number }[] {
  const stats = getStatistics();
  return Object.entries(stats.branchSearches.byBranch)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// 월별 이용자 수 가져오기 (최근 6개월)
export function getMonthlyUsers(months: number = 6): MonthlyData[] {
  const stats = getStatistics();
  const result: MonthlyData[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    result.push({
      month: monthKey,
      count: stats.monthlyUsers[monthKey] || 0,
    });
  }

  return result;
}

// 월 표시 형식 변환 (YYYY-MM -> M월)
export function formatMonth(monthKey: string): string {
  const month = parseInt(monthKey.split('-')[1], 10);
  return `${month}월`;
}

// 통계 초기화 (개발/테스트용)
export function resetStatistics(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STATS_KEY);
}
