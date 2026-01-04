"use client";

import Link from "next/link";
import { ArrowLeft, Search, Plus, Check, X } from "lucide-react";
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

// 서류 목록 (누구 기준 필요한 서류 표시)
const documentList = [
  { id: "application", name: "환급금 지급신청서", emoji: "📄", note: null, needsName: false },
  { id: "family", name: "가족관계증명서(상세)", emoji: "👨‍👩‍👧", note: "최근 3개월 이내 발급 분", needsName: true },
  { id: "basic", name: "기본증명서(상세)", emoji: "📋", note: "최근 3개월 이내 발급 분", needsName: true },
  { id: "removal", name: "제적등본", emoji: "📋", note: null, needsName: false },
  { id: "inheritance", name: "상속대표선정동의서", emoji: "📝", note: "상속인 전원 서명 필요", needsName: false },
  { id: "delegation", name: "위임장", emoji: "✍️", note: null, needsName: false },
  { id: "id", name: "신분증 사본", emoji: "🪪", note: null, needsName: true },
  { id: "medical", name: "진단서(소견서)", emoji: "🏥", note: null, needsName: false },
  { id: "guardian", name: "후견등기사항증명서", emoji: "⚖️", note: null, needsName: false },
  { id: "etc", name: "기타", emoji: "✏️", note: null, needsName: false, isCustom: true },
];

type SelectedDoc = {
  id: string;
  personName?: string;
  customText?: string;
};

