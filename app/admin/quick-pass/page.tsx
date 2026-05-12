"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Plus,
  Check,
  X,
  FileText,
  Users,
  ClipboardCheck,
  ScrollText,
  FilePen,
  IdCard,
  Stethoscope,
  Scale,
  Edit3,
  Download,
  Share2,
  MapPin,
  Printer,
  type LucideIcon,
} from "lucide-react";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";

// 지사 데이터
const branches = [
  { name: "수원동부지사", fax: "031-229-0495" },
  { name: "수원서부지사", fax: "031-229-0496" },
  { name: "성남지사", fax: "031-729-8495" },
  { name: "용인지사", fax: "031-339-2495" },
  { name: "안양지사", fax: "031-389-6495" },
  { name: "부천지사", fax: "032-680-4495" },
  { name: "광명지사", fax: "02-2680-4495" },
  { name: "안산지사", fax: "031-481-7495" },
  { name: "고양지사", fax: "031-900-7495" },
  { name: "의정부지사", fax: "031-870-7495" },
  { name: "서울강남지사", fax: "02-3453-7495" },
  { name: "서울강서지사", fax: "02-2699-7495" },
  { name: "서울종로지사", fax: "02-2076-7495" },
];

// 서류 목록 (Lucide 아이콘 + 파스텔 컬러)
type DocItem = {
  id: string;
  name: string;
  Icon: LucideIcon;
  iconBg: string;
  iconBgInner: string;
  iconColor: string;
  note: string | null;
  needsName: boolean;
  isCustom?: boolean;
};

const documentList: DocItem[] = [
  {
    id: "application",
    name: "환급금 지급신청서",
    Icon: FileText,
    iconBg: "#E0EAFF",
    iconBgInner: "#EEF2FF",
    iconColor: "#3B5BDB",
    note: null,
    needsName: false,
  },
  {
    id: "family",
    name: "가족관계증명서(상세)",
    Icon: Users,
    iconBg: "#F0E7FF",
    iconBgInner: "#F5EFFF",
    iconColor: "#6F42C1",
    note: "최근 3개월 이내 발급 분",
    needsName: true,
  },
  {
    id: "basic",
    name: "기본증명서(상세)",
    Icon: ClipboardCheck,
    iconBg: "#D4F5E5",
    iconBgInner: "#E3F8EE",
    iconColor: "#10925A",
    note: "최근 3개월 이내 발급 분",
    needsName: true,
  },
  {
    id: "removal",
    name: "제적등본",
    Icon: ScrollText,
    iconBg: "#FFE8D6",
    iconBgInner: "#FFF1E5",
    iconColor: "#C2410C",
    note: null,
    needsName: false,
  },
  {
    id: "inheritance",
    name: "상속대표선정동의서",
    Icon: FilePen,
    iconBg: "#FFE1E6",
    iconBgInner: "#FFEDF0",
    iconColor: "#BE185D",
    note: "상속인 전원 서명 필요",
    needsName: false,
  },
  {
    id: "delegation",
    name: "위임장",
    Icon: FilePen,
    iconBg: "#E0EAFF",
    iconBgInner: "#EEF2FF",
    iconColor: "#3B5BDB",
    note: null,
    needsName: false,
  },
  {
    id: "id",
    name: "신분증 사본",
    Icon: IdCard,
    iconBg: "#FEF3C7",
    iconBgInner: "#FFFBEB",
    iconColor: "#B45309",
    note: null,
    needsName: true,
  },
  {
    id: "medical",
    name: "진단서(소견서)",
    Icon: Stethoscope,
    iconBg: "#D4F5E5",
    iconBgInner: "#E3F8EE",
    iconColor: "#10925A",
    note: null,
    needsName: false,
  },
  {
    id: "guardian",
    name: "후견등기사항증명서",
    Icon: Scale,
    iconBg: "#F0E7FF",
    iconBgInner: "#F5EFFF",
    iconColor: "#6F42C1",
    note: null,
    needsName: false,
  },
  {
    id: "etc",
    name: "기타",
    Icon: Edit3,
    iconBg: "#F1F5F9",
    iconBgInner: "#F8FAFC",
    iconColor: "#475569",
    note: null,
    needsName: false,
    isCustom: true,
  },
];

