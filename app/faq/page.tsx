"use client";

import Link from "next/link";
import { useState } from "react";
import { recordSatisfaction } from "@/lib/statistics";

interface FAQ {
  id: number;
  iconBg: string;
  iconColor: string;
  iconPath: string;
  question: string;
  answer: string;
  note: string;
}

export default function FAQ() {
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [likedFaqs, setLikedFaqs] = useState<Set<number>>(new Set());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const faqs: FAQ[] = [
    {
      id: 1,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      question: "신청했는데 환급금은 언제 들어오나요?",
      answer: "서류 접수 후 영업일 기준 7일 이내에 입금해 드려요.",
      note: "다만, 민원 집중기(매년 8~10월)는 접수 건수가 갑자기 몰리는 시기에는 조금 더 시간이 걸릴 수 있으니 너그러운 마음으로 기다려 주세요!",
    },
    {
      id: 2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      iconPath: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
      question: "예상보다 환급 금액이 적은 것 같아요.",
      answer: "본인부담상한제는 '건강보험이 적용되는 필수 진료비'만 계산에 포함하기 때문이에요.",
      note: "비급여(도수치료 등), 선별급여, 임플란트, 상급병실료, 추나요법, 정부·지자체 의료비 지원금 등은 법적으로 제외됩니다.",
    },
    {
      id: 3,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
      iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      question: "실손보험사에서 공단 환급금을 알아보라고 하는데 왜 그런가요?",
      answer: "최근 대법원 판결에 따라, 상한제 환급금은 실손보험 보상 대상에서 제외될 수 있기 때문이에요.",
      note: "올해 진료비 정산은 내년 9월에 이루어지므로, 지금 당장은 조회가 어려울 수 있다는 점을 보험사에 설명해 주세요.",
    },
    {
      id: 4,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      question: "실손보험사 제출용 증빙서류를 공단에서 뗄 수 있나요?",
      answer: "아쉽게도 실손보험 제출 전용 공적 서류는 공단에서 별도로 발급하지 않아요.",
      note: "THE건강보험 앱 > 민원여기요 > 조회 > 환급금 조회/신청 > 상한제 사후환급금 조회 또는 국민건강보험공단 홈페이지 > 자주 찾는 서비스 > 환급금 조회/신청 메뉴에서 직접 내역을 캡처해 주세요.",
    },
    {
      id: 5,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
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
      // 좋아요를 누른 경우 피드백 모달 표시
      setShowFeedbackModal(true);
    }
    setLikedFaqs(newLiked);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-4 pb-2 flex items-center justify-between">
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
        <h1 className="text-xl font-bold text-gray-900">자주하는 질문</h1>
        <div className="w-6"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pb-6 pt-4 overflow-y-auto">
        {/* FAQ 리스트 */}
        <div className="space-y-3">
          {faqs.map((faq) => (
            <button
              key={faq.id}
              onClick={() => setSelectedFaq(faq)}
              className="w-full bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${faq.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-7 h-7 ${faq.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={faq.iconPath} />
                  </svg>
                </div>
                <span className="flex-1 text-left text-2xl font-bold text-gray-900">
                  {faq.question}
                </span>
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
      </main>

      {/* 바텀시트 모달 */}
      {selectedFaq && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setSelectedFaq(null)}
        >
          <div
            className="w-full h-[80vh] bg-white rounded-t-[24px] flex flex-col animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-12 h-12 ${selectedFaq.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-6 h-6 ${selectedFaq.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedFaq.iconPath} />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 flex-1">
                  {selectedFaq.question}
                </h2>
              </div>
              <button
                onClick={() => setSelectedFaq(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="bg-[#F2F4F6] rounded-2xl p-6 space-y-4">
                <p className="text-2xl font-semibold text-[#1A1A1A] leading-relaxed">
                  {selectedFaq.answer}
                </p>
                <p className="text-xl text-[#4E5968] leading-relaxed">
                  {selectedFaq.note}
                </p>
              </div>

              {/* 도움이 되었어요 버튼 */}
              <button
                onClick={() => toggleLike(selectedFaq.id)}
                className={`mt-6 w-full px-6 py-4 rounded-xl border-2 transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
                  likedFaqs.has(selectedFaq.id)
                    ? "bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill={likedFaqs.has(selectedFaq.id) ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                <span className="text-xl font-semibold">
                  도움이 되었어요
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 피드백 모달 */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-[90%] shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-6">
              {/* 체크 아이콘 */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* 메시지 */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">감사합니다!</h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  소중한 의견<br />감사드립니다
                </p>
              </div>

              {/* 구분선 */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* 피드백 질문 */}
              <div className="space-y-4">
                <p className="text-xl text-gray-700 font-semibold">이 안내가<br />도움이 되셨나요?</p>

                {/* 이모지 버튼들 */}
                <div className="flex justify-center gap-6 pt-2">
                  <button
                    onClick={() => {
                      recordSatisfaction('good').then(() => setShowFeedbackModal(false));
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    <span className="text-5xl">😊</span>
                    <span className="text-sm text-gray-600">좋아요</span>
                  </button>
                  <button
                    onClick={() => {
                      recordSatisfaction('neutral').then(() => setShowFeedbackModal(false));
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    <span className="text-5xl">😐</span>
                    <span className="text-sm text-gray-600">보통</span>
                  </button>
                  <button
                    onClick={() => {
                      recordSatisfaction('bad').then(() => setShowFeedbackModal(false));
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    <span className="text-5xl">😢</span>
                    <span className="text-sm text-gray-600">아쉬워요</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