export default function QuickPassPage() {
  const [selectedDocs, setSelectedDocs] = useState<SelectedDoc[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<{ name: string; fax: string } | null>(null);
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

  const isDocSelected = (docId: string) => selectedDocs.some((d) => d.id === docId);

  const toggleDocument = (docId: string) => {
    const doc = documentList.find((d) => d.id === docId) as typeof documentList[0] & { isCustom?: boolean };
    if (!doc) return;

    // 기타는 항상 새로 추가 가능 (중복 허용)
    if (doc.isCustom) {
      setTempCustomText("");
      setShowCustomModal(true);
      return;
    }

    if (isDocSelected(docId)) {
      // 이미 선택된 경우 제거
      setSelectedDocs((prev) => prev.filter((d) => d.id !== docId));
    } else {
      // 새로 추가
      if (doc.needsName) {
        // 이름 입력 필요한 서류
        setPendingDocId(docId);
        setTempName("");
        setShowNameModal(true);
      } else {
        // 바로 추가
        setSelectedDocs((prev) => [...prev, { id: docId }]);
      }
    }
  };

  const handleCustomConfirm = () => {
    if (tempCustomText.trim()) {
      setSelectedDocs((prev) => [...prev, { id: `etc-${Date.now()}`, customText: tempCustomText.trim() }]);
    }
    setShowCustomModal(false);
    setTempCustomText("");
  };

  const handleNameConfirm = () => {
    if (pendingDocId && tempName.trim()) {
      setSelectedDocs((prev) => [...prev, { id: pendingDocId, personName: tempName.trim() }]);
    }
    setShowNameModal(false);
    setPendingDocId(null);
    setTempName("");
  };

  const removeSelectedDoc = (docId: string) => {
    setSelectedDocs((prev) => prev.filter((d) => d.id !== docId));
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
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <header className="bg-white px-5 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={() => setShowResult(false)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">결과 확인</h1>
        </header>

        {/* Result Content */}
        <main className="flex-1 px-5 py-6">
          <div ref={captureRef} style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px" }}>
            {/* 준비 서류 */}
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#000000", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                📋 준비 서류
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedDocs.map((selectedDoc, index) => {
                  const doc = getDocInfo(selectedDoc.id);
                  const isCustomDoc = selectedDoc.customText;
                  return (
                    <div key={`${selectedDoc.id}-${index}`} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "bold", color: "#000000", minWidth: "24px" }}>{index + 1}.</span>
                      <div>
                        <span style={{ fontSize: "18px", color: "#000000" }}>
                          {isCustomDoc ? (
                            selectedDoc.customText
                          ) : (
                            <>
                              {selectedDoc.personName ? `${selectedDoc.personName}님 기준 ` : ""}
                              {doc?.name}
                            </>
                          )}
                        </span>
                        {doc?.note && !isCustomDoc && (
                          <div style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>- {doc.note}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 지사 팩스번호 */}
            {selectedBranch && (
              <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#000000", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  📍 지사 팩스번호
                </h2>
                <div style={{ fontSize: "18px", color: "#000000", fontWeight: "600" }}>{selectedBranch.name}</div>
                <div style={{ fontSize: "20px", color: "#2563EB", fontWeight: "bold", marginTop: "4px" }}>{selectedBranch.fax}</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleSave}
              className="bg-red-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
            >
              저장하기
            </button>
            <button
              onClick={handleShare}
              className="bg-red-600 text-white rounded-[16px] py-5 px-4 text-xl font-semibold hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
            >
              공유하기
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 메인 화면
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white px-5 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-10">
        <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">📝 서류 빠른 안내 (직원용)</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6 pb-32">
        {/* 선택된 서류 표시 */}
        {selectedDocs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">선택한 서류</h2>
            <div className="bg-white rounded-xl p-4 space-y-2">
              {selectedDocs.map((selectedDoc, index) => {
                const doc = getDocInfo(selectedDoc.id);
                const isCustomDoc = selectedDoc.customText;
                return (
                  <div
                    key={`${selectedDoc.id}-${index}`}
                    className="flex items-center justify-between bg-blue-50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span>{isCustomDoc ? "✏️" : doc?.emoji}</span>
                      <span className="text-blue-900 font-medium">
                        {isCustomDoc ? (
                          selectedDoc.customText
                        ) : (
                          <>
                            {selectedDoc.personName ? `${selectedDoc.personName}님 기준 ` : ""}
                            {doc?.name}
                          </>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSelectedDoc(selectedDoc.id)}
                      className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 서류 선택 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">자주 쓰는 서류</h2>
          <div className="space-y-2">
            {documentList.map((doc) => {
              const isSelected = isDocSelected(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleDocument(doc.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    isSelected
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "bg-white border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{doc.emoji}</span>
                    <span className={`text-lg ${isSelected ? "font-semibold text-blue-700" : "text-gray-900"}`}>
                      {doc.name}
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-blue-500" : "bg-gray-100"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 지사 찾기 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">📍 지사 찾기</h2>
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="지사명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {searchTerm && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-48 overflow-y-auto">
              {filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => (
                  <button
                    key={branch.name}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setSearchTerm("");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{branch.name}</div>
                    <div className="text-sm text-gray-500">{branch.fax}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500">검색 결과가 없습니다</div>
              )}
            </div>
          )}

          {selectedBranch && (
            <div className="mt-3 bg-blue-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-900">{selectedBranch.name}</div>
                <div className="text-blue-700">{selectedBranch.fax}</div>
              </div>
              <button
                onClick={() => setSelectedBranch(null)}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-blue-600" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 결과 확인 버튼 (고정) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleShowResult}
          disabled={selectedDocs.length === 0}
          className={`w-full py-5 rounded-2xl text-xl font-bold transition-all ${
            selectedDocs.length > 0
              ? "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          결과 확인 ({selectedDocs.length}개 선택)
        </button>
      </div>

      {/* 이름 입력 모달 */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">누구 기준인가요?</h3>
            <input
              type="text"
              placeholder="예: 홍길동"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              autoFocus
              className="w-full bg-gray-50 rounded-xl px-4 py-4 text-lg text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowNameModal(false);
                  setPendingDocId(null);
                  setTempName("");
                }}
                className="py-4 rounded-xl text-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleNameConfirm}
                disabled={!tempName.trim()}
                className={`py-4 rounded-xl text-lg font-semibold transition-all ${
                  tempName.trim()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기타 입력 모달 */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">기타 서류 입력</h3>
            <input
              type="text"
              placeholder="예: 통장사본"
              value={tempCustomText}
              onChange={(e) => setTempCustomText(e.target.value)}
              autoFocus
              className="w-full bg-gray-50 rounded-xl px-4 py-4 text-lg text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setTempCustomText("");
                }}
                className="py-4 rounded-xl text-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleCustomConfirm}
                disabled={!tempCustomText.trim()}
                className={`py-4 rounded-xl text-lg font-semibold transition-all ${
                  tempCustomText.trim()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
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
