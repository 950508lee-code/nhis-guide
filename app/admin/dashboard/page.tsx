"use client";

import Link from "next/link";
import { BarChart3, ArrowLeft, Users, ChevronRight, X, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getStatistics,
  getTopBranches,
  getAllBranchSearches,
  getMonthlyUsers,
  formatMonth,
  type Statistics,
  type MonthlyData,
} from "@/lib/statistics";

const ADMIN_PASSWORD = "1005";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [topBranches, setTopBranches] = useState<{ name: string; count: number }[]>([]);
  const [allBranches, setAllBranches] = useState<{ name: string; count: number }[]>([]);
  const [showAllBranches, setShowAllBranches] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadStats = () => {
      setStats(getStatistics());
      setTopBranches(getTopBranches(5));
      setAllBranches(getAllBranchSearches());
      setMonthlyData(getMonthlyUsers());
    };
    loadStats();

    // 1초마다 새로고침
    const interval = setInterval(loadStats, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPassword("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePasswordSubmit();
    }
  };

  // 비밀번호 입력 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white px-5 py-4 flex items-center border-b border-gray-100">
          <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <div className="flex items-center gap-3 ml-4">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900">민원 대시보드</h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-8 shadow-sm w-full max-w-sm">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">관리자 인증</h2>
              <p className="text-gray-500 text-sm mt-1">비밀번호를 입력해주세요</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                onKeyPress={handleKeyPress}
                placeholder="비밀번호 입력"
                className={`w-full px-4 py-3 border-2 rounded-xl text-center text-lg tracking-widest focus:outline-none transition-colors ${
                  passwordError
                    ? "border-red-300 bg-red-50 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500"
                }`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-sm text-center">비밀번호가 올바르지 않습니다</p>
              )}
              <button
                onClick={handlePasswordSubmit}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const totalSatisfaction = stats.satisfaction.good + stats.satisfaction.neutral + stats.satisfaction.bad;
  const satisfactionData = [
    {
      label: "좋아요",
      emoji: "😊",
      count: stats.satisfaction.good,
      percentage: totalSatisfaction > 0 ? Math.round((stats.satisfaction.good / totalSatisfaction) * 100) : 0,
      color: "bg-green-500",
    },
    {
      label: "보통",
      emoji: "😐",
      count: stats.satisfaction.neutral,
      percentage: totalSatisfaction > 0 ? Math.round((stats.satisfaction.neutral / totalSatisfaction) * 100) : 0,
      color: "bg-yellow-500",
    },
    {
      label: "나쁨",
      emoji: "😢",
      count: stats.satisfaction.bad,
      percentage: totalSatisfaction > 0 ? Math.round((stats.satisfaction.bad / totalSatisfaction) * 100) : 0,
      color: "bg-red-500",
    },
  ];

  // 선택된 연도의 월별 데이터 가져오기
  const getYearMonthlyData = (year: number) => {
    if (!stats) return [];
    const result = [];
    for (let i = 1; i <= 12; i++) {
      const monthKey = `${year}-${String(i).padStart(2, '0')}`;
      result.push({
        month: i,
        count: stats.monthlyUsers[monthKey] || 0,
      });
    }
    return result;
  };

  const yearMonthlyData = getYearMonthlyData(selectedYear);
  const maxMonthlyCount = Math.max(...yearMonthlyData.map((d) => d.count), 1);

  // 사용 가능한 연도 목록 (2024년부터 현재 연도까지)
  const availableYears = [];
  const currentYear = new Date().getFullYear();
  for (let year = 2024; year <= currentYear; year++) {
    availableYears.push(year);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white px-5 py-4 flex items-center border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900">민원 대시보드</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6 space-y-6">
        {/* 총 이용자 수 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">총 이용자 수</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}명</div>
              </div>
            </div>
            <button
              onClick={() => setShowMonthlyModal(true)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 만족도 조사 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            😊 만족도 조사
            <span className="text-sm font-normal text-gray-500">
              (총 {totalSatisfaction.toLocaleString()}건)
            </span>
          </h2>

          {totalSatisfaction === 0 ? (
            <div className="text-center py-8 text-gray-500">아직 만족도 응답이 없습니다</div>
          ) : (
            <div className="space-y-5">
              {satisfactionData.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-lg font-medium text-gray-900">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{item.count.toLocaleString()}명</span>
                      <span className="text-gray-500 ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 인기 지사 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              📍 자주 검색된 지사 TOP 5
            </h2>
            <button
              onClick={() => setShowAllBranches(true)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {topBranches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">아직 검색 기록이 없습니다</div>
          ) : (
            <div className="space-y-3">
              {topBranches.map((branch, index) => (
                <div key={branch.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-gray-200 text-gray-600"
                          : index === 2
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{branch.name}</span>
                  </div>
                  <span className="text-gray-600 font-medium">{branch.count}건</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 전체 지사 통계 모달 */}
      {showAllBranches && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-h-[80vh] rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">전체 지사 검색 통계</h2>
              <button
                onClick={() => setShowAllBranches(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto max-h-[calc(80vh-72px)]">
              {allBranches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">검색 기록이 없습니다</div>
              ) : (
                <div className="space-y-3">
                  {allBranches.map((branch, index) => (
                    <div key={branch.name} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : index === 1
                              ? "bg-gray-200 text-gray-600"
                              : index === 2
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-gray-900 font-medium">{branch.name}</span>
                      </div>
                      <span className="text-gray-600 font-semibold">{branch.count}건</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 월별 이용자 수 모달 */}
      {showMonthlyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-h-[80vh] rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">📊 월별 이용자 수</h2>
                <button
                  onClick={() => setShowMonthlyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              {/* 연도 탭 */}
              <div className="flex gap-2">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                      selectedYear === year
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {year}년
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 overflow-y-auto max-h-[calc(80vh-140px)]">
              {/* 2열 레이아웃: 1-6월 / 7-12월 */}
              <div className="grid grid-cols-2 gap-6">
                {/* 상반기 (1-6월) */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-500 mb-2">상반기</div>
                  {yearMonthlyData.slice(0, 6).map((data) => (
                    <div key={data.month} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700 font-medium">{data.month}월</span>
                      <span className={`font-bold ${data.count > 0 ? "text-blue-600" : "text-gray-400"}`}>
                        {data.count.toLocaleString()}명
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">소계</span>
                      <span className="text-blue-600 font-bold">
                        {yearMonthlyData.slice(0, 6).reduce((sum, d) => sum + d.count, 0).toLocaleString()}명
                      </span>
                    </div>
                  </div>
                </div>

                {/* 하반기 (7-12월) */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-500 mb-2">하반기</div>
                  {yearMonthlyData.slice(6, 12).map((data) => (
                    <div key={data.month} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700 font-medium">{data.month}월</span>
                      <span className={`font-bold ${data.count > 0 ? "text-blue-600" : "text-gray-400"}`}>
                        {data.count.toLocaleString()}명
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">소계</span>
                      <span className="text-blue-600 font-bold">
                        {yearMonthlyData.slice(6, 12).reduce((sum, d) => sum + d.count, 0).toLocaleString()}명
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 연간 합계 */}
              <div className="mt-6 pt-4 border-t-2 border-blue-200 bg-blue-50 -mx-5 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{selectedYear}년 총 이용자</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {yearMonthlyData.reduce((sum, d) => sum + d.count, 0).toLocaleString()}명
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
