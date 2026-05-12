"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronRight,
  X,
  ThumbsUp,
  CheckCircle2,
  CircleDollarSign,
  Calculator,
  ShieldCheck,
  FileText,
  CalendarDays,
  LucideIcon,
} from "lucide-react";
import { recordSatisfaction, countMenuVisit } from "@/lib/statistics";

interface FAQ {
  id: number;
  iconBg: string;
  iconBgInner: string;
  iconColor: string;
  Icon: LucideIcon;
  question: string;
  answer: string;
  note: string;
}

export default function FAQ() {
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

  useEffect(() => {
    countMenuVisit();
  }, []);
  const [likedFaqs, setLikedFaqs] = useState<Set<number>>(new Set());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const faqs: FAQ[] = [
    {
      id: 1,
      iconBg: "#E0EAFF",
      iconBgInner: "#EEF2FF",
      iconColor: "#3B5BDB",
      Icon: CircleDollarSign,
      question: "신청했는데 환급금은 언제 들어오나요?",
      answer: "서류 접수 후 영업일 기준 7일 이내에 입금해 드려요.",
      note: "다만, 민원 집중기(매년 8~10월)는 접수 건수가 갑자기 몰리는 시기에는 조금 더 시간이 걸릴 수 있으니 너그러운 마음으로 기다려 주세요!",
    },
    {
      id: 2,
      iconBg: "#FFE8D6",
      iconBgInner: "#FFF1E5",
      iconColor: "#C2410C",
      Icon: Calculator,
      question: "예상보다 환급 금액이 적은 것 같아요.",
      answer:
        "본인부담상한제는 '건강보험이 적용되는 필수 진료비'만 계산에 포함하기 때문이에요.",
      note: "비급여(도수치료 등), 선별급여, 임플란트, 상급병실료, 추나요법, 정부·지자체 의료비 지원금 등은 법적으로 제외됩니다.",
    },
    {
      id: 3,
      iconBg: "#F0E7FF",
      iconBgInner: "#F5EFFF",
      iconColor: "#6F42C1",
      Icon: ShieldCheck,
      question: "실손보험사에서 공단 환급금을 알아보라고 하는데 왜 그런가요?",
      answer:
        "최근 대법원 판결에 따라, 상한제 환급금은 실손보험 보상 대상에서 제외될 수 있기 때문이에요.",
      note: "올해 진료비 정산은 내년 9월에 이루어지므로, 지금 당장은 조회가 어려울 수 있다는 점을 보험사에 설명해 주세요.",
    },
    {
      id: 4,
      iconBg: "#D4F5E5",
      iconBgInner: "#E3F8EE",
      iconColor: "#10925A",
      Icon: FileText,
      question: "실손보험사 제출용 증빙서류를 공단에서 뗄 수 있나요?",
      answer:
        "아쉽게도 실손보험 제출 전용 공적 서류는 공단에서 별도로 발급하지 않아요.",
      note: "THE건강보험 앱 > 민원여기요 > 조회 > 환급금 조회/신청 > 상한제 사후환급금 조회 또는 국민건강보험공단 홈페이지 > 자주 찾는 서비스 > 환급금 조회/신청 메뉴에서 직접 내역을 캡처해 주세요.",
    },
    {
      id: 5,
      iconBg: "#FFE1E6",
      iconBgInner: "#FFEDF0",
      iconColor: "#BE185D",
      Icon: CalendarDays,
      question: "내년에 받을 환급금을 미리 알 수 있을까요?",
      answer: "죄송하지만 미리 계산이 불가합니다.",
      note: "개인별 상한액 기준보험료 및 상한액을 매년 8월 경 결정하므로 미리 계산할 수 없습니다.",
    },
  ];

  const toggleLike = (id: number) => {
    const newLiked = new Set(likedFaqs);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
      setShowFeedbackModal(true);
    }
    setLikedFaqs(newLiked);
  };

  const cardShadow =
    "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)";

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ backgroundColor: "#F4F7FB" }}
    >
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-4 sm:px-5 pt-safe pb-3 flex items-center justify-between border-b border-gray-100/80 sticky top-0 z-10">
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
          자주하는 질문
        </h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-5 pb-safe pt-5 overflow-y-auto">
        <div className="space-y-3">
          {faqs.map((faq) => (
            <button
              key={faq.id}
              onClick={() => setSelectedFaq(faq)}
              className="group w-full bg-white rounded-[20px] p-5 active:scale-[0.98] transition-all"
              style={{ boxShadow: cardShadow }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${faq.iconBgInner} 0%, ${faq.iconBg} 100%)`,
                  }}
                >
                  <faq.Icon
                    className="w-7 h-7"
                    strokeWidth={2}
                    style={{ color: faq.iconColor }}
                  />
                </div>
                <span
                  className="flex-1 text-left text-[16px] sm:text-[17px] font-bold tracking-[-0.02em] leading-snug"
                  style={{ color: "#1F2937" }}
                >
                  {faq.question}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 group-active:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* 바텀시트 모달 */}
      {selectedFaq && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedFaq(null)}
        >
          <div
            className="w-full h-[82dvh] bg-white rounded-t-[28px] flex flex-col animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* 그랩 핸들 */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-gray-200" />
            </div>

            {/* 모달 헤더 */}
            <div className="flex items-start justify-between px-5 pt-3 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${selectedFaq.iconBgInner} 0%, ${selectedFaq.iconBg} 100%)`,
                  }}
                >
                  <selectedFaq.Icon
                    className="w-6 h-6"
                    strokeWidth={2}
                    style={{ color: selectedFaq.iconColor }}
                  />
                </div>
                <h2
                  className="text-[19px] sm:text-[20px] font-bold flex-1 leading-snug tracking-[-0.02em] pt-1"
                  style={{ color: "#1F2937" }}
                >
                  {selectedFaq.question}
                </h2>
              </div>
              <button
                onClick={() => setSelectedFaq(null)}
                aria-label="닫기"
                className="p-2 -mr-2 -mt-1 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div
                className="rounded-2xl p-5 space-y-3"
                style={{ backgroundColor: "#F4F7FB" }}
              >
                <p
                  className="text-[18px] sm:text-[19px] font-bold leading-relaxed tracking-[-0.02em]"
                  style={{ color: "#1F2937" }}
                >
                  {selectedFaq.answer}
                </p>
                <p
                  className="text-[15px] sm:text-[16px] leading-relaxed font-medium"
                  style={{ color: "#6B7280" }}
                >
                  {selectedFaq.note}
                </p>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <button
                onClick={() => toggleLike(selectedFaq.id)}
                className={`mt-5 w-full px-6 py-4 rounded-2xl border-2 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 ${
                  likedFaqs.has(selectedFaq.id)
                    ? "bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                <ThumbsUp
                  className="w-5 h-5"
                  strokeWidth={2.2}
                  fill={likedFaqs.has(selectedFaq.id) ? "currentColor" : "none"}
                />
                <span className="text-[16px] font-bold">도움이 되었어요</span>
              </button>
            </div>
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
            style={{
              boxShadow: "0 20px 60px -10px rgba(15,23,42,0.25)",
            }}
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
                        recordSatisfaction(opt.value).then(() =>
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
    </div>
  );
}
