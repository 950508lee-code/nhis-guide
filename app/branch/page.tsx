"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Home, Search, ChevronRight, X, MapPin, Download, Share2, ThumbsUp, CheckCircle2, Printer, Building2, Navigation } from "lucide-react";
import { regions, getBranchesByRegion, Branch } from "@/lib/branches";
import html2canvas from "html2canvas";
import { recordBranchSearch, recordSatisfaction, countMenuVisit, type SatisfactionType } from "@/lib/statistics";

export default function BranchPage() {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // 페이지 방문 시 이용자 카운트 (하루 1회)
  useEffect(() => {
    countMenuVisit();
  }, []);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // 전체 지사 목록 가져오기
  const allBranches = useMemo(() => {
    return regions
      .flatMap((region) => getBranchesByRegion(region))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
  }, []);

  // 검색 필터링
  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) {
      return allBranches;
    }
    const query = searchQuery.toLowerCase().trim();
    return allBranches
      .filter(
        (branch) =>
          branch.name.toLowerCase().includes(query) ||
          branch.region.toLowerCase().includes(query) ||
          branch.department.toLowerCase().includes(query) ||
          branch.address.toLowerCase().includes(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
  }, [searchQuery, allBranches]);

  // 지역별 지사
  const branches = selectedRegion ? getBranchesByRegion(selectedRegion) : [];

  // 뒤로가기
  const handleBack = () => {
    if (selectedBranch) {
      setSelectedBranch(null);
    } else if (selectedRegion) {
      setSelectedRegion(null);
    }
  };

  // 지역 선택
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setSelectedBranch(null);
  };

  // 저장하기 (다운로드)
  const handleSave = async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        logging: false,
      });

      // Canvas를 Blob으로 변환하여 다운로드
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('이미지 생성에 실패했습니다.');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedBranch?.name}_정보.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('캡처 실패:', error);
      alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 공유하기
  const handleShare = async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        logging: false,
      });

      // Canvas를 Blob으로 변환
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('이미지 생성에 실패했습니다.');
          return;
        }

        const file = new File([blob], `${selectedBranch?.name}_정보.png`, {
          type: 'image/png',
        });

        // Web Share API 지원 확인
        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `${selectedBranch?.name} 정보`,
              text: `${selectedBranch?.name} 연락처 정보`,
            });
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              console.error('공유 실패:', error);
              alert('공유에 실패했습니다. 다시 시도해주세요.');
            }
          }
        } else {
          alert('이 브라우저는 공유 기능을 지원하지 않습니다. 저장하기 버튼을 이용해주세요.');
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('캡처 실패:', error);
      alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ backgroundColor: "#F4F7FB" }}
    >
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-4 sm:px-5 pt-safe pb-3 flex items-center justify-between gap-2 border-b border-gray-100/80 sticky top-0 z-10">
        <div className="flex items-center gap-1">
          {selectedRegion ? (
            <button
              onClick={handleBack}
              aria-label="뒤로 가기"
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          ) : (
            <Link
              href="/"
              aria-label="뒤로 가기"
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
          )}
          <Link
            href="/"
            aria-label="홈으로"
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
        <h1
          className="text-[17px] sm:text-[19px] font-bold tracking-[-0.02em]"
          style={{ color: "#1F2937" }}
        >
          지사 팩스번호 찾기
        </h1>
        <div className="w-[60px]"></div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-5 pt-5 pb-safe overflow-y-auto">
        {/* 지사 목록 화면 */}
        {!selectedBranch && !selectedRegion && (
          <div className="space-y-4">
            {/* 검색창 */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="지사명, 지역, 주소로 검색"
                className="w-full bg-white rounded-2xl pl-12 pr-4 py-4 text-[16px] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{
                  color: "#1F2937",
                  boxShadow:
                    "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)",
                }}
              />
            </div>

            {/* 검색 중일 때 검색 결과 표시 */}
            {searchQuery ? (
              <>
                <div className="px-1">
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: "#6B7280" }}
                  >
                    검색 결과 · {filteredBranches.length}개
                  </p>
                </div>
                <div className="space-y-2.5">
                  {filteredBranches.length > 0 ? (
                    filteredBranches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranch(branch);
                          recordBranchSearch(branch.name);
                        }}
                        className="group w-full bg-white rounded-[20px] px-5 py-4 active:scale-[0.98] transition-all text-left"
                        style={{
                          boxShadow:
                            "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <h3
                            className="flex-1 text-[17px] sm:text-[18px] font-bold tracking-[-0.02em]"
                            style={{ color: "#1F2937" }}
                          >
                            {branch.name}
                          </h3>
                          <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 group-active:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <p
                        className="text-[15px] font-medium"
                        style={{ color: "#9CA3AF" }}
                      >
                        검색 결과가 없습니다
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* 검색하지 않을 때 지역 그리드 표시 */
              <>
                <div className="px-1">
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: "#6B7280" }}
                  >
                    지역을 선택하세요
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => handleRegionSelect(region)}
                      className="bg-white rounded-[18px] py-5 px-3 active:scale-[0.97] transition-all"
                      style={{
                        boxShadow:
                          "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)",
                      }}
                    >
                      <span
                        className="text-[16px] sm:text-[17px] font-bold tracking-[-0.02em]"
                        style={{ color: "#1F2937" }}
                      >
                        {region}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 지역 선택 후 지사 목록 */}
        {selectedRegion && !selectedBranch && (
          <div className="space-y-4">
            <div className="px-1">
              <p
                className="text-[13px] font-semibold"
                style={{ color: "#6B7280" }}
              >
                {selectedRegion} · {branches.length}개 지사
              </p>
            </div>
            <div className="space-y-2.5">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranch(branch);
                    recordBranchSearch(branch.name);
                  }}
                  className="group w-full bg-white rounded-[20px] px-5 py-4 active:scale-[0.98] transition-all text-left"
                  style={{
                    boxShadow:
                      "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <h3
                      className="flex-1 text-[17px] sm:text-[18px] font-bold tracking-[-0.02em]"
                      style={{ color: "#1F2937" }}
                    >
                      {branch.name}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 group-active:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 지사 상세 정보 모달 */}
        {selectedBranch && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedBranch(null)}
          >
            <div
              className="w-full h-[100dvh] flex flex-col animate-in slide-in-from-bottom duration-300"
              style={{ backgroundColor: "#F4F7FB" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <header
                className="bg-white/90 backdrop-blur-md px-4 sm:px-5 pt-safe pb-3 flex items-center justify-between border-b border-gray-100/80"
              >
                <button
                  onClick={() => setSelectedBranch(null)}
                  aria-label="닫기"
                  className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
                <h2
                  className="text-[17px] font-bold tracking-[-0.02em]"
                  style={{ color: "#1F2937" }}
                >
                  지사 정보
                </h2>
                <div className="w-10"></div>
              </header>

              {/* 모달 컨텐츠 */}
              <main className="flex-1 px-4 sm:px-5 pt-5 pb-safe overflow-y-auto">
                <div className="space-y-4">
                  {/* 메인 정보 카드 */}
                  <div
                    ref={captureRef}
                    className="w-full rounded-[24px] bg-white px-6 py-7 space-y-6"
                    style={{
                      boxShadow:
                        "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)",
                    }}
                  >
                    {/* 지사명 */}
                    <div>
                      <h2
                        className="text-[26px] sm:text-[28px] font-extrabold tracking-[-0.03em] leading-tight"
                        style={{ color: "#1F2937" }}
                      >
                        {selectedBranch.name}
                      </h2>
                      <p
                        className="text-[14px] mt-1 font-medium"
                        style={{ color: "#6B7280" }}
                      >
                        {selectedBranch.department}
                      </p>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t" style={{ borderColor: "#F1F5F9" }} />

                    {/* 팩스번호 */}
                    <div>
                      <p
                        className="text-[12px] font-bold tracking-[0.02em] uppercase mb-2"
                        style={{ color: "#9CA3AF" }}
                      >
                        팩스번호
                      </p>
                      <p
                        className="text-[26px] sm:text-[28px] font-extrabold tracking-[-0.02em] tabular-nums leading-none"
                        style={{ color: "#1F2937" }}
                      >
                        {selectedBranch.fax}
                      </p>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t" style={{ borderColor: "#F1F5F9" }} />

                    {/* 주소 */}
                    <div>
                      <p
                        className="text-[12px] font-bold tracking-[0.02em] uppercase mb-2"
                        style={{ color: "#9CA3AF" }}
                      >
                        주소
                      </p>
                      <p
                        className="text-[15px] sm:text-[16px] leading-relaxed font-semibold"
                        style={{ color: "#1F2937" }}
                      >
                        {selectedBranch.address}
                      </p>
                      {selectedBranch.postalCode && (
                        <p
                          className="text-[13px] mt-1.5 font-medium"
                          style={{ color: "#9CA3AF" }}
                        >
                          우편번호 {selectedBranch.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 도움이 되었어요 버튼 */}
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="w-full px-6 py-3.5 rounded-2xl bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                    style={{
                      boxShadow:
                        "0 2px 8px -2px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(15,23,42,0.06)",
                    }}
                  >
                    <ThumbsUp
                      className="w-[18px] h-[18px]"
                      strokeWidth={2.2}
                      style={{ color: "#6B7280" }}
                    />
                    <span
                      className="text-[15px] font-bold"
                      style={{ color: "#6B7280" }}
                    >
                      도움이 되었어요
                    </span>
                  </button>

                  {/* 액션 버튼들 */}
                  <div className="space-y-2.5">
                    <a
                      href={`https://map.naver.com/v5/search/${encodeURIComponent(selectedBranch.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full rounded-2xl py-4 px-6 text-[16px] font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                        boxShadow:
                          "0 6px 16px -4px rgba(37,99,235,0.4), 0 2px 4px rgba(37,99,235,0.15)",
                      }}
                    >
                      <Navigation className="w-5 h-5" strokeWidth={2.2} />
                      위치 지도로 보기
                    </a>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={handleSave}
                        className="rounded-2xl py-3.5 px-4 text-[15px] font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-white"
                        style={{
                          color: "#1F2937",
                          boxShadow:
                            "0 2px 8px -2px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(15,23,42,0.06)",
                        }}
                      >
                        <Download className="w-[18px] h-[18px]" strokeWidth={2.2} />
                        저장하기
                      </button>
                      <button
                        onClick={handleShare}
                        className="rounded-2xl py-3.5 px-4 text-[15px] font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-white"
                        style={{
                          color: "#1F2937",
                          boxShadow:
                            "0 2px 8px -2px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(15,23,42,0.06)",
                        }}
                      >
                        <Share2 className="w-[18px] h-[18px]" strokeWidth={2.2} />
                        공유하기
                      </button>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        )}

        {/* 피드백 모달 */}
        {showFeedbackModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowFeedbackModal(false)}
          >
            <div
              className="bg-white rounded-3xl p-7 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: "0 20px 60px -10px rgba(15,23,42,0.25)" }}
            >
              <div className="text-center space-y-5">
                <div className="flex justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#D4F5E5" }}
                  >
                    <CheckCircle2
                      className="w-9 h-9"
                      strokeWidth={2}
                      style={{ color: "#10925A" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2
                    className="text-[22px] font-extrabold tracking-[-0.02em]"
                    style={{ color: "#1F2937" }}
                  >
                    감사합니다!
                  </h2>
                  <p
                    className="text-[15px] leading-relaxed font-medium"
                    style={{ color: "#6B7280" }}
                  >
                    소중한 의견 감사드립니다
                  </p>
                </div>

                <div
                  className="border-t my-2"
                  style={{ borderColor: "#F1F5F9" }}
                />

                <div className="space-y-3">
                  <p
                    className="text-[15px] font-bold"
                    style={{ color: "#1F2937" }}
                  >
                    이 안내가 도움이 되셨나요?
                  </p>

                  <div className="flex justify-center gap-3 pt-1">
                    {[
                      { emoji: "😊", label: "좋아요", value: "good" as const },
                      { emoji: "😐", label: "보통", value: "neutral" as const },
                      { emoji: "😢", label: "아쉬워요", value: "bad" as const },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          recordSatisfaction(opt.value as SatisfactionType).then(() =>
                            setShowFeedbackModal(false)
                          );
                        }}
                        className="flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all border border-gray-100"
                      >
                        <span className="text-[36px] leading-none">
                          {opt.emoji}
                        </span>
                        <span
                          className="text-[12px] font-semibold"
                          style={{ color: "#6B7280" }}
                        >
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
