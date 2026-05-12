"use client";

import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  Users,
  ChevronRight,
  X,
  Lock,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getStatistics,
  getTopBranches,
  getAllBranchSearches,
  getMonthlyUsers,
  type Statistics,
  type MonthlyData,
} from "@/lib/statistics";

const ADMIN_PASSWORD = "1005";

const cardShadow =
  "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [topBranches, setTopBranches] = useState<
    { name: string; count: number }[]
  >([]);
  const [allBranches, setAllBranches] = useState<
    { name: string; count: number }[]
  >([]);
  const [showAllBranches, setShowAllBranches] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadStats = async () => {
      const [statsData, topData, allData, monthlyData] = await Promise.all([
        getStatistics(),
        getTopBranches(5),
        getAllBranchSearches(),
        getMonthlyUsers(),
      ]);
      setStats(statsData);
      setTopBranches(topData);
      setAllBranches(allData);
      setMonthlyData(monthlyData);
    };
    loadStats();

    const interval = setInterval(loadStats, 5000);
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
      <div
        className="min-h-[100dvh] flex flex-col"
        style={{ backgroundColor: "#F4F7FB" }}
      >
        <header className="bg-white/90 backdrop-blur-md px-4 sm:px-5 pt-safe pb-3 flex items-center gap-3 border-b border-gray-100/80 sticky top-0 z-10">
          <Link
            href="/"
            aria-label="뒤로 가기"
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1
            className="text-[17px] sm:text-[19px] font-bold tracking-[-0.02em]"
            style={{ color: "#1F2937" }}
          >
            민원 대시보드
          </h1>
        </header>

        <div className="flex-1 flex items-center justify-center px-5">
          <div
            className="bg-white rounded-[20px] p-8 w-full max-w-sm"
            style={{ boxShadow: cardShadow }}
          >
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #EEF2FF 0%, #E0EAFF 100%)",
                }}
              >
                <Lock className="w-7 h-7" style={{ color: "#3B5BDB" }} />
              </div>
              <h2
                className="text-[19px] font-extrabold tracking-[-0.02em]"
                style={{ color: "#1F2937" }}
              >
                관리자 인증
              </h2>
              <p
                className="text-[13px] font-medium mt-1"
                style={{ color: "#6B7280" }}
              >
                비밀번호를 입력해주세요
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                onKeyPress={handleKeyPress}
                placeholder="비밀번호 입력"
                className={`w-full px-4 py-3.5 rounded-xl text-center text-[16px] tracking-widest font-bold focus:outline-none transition-colors border ${
                  passwordError
                    ? "border-red-300 bg-red-50/50"
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                }`}
                style={{ color: "#1F2937" }}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-[13px] font-medium text-center">
                  비밀번호가 올바르지 않습니다
                </p>
              )}
              <button
                onClick={handlePasswordSubmit}
                className="w-full rounded-xl py-3.5 px-5 text-[15px] font-bold text-white active:scale-[0.98] transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                  boxShadow:
                    "0 4px 12px -3px rgba(37,99,235,0.35), 0 1px 2px rgba(37,99,235,0.1)",
                }}
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
      <div
        className="min-h-[100dvh] flex items-center justify-center"
        style={{ backgroundColor: "#F4F7FB" }}
      >
        <div className="text-gray-500 font-medium">로딩 중...</div>
      </div>
    );
  }

  const totalSatisfaction =
    stats.satisfaction.good +
    stats.satisfaction.neutral +
    stats.satisfaction.bad;
  const satisfactionData = [
    {
      label: "좋아요",
      emoji: "😊",
      count: stats.satisfaction.good,
      percentage:
        totalSatisfaction > 0
          ? Math.round((stats.satisfaction.good / totalSatisfaction) * 100)
          : 0,
      color: "#10B981",
    },
    {
      label: "보통",
      emoji: "😐",
      count: stats.satisfaction.neutral,
      percentage:
        totalSatisfaction > 0
          ? Math.round((stats.satisfaction.neutral / totalSatisfaction) * 100)
          : 0,
      color: "#F59E0B",
    },
    {
      label: "나쁨",
      emoji: "😢",
      count: stats.satisfaction.bad,
      percentage:
        totalSatisfaction > 0
          ? Math.round((stats.satisfaction.bad / totalSatisfaction) * 100)
          : 0,
      color: "#EF4444",
    },
  ];

  // 선택된 연도의 월별 데이터 가져오기
  const getYearMonthlyData = (year: number) => {
    if (!stats) return [];
    const result = [];
    for (let i = 1; i <= 12; i++) {
      const monthKey = `${year}-${String(i).padStart(2, "0")}`;
      result.push({
        month: i,
        count: stats.monthlyUsers[monthKey] || 0,
      });
    }
    return result;
  };

  const yearMonthlyData = getYearMonthlyData(selectedYear);

  // 사용 가능한 연도 목록 (2026년부터 현재 연도까지)
  const availableYears = [];
  const currentYear = new Date().getFullYear();
  for (let year = 2026; year <= currentYear; year++) {
    availableYears.push(year);
  }

  const rankBadge = (index: number) => {
    if (index === 0)
      return { bg: "#FEF3C7", text: "#B45309" }; // 🥇 gold
    if (index === 1) return { bg: "#E5E7EB", text: "#4B5563" }; // 🥈 silver
    if (index === 2) return { bg: "#FED7AA", text: "#C2410C" }; // 🥉 bronze
    return { bg: "#F3F4F6", text: "#6B7280" };
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ backgroundColor: "#F4F7FB" }}
    >
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-4 sm:px-5 pt-safe pb-3 flex items-center gap-3 border-b border-gray-100/80 sticky top-0 z-10">
        <Link
          href="/"
          aria-label="뒤로 가기"
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1
          className="text-[17px] sm:text-[19px] font-bold tracking-[-0.02em]"
          style={{ color: "#1F2937" }}
        >
          민원 대시보드
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-5 pt-5 pb-safe space-y-3">
        {/* 총 이용자 수 카드 */}
        <button
          onClick={() => setShowMonthlyModal(true)}
          className="w-full bg-white rounded-[20px] p-5 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
          style={{ boxShadow: cardShadow }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #EEF2FF 0%, #E0EAFF 100%)",
            }}
          >
            <Users className="w-7 h-7" style={{ color: "#3B5BDB" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[12px] font-bold tracking-[0.02em] uppercase mb-1"
              style={{ color: "#9CA3AF" }}
            >
              총 이용자
            </div>
            <div
              className="text-[26px] font-extrabold tracking-[-0.02em] tabular-nums leading-none"
              style={{ color: "#1F2937" }}
            >
              {stats.totalUsers.toLocaleString()}
              <span className="text-[16px] font-bold ml-1" style={{ color: "#6B7280" }}>
                명
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
        </button>

        {/* 만족도 조사 카드 */}
        <div
          className="bg-white rounded-[20px] p-5"
          style={{ boxShadow: cardShadow }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
              }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: "#10925A" }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="text-[16px] font-bold tracking-[-0.02em]"
                style={{ color: "#1F2937" }}
              >
                만족도 조사
              </h2>
              <p
                className="text-[12px] font-medium mt-0.5"
                style={{ color: "#9CA3AF" }}
              >
                총 {totalSatisfaction.toLocaleString()}건 응답
              </p>
            </div>
          </div>

          {totalSatisfaction === 0 ? (
            <div
              className="text-center py-8 text-[14px] font-medium"
              style={{ color: "#9CA3AF" }}
            >
              아직 만족도 응답이 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {satisfactionData.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[20px]">{item.emoji}</span>
                      <span
                        className="text-[14px] font-bold"
                        style={{ color: "#1F2937" }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 tabular-nums">
                      <span
                        className="text-[15px] font-extrabold"
                        style={{ color: "#1F2937" }}
                      >
                        {item.count.toLocaleString()}
                      </span>
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: "#9CA3AF" }}
                      >
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-full h-2 rounded-md overflow-hidden"
                    style={{ backgroundColor: "#F1F5F9" }}
                  >
                    <div
                      className="h-full rounded-md transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 인기 지사 카드 */}
        <div
          className="bg-white rounded-[20px] p-5"
          style={{ boxShadow: cardShadow }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #FFF1E5 0%, #FFE8D6 100%)",
                }}
              >
                <MapPin className="w-5 h-5" style={{ color: "#C2410C" }} />
              </div>
              <div className="min-w-0">
                <h2
                  className="text-[16px] font-bold tracking-[-0.02em]"
                  style={{ color: "#1F2937" }}
                >
                  자주 검색된 지사
                </h2>
                <p
                  className="text-[12px] font-medium mt-0.5"
                  style={{ color: "#9CA3AF" }}
                >
                  TOP 5
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAllBranches(true)}
              aria-label="전체 보기"
              className="p-2 -mr-2 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {topBranches.length === 0 ? (
            <div
              className="text-center py-8 text-[14px] font-medium"
              style={{ color: "#9CA3AF" }}
            >
              아직 검색 기록이 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {topBranches.map((branch, index) => {
                const badge = rankBadge(index);
                return (
                  <div
                    key={branch.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold tabular-nums"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                        }}
                      >
                        {index + 1}
                      </span>
                      <span
                        className="text-[14px] sm:text-[15px] font-semibold"
                        style={{ color: "#1F2937" }}
                      >
                        {branch.name}
                      </span>
                    </div>
                    <span
                      className="text-[14px] font-bold tabular-nums"
                      style={{ color: "#6B7280" }}
                    >
                      {branch.count}건
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 전체 지사 통계 모달 */}
      {showAllBranches && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setShowAllBranches(false)}
        >
          <div
            className="bg-white w-full max-h-[82dvh] rounded-t-[28px] overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 pt-3 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2
                className="text-[18px] font-bold tracking-[-0.02em]"
                style={{ color: "#1F2937" }}
              >
                전체 지사 검색 통계
              </h2>
              <button
                onClick={() => setShowAllBranches(false)}
                aria-label="닫기"
                className="p-2 -mr-2 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto">
              {allBranches.length === 0 ? (
                <div
                  className="text-center py-8 text-[14px] font-medium"
                  style={{ color: "#9CA3AF" }}
                >
                  검색 기록이 없습니다
                </div>
              ) : (
                <div className="space-y-3">
                  {allBranches.map((branch, index) => {
                    const badge = rankBadge(index);
                    return (
                      <div
                        key={branch.name}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-extrabold tabular-nums"
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.text,
                            }}
                          >
                            {index + 1}
                          </span>
                          <span
                            className="text-[15px] font-semibold"
                            style={{ color: "#1F2937" }}
                          >
                            {branch.name}
                          </span>
                        </div>
                        <span
                          className="text-[14px] font-bold tabular-nums"
                          style={{ color: "#6B7280" }}
                        >
                          {branch.count}건
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 월별 이용자 수 모달 */}
      {showMonthlyModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setShowMonthlyModal(false)}
        >
          <div
            className="bg-white w-full max-h-[88dvh] rounded-t-[28px] overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 pt-3 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-[18px] font-bold tracking-[-0.02em] flex items-center gap-2"
                  style={{ color: "#1F2937" }}
                >
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  월별 이용자 수
                </h2>
                <button
                  onClick={() => setShowMonthlyModal(false)}
                  aria-label="닫기"
                  className="p-2 -mr-2 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              {/* 연도 탭 */}
              <div className="flex gap-1.5">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-colors ${
                      selectedYear === year
                        ? "text-white"
                        : "text-gray-500 bg-gray-100"
                    }`}
                    style={
                      selectedYear === year
                        ? {
                            background:
                              "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                          }
                        : undefined
                    }
                  >
                    {year}년
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 overflow-y-auto">
              {/* 2열 레이아웃: 1-6월 / 7-12월 */}
              <div className="grid grid-cols-2 gap-5">
                {/* 상반기 */}
                <div>
                  <div
                    className="text-[11px] font-bold tracking-[0.08em] uppercase mb-2"
                    style={{ color: "#9CA3AF" }}
                  >
                    상반기
                  </div>
                  <div className="space-y-2">
                    {yearMonthlyData.slice(0, 6).map((data) => (
                      <div
                        key={data.month}
                        className="flex items-center justify-between py-1.5 border-b"
                        style={{ borderColor: "#F1F5F9" }}
                      >
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: "#374151" }}
                        >
                          {data.month}월
                        </span>
                        <span
                          className="text-[13px] font-extrabold tabular-nums"
                          style={{
                            color: data.count > 0 ? "#2563EB" : "#9CA3AF",
                          }}
                        >
                          {data.count.toLocaleString()}명
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 mt-1 border-t-2" style={{ borderColor: "#E5E7EB" }}>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[12px] font-bold" style={{ color: "#6B7280" }}>
                        소계
                      </span>
                      <span
                        className="text-[14px] font-extrabold tabular-nums"
                        style={{ color: "#2563EB" }}
                      >
                        {yearMonthlyData
                          .slice(0, 6)
                          .reduce((sum, d) => sum + d.count, 0)
                          .toLocaleString()}
                        명
                      </span>
                    </div>
                  </div>
                </div>

                {/* 하반기 */}
                <div>
                  <div
                    className="text-[11px] font-bold tracking-[0.08em] uppercase mb-2"
                    style={{ color: "#9CA3AF" }}
                  >
                    하반기
                  </div>
                  <div className="space-y-2">
                    {yearMonthlyData.slice(6, 12).map((data) => (
                      <div
                        key={data.month}
                        className="flex items-center justify-between py-1.5 border-b"
                        style={{ borderColor: "#F1F5F9" }}
                      >
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: "#374151" }}
                        >
                          {data.month}월
                        </span>
                        <span
                          className="text-[13px] font-extrabold tabular-nums"
                          style={{
                            color: data.count > 0 ? "#2563EB" : "#9CA3AF",
                          }}
                        >
                          {data.count.toLocaleString()}명
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 mt-1 border-t-2" style={{ borderColor: "#E5E7EB" }}>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[12px] font-bold" style={{ color: "#6B7280" }}>
                        소계
                      </span>
                      <span
                        className="text-[14px] font-extrabold tabular-nums"
                        style={{ color: "#2563EB" }}
                      >
                        {yearMonthlyData
                          .slice(6, 12)
                          .reduce((sum, d) => sum + d.count, 0)
                          .toLocaleString()}
                        명
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 연간 합계 */}
              <div
                className="mt-5 rounded-2xl p-4 flex items-center justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, #EEF2FF 0%, #E0EAFF 100%)",
                }}
              >
                <div>
                  <div
                    className="text-[11px] font-bold tracking-[0.08em] uppercase mb-1"
                    style={{ color: "#3B5BDB" }}
                  >
                    {selectedYear}년 총 이용자
                  </div>
                  <div
                    className="text-[24px] font-extrabold tracking-[-0.02em] tabular-nums leading-none"
                    style={{ color: "#1F2937" }}
                  >
                    {yearMonthlyData
                      .reduce((sum, d) => sum + d.count, 0)
                      .toLocaleString()}
                    <span
                      className="text-[14px] font-bold ml-1"
                      style={{ color: "#6B7280" }}
                    >
                      명
                    </span>
                  </div>
                </div>
                <Users className="w-8 h-8" style={{ color: "#3B5BDB", opacity: 0.4 }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