const cardShadow =
  "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)";

type SelectedDoc = {
  id: string;
  personName?: string;
  customText?: string;
};

export default function QuickPassPage() {
  const [selectedDocs, setSelectedDocs] = useState<SelectedDoc[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<{
    name: string;
    fax: string;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempCustomText, setTempCustomText] = useState("");
  const captureRef = useRef<HTMLDivElement>(null);

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isDocSelected = (docId: string) =>
    selectedDocs.some((d) => d.id === docId);

  const toggleDocument = (docId: string) => {
    const doc = documentList.find((d) => d.id === docId);
    if (!doc) return;

    if (doc.isCustom) {
      setTempCustomText("");
      setShowCustomModal(true);
      return;
    }

    if (doc.needsName) {
      setPendingDocId(docId);
      setTempName("");
      setShowNameModal(true);
      return;
    }

    if (isDocSelected(docId)) {
      setSelectedDocs((prev) => prev.filter((d) => d.id !== docId));
    } else {
      setSelectedDocs((prev) => [...prev, { id: docId }]);
    }
  };

  const handleCustomConfirm = () => {
    if (tempCustomText.trim()) {
      setSelectedDocs((prev) => [
        ...prev,
        { id: `etc-${Date.now()}`, customText: tempCustomText.trim() },
      ]);
    }
    setShowCustomModal(false);
    setTempCustomText("");
  };

  const handleNameConfirm = () => {
    if (pendingDocId && tempName.trim()) {
      setSelectedDocs((prev) => [
        ...prev,
        { id: pendingDocId, personName: tempName.trim() },
      ]);
    }
    setShowNameModal(false);
    setPendingDocId(null);
    setTempName("");
  };

  const removeSelectedDoc = (index: number) => {
    setSelectedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleShowResult = () => {
    if (selectedDocs.length > 0) {
      setShowResult(true);
    }
  };

  const handleSave = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = "서류안내.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

  const handleShare = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], "서류안내.png", { type: "image/png" });
          await navigator.share({ files: [file] });
        }
      });
    } catch (error) {
      console.error("공유 실패:", error);
    }
  };

  const getDocInfo = (docId: string) => documentList.find((d) => d.id === docId);

  // 결과 화면
  if (showResult) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col"
        style={{ backgroundColor: "#F4F7FB" }}
      >
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md px-4 sm:px-5 pt-safe pb-3 flex items-center gap-3 border-b border-gray-100/80 sticky top-0 z-10">
          <button
            onClick={() => setShowResult(false)}
            aria-label="뒤로 가기"
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1
            className="text-[17px] sm:text-[19px] font-bold tracking-[-0.02em]"
            style={{ color: "#1F2937" }}
          >
            결과 확인
          </h1>
        </header>

        {/* Result Content */}
        <main className="flex-1 px-4 sm:px-5 pt-5 pb-safe">
          <div
            ref={captureRef}
            style={{
              backgroundColor: "#ffffff",
              padding: "28px 24px",
              borderRadius: "16px",
              boxShadow:
                "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)",
            }}
          >
            {/* 준비 서류 섹션 */}
            <div style={{ marginBottom: selectedBranch ? "24px" : "0" }}>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: "800",
                  color: "#3B82F6",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                준비 서류
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {selectedDocs.map((selectedDoc, index) => {
                  const doc = getDocInfo(selectedDoc.id);
                  const isCustomDoc = selectedDoc.customText;
                  return (
                    <div
                      key={`${selectedDoc.id}-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#3B82F6",
                          minWidth: "20px",
                          lineHeight: "1.5",
                        }}
                      >
                        {index + 1}.
                      </span>
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: "16px",
                            color: "#374151",
                            fontWeight: "500",
                            lineHeight: "1.5",
                          }}
                        >
                          {isCustomDoc ? (
                            selectedDoc.customText
                          ) : (
                            <>
                              {selectedDoc.personName
                                ? `${selectedDoc.personName}님 기준 `
                                : ""}
                              {doc?.name}
                            </>
                          )}
                        </span>
                        {doc?.note && !isCustomDoc && (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#6B7280",
                              marginTop: "4px",
                              fontWeight: "500",
                            }}
                          >
                            - {doc.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 지사 팩스번호 섹션 */}
            {selectedBranch && (
              <>
                <div
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    marginTop: "24px",
                    marginBottom: "24px",
                  }}
                />
                <h2
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#3B82F6",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  지사 팩스번호
                </h2>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#374151",
                    fontWeight: "600",
                  }}
                >
                  {selectedBranch.name}
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    color: "#2563EB",
                    fontWeight: "800",
                    marginTop: "4px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {selectedBranch.fax}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <button
              onClick={handleSave}
              className="rounded-xl py-3 px-4 text-[15px] font-bold text-gray-800 bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              style={{
                boxShadow:
                  "0 2px 8px -2px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(15,23,42,0.06)",
              }}
            >
              <Download className="w-[18px] h-[18px]" strokeWidth={2.2} />
              저장하기
            </button>
            <button
              onClick={handleShare}
              className="rounded-xl py-3 px-4 text-[15px] font-bold text-gray-800 bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              style={{
                boxShadow:
                  "0 2px 8px -2px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(15,23,42,0.06)",
              }}
            >
              <Share2 className="w-[18px] h-[18px]" strokeWidth={2.2} />
              공유하기
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 메인 화면
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
          서류 빠른 안내
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-5 pt-5 pb-[120px] space-y-5">
        {/* 선택한 서류 — 가로 스크롤 칩 (sticky) */}
        {selectedDocs.length > 0 && (
          <div
            className="sticky -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 z-10 -mt-5"
            style={{
              top: "calc(env(safe-area-inset-top, 0px) + 56px)",
              backgroundColor: "rgba(244,247,251,0.92)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <h2
                  className="text-[12px] font-bold tracking-[0.08em] uppercase"
                  style={{ color: "#3B82F6" }}
                >
                  선택한 서류
                </h2>
                <span
                  className="text-[11px] font-extrabold tabular-nums px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "#3B82F6",
                    color: "#FFFFFF",
                  }}
                >
                  {selectedDocs.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedDocs([])}
                className="text-[12px] font-bold active:scale-95 transition-all"
                style={{ color: "#6B7280" }}
              >
                전체 삭제
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
              {selectedDocs.map((selectedDoc, index) => {
                const doc = getDocInfo(selectedDoc.id);
                const isCustomDoc = selectedDoc.customText;
                return (
                  <div
                    key={`${selectedDoc.id}-${index}`}
                    className="flex items-center gap-1.5 rounded-full pl-2 pr-1 py-1 flex-shrink-0 bg-white border"
                    style={{
                      borderColor: "#BFDBFE",
                      boxShadow:
                        "0 2px 6px -2px rgba(37,99,235,0.15)",
                    }}
                  >
                    {!isCustomDoc && doc && (
                      <doc.Icon
                        className="w-3.5 h-3.5"
                        strokeWidth={2.5}
                        style={{ color: doc.iconColor }}
                      />
                    )}
                    {isCustomDoc && (
                      <Edit3
                        className="w-3.5 h-3.5"
                        strokeWidth={2.5}
                        style={{ color: "#475569" }}
                      />
                    )}
                    <span
                      className="text-[12px] font-bold whitespace-nowrap"
                      style={{ color: "#1F2937" }}
                    >
                      {isCustomDoc ? (
                        selectedDoc.customText
                      ) : (
                        <>
                          {selectedDoc.personName
                            ? `${selectedDoc.personName} `
                            : ""}
                          {doc?.name}
                        </>
                      )}
                    </span>
                    <button
                      onClick={() => removeSelectedDoc(index)}
                      aria-label="제거"
                      className="w-5 h-5 rounded-full flex items-center justify-center active:scale-90 transition-all"
                      style={{ backgroundColor: "#EFF6FF" }}
                    >
                      <X className="w-3 h-3" style={{ color: "#3B82F6" }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 자주 쓰는 서류 */}
        <div>
          <h2
            className="text-[12px] font-bold tracking-[0.08em] uppercase mb-2.5 px-1"
            style={{ color: "#9CA3AF" }}
          >
            자주 쓰는 서류
          </h2>
          <div className="space-y-2">
            {documentList.map((doc) => {
              const isSelected = isDocSelected(doc.id);
              const showAsSelected = isSelected && !doc.needsName;
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleDocument(doc.id)}
                  className={`w-full flex items-center justify-between rounded-[18px] px-4 py-3.5 transition-all active:scale-[0.98] ${
                    showAsSelected ? "bg-blue-50/60" : "bg-white"
                  }`}
                  style={{
                    boxShadow: showAsSelected
                      ? "0 0 0 1.5px #3B82F6"
                      : cardShadow,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${doc.iconBgInner} 0%, ${doc.iconBg} 100%)`,
                      }}
                    >
                      <doc.Icon
                        className="w-[22px] h-[22px]"
                        strokeWidth={2}
                        style={{ color: doc.iconColor }}
                      />
                    </div>
                    <span
                      className="text-[15px] sm:text-[16px] font-bold tracking-[-0.01em]"
                      style={{ color: showAsSelected ? "#1E40AF" : "#1F2937" }}
                    >
                      {doc.name}
                    </span>
                  </div>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: showAsSelected ? "#3B82F6" : "#F1F5F9",
                    }}
                  >
                    {showAsSelected ? (
                      <Check
                        className="w-[14px] h-[14px] text-white"
                        strokeWidth={3}
                      />
                    ) : (
                      <Plus
                        className="w-[14px] h-[14px]"
                        strokeWidth={2.5}
                        style={{ color: "#9CA3AF" }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 지사 찾기 */}
        <div>
          <h2
            className="text-[12px] font-bold tracking-[0.08em] uppercase mb-2.5 px-1"
            style={{ color: "#9CA3AF" }}
          >
            지사 찾기
          </h2>
          <div className="relative mb-2.5">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
              style={{ color: "#9CA3AF" }}
            />
            <input
              type="text"
              placeholder="지사명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white rounded-[18px] pl-12 pr-4 py-3.5 text-[15px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{
                color: "#1F2937",
                boxShadow: cardShadow,
              }}
            />
          </div>

          {searchTerm && (
            <div
              className="bg-white rounded-[18px] overflow-hidden max-h-56 overflow-y-auto"
              style={{ boxShadow: cardShadow }}
            >
              {filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => (
                  <button
                    key={branch.name}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setSearchTerm("");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 active:scale-[0.99] transition-all"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    <div
                      className="text-[14px] font-bold"
                      style={{ color: "#1F2937" }}
                    >
                      {branch.name}
                    </div>
                    <div
                      className="text-[12px] font-medium tabular-nums mt-0.5"
                      style={{ color: "#6B7280" }}
                    >
                      {branch.fax}
                    </div>
                  </button>
                ))
              ) : (
                <div
                  className="px-4 py-6 text-center text-[13px] font-medium"
                  style={{ color: "#9CA3AF" }}
                >
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}

          {selectedBranch && (
            <div
              className="rounded-[18px] px-4 py-3.5 flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, #EEF2FF 0%, #E0EAFF 100%)",
                boxShadow:
                  "0 0 0 1px rgba(59,130,246,0.15)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/80"
                >
                  <MapPin
                    className="w-5 h-5"
                    strokeWidth={2}
                    style={{ color: "#3B5BDB" }}
                  />
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[14px] font-bold truncate"
                    style={{ color: "#1F2937" }}
                  >
                    {selectedBranch.name}
                  </div>
                  <div
                    className="text-[12px] font-bold tabular-nums mt-0.5"
                    style={{ color: "#2563EB" }}
                  >
                    {selectedBranch.fax}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBranch(null)}
                aria-label="제거"
                className="p-1.5 -mr-1 rounded-lg hover:bg-white/60 transition-colors active:scale-90 flex-shrink-0"
              >
                <X className="w-4 h-4" style={{ color: "#3B5BDB" }} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 결과 확인 버튼 (고정) */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100/80 p-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        <button
          onClick={handleShowResult}
          disabled={selectedDocs.length === 0}
          className={`w-full rounded-xl py-3.5 px-5 text-[16px] font-bold transition-all flex items-center justify-center gap-2 ${
            selectedDocs.length > 0
              ? "text-white active:scale-[0.98]"
              : "cursor-not-allowed"
          }`}
          style={
            selectedDocs.length > 0
              ? {
                  background:
                    "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                  boxShadow:
                    "0 6px 16px -4px rgba(37,99,235,0.4), 0 2px 4px rgba(37,99,235,0.15)",
                }
              : { backgroundColor: "#E5E7EB", color: "#9CA3AF" }
          }
        >
          결과 확인
          <span className="tabular-nums">({selectedDocs.length}개)</span>
        </button>
      </div>

      {/* 이름 입력 모달 */}
      {showNameModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowNameModal(false);
            setPendingDocId(null);
            setTempName("");
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: "0 20px 60px -10px rgba(15,23,42,0.25)" }}
          >
            <h3
              className="text-[19px] font-extrabold tracking-[-0.02em] mb-1.5"
              style={{ color: "#1F2937" }}
            >
              누구 기준인가요?
            </h3>
            <p
              className="text-[13px] font-medium mb-4"
              style={{ color: "#6B7280" }}
            >
              서류에 들어갈 성함을 입력해주세요
            </p>
            <input
              type="text"
              placeholder="예: 홍길동"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tempName.trim()) handleNameConfirm();
              }}
              autoFocus
              className="w-full bg-gray-50 rounded-xl px-4 py-3.5 text-[16px] font-semibold placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white mb-4"
              style={{ color: "#1F2937" }}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setShowNameModal(false);
                  setPendingDocId(null);
                  setTempName("");
                }}
                className="py-3 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98]"
                style={{ backgroundColor: "#F1F5F9", color: "#6B7280" }}
              >
                취소
              </button>
              <button
                onClick={handleNameConfirm}
                disabled={!tempName.trim()}
                className="py-3 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98]"
                style={
                  tempName.trim()
                    ? {
                        background:
                          "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                        color: "#FFFFFF",
                        boxShadow:
                          "0 4px 12px -3px rgba(37,99,235,0.35)",
                      }
                    : { backgroundColor: "#E5E7EB", color: "#9CA3AF" }
                }
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기타 입력 모달 */}
      {showCustomModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowCustomModal(false);
            setTempCustomText("");
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: "0 20px 60px -10px rgba(15,23,42,0.25)" }}
          >
            <h3
              className="text-[19px] font-extrabold tracking-[-0.02em] mb-1.5"
              style={{ color: "#1F2937" }}
            >
              기타 서류 입력
            </h3>
            <p
              className="text-[13px] font-medium mb-4"
              style={{ color: "#6B7280" }}
            >
              안내할 서류명을 직접 입력하세요
            </p>
            <input
              type="text"
              placeholder="예: 통장사본"
              value={tempCustomText}
              onChange={(e) => setTempCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tempCustomText.trim())
                  handleCustomConfirm();
              }}
              autoFocus
              className="w-full bg-gray-50 rounded-xl px-4 py-3.5 text-[16px] font-semibold placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white mb-4"
              style={{ color: "#1F2937" }}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setTempCustomText("");
                }}
                className="py-3 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98]"
                style={{ backgroundColor: "#F1F5F9", color: "#6B7280" }}
              >
                취소
              </button>
              <button
                onClick={handleCustomConfirm}
                disabled={!tempCustomText.trim()}
                className="py-3 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98]"
                style={
                  tempCustomText.trim()
                    ? {
                        background:
                          "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                        color: "#FFFFFF",
                        boxShadow:
                          "0 4px 12px -3px rgba(37,99,235,0.35)",
                      }
                    : { backgroundColor: "#E5E7EB", color: "#9CA3AF" }
                }
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
