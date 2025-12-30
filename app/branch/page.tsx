"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useRef } from "react";
import { regions, getBranchesByRegion, Branch } from "@/lib/branches";
import html2canvas from "html2canvas";

export default function BranchPage() {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Header */}
      <header className="px-6 pt-4 pb-2 flex items-center justify-between">
        {selectedRegion ? (
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        ) : (
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        )}
        <Image
          src="/logo.svg"
          alt="국민건강보험공단"
          width={128}
          height={40}
          className="object-contain"
        />
      </header>

      {/* Content */}
      <main className="flex-1 px-5 pt-4 pb-4 overflow-y-auto">
        {/* 지사 목록 화면 */}
        {!selectedBranch && !selectedRegion && (
          <div className="space-y-4">
            {/* 검색창 */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="지사명, 지역, 주소로 검색"
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-5 pr-14 text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <svg
                className="w-6 h-6 text-gray-400 absolute right-5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* 검색 중일 때 검색 결과 표시 */}
            {searchQuery ? (
              <>
                <div className="px-2">
                  <p className="text-sm text-gray-600">
                    검색 결과: {filteredBranches.length}개
                  </p>
                </div>
                <div className="space-y-3">
                  {filteredBranches.length > 0 ? (
                    filteredBranches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => setSelectedBranch(branch)}
                        className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-emerald-200 active:scale-[0.98] transition-all text-left"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {branch.name}
                            </h3>
                          </div>
                          <svg
                            className="w-6 h-6 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">검색 결과가 없습니다</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* 검색하지 않을 때 지역 그리드 표시 */
              <>
                <div className="px-2">
                  <p className="text-sm text-gray-600">지역을 선택하세요</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => handleRegionSelect(region)}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-emerald-200 active:scale-[0.97] transition-all"
                    >
                      <span className="text-xl font-semibold text-gray-900">
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
            <div className="px-2">
              <p className="text-sm text-gray-600">
                {selectedRegion} · {branches.length}개 지사
              </p>
            </div>
            <div className="space-y-3">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-emerald-200 active:scale-[0.98] transition-all text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {branch.name}
                    </h3>
                    <svg
                      className="w-6 h-6 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 지사 상세 정보 모달 */}
        {selectedBranch && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
            <div className="w-full h-full bg-[#f9fafb] flex flex-col animate-in slide-in-from-bottom duration-300">
              {/* 모달 헤더 */}
              <header className="px-6 pt-4 pb-2 flex items-center justify-between">
                <button
                  onClick={() => setSelectedBranch(null)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <Image
                  src="/logo.svg"
                  alt="국민건강보험공단"
                  width={128}
                  height={40}
                  className="object-contain"
                />
              </header>

              {/* 모달 컨텐츠 */}
              <main className="flex-1 px-5 pt-4 pb-6 flex flex-col justify-center">
                <div className="space-y-4">
                  <div ref={captureRef} className="w-full rounded-3xl shadow-lg p-6 space-y-6" style={{ backgroundColor: '#ffffff' }}>
                    {/* 지사명 */}
                    <div className="text-center pb-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <h2 className="text-4xl font-bold mb-2" style={{ color: '#111827' }}>
                        {selectedBranch.name}
                      </h2>
                      <p className="text-xl" style={{ color: '#6b7280' }}>
                        {selectedBranch.department}
                      </p>
                    </div>

                    {/* 팩스번호 */}
                    <div className="flex items-baseline gap-4">
                      <p className="text-lg font-semibold whitespace-nowrap" style={{ color: '#374151' }}>팩스번호</p>
                      <p className="text-3xl font-bold" style={{ color: '#111827' }}>
                        {selectedBranch.fax}
                      </p>
                    </div>

                    {/* 전화번호 */}
                    <div className="flex items-baseline gap-4">
                      <p className="text-lg font-semibold whitespace-nowrap" style={{ color: '#374151' }}>전화번호</p>
                      <p className="text-3xl font-bold" style={{ color: '#111827' }}>
                        {selectedBranch.phone}
                      </p>
                    </div>

                    {/* 주소 */}
                    <div className="space-y-2">
                      <p className="text-lg font-semibold" style={{ color: '#374151' }}>주소</p>
                      <p className="text-lg leading-relaxed" style={{ color: '#111827' }}>
                        {selectedBranch.address}
                      </p>
                      {selectedBranch.postalCode && (
                        <p className="text-base" style={{ color: '#6b7280' }}>
                          우편번호: {selectedBranch.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 버튼들 */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 text-lg font-bold hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      저장하기
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl py-4 px-6 text-lg font-bold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      공유하기
                    </button>
                  </div>
                </div>
              </main>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
