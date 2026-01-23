"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, BarChart3, Zap } from "lucide-react";
import { incrementUserCount } from "@/lib/statistics";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 페이지 방문 시 이용자 수 증가 (세션당 1회)
  useEffect(() => {
    const sessionKey = "nhis_session_counted";
    if (!sessionStorage.getItem(sessionKey)) {
      incrementUserCount().then(() => {
        sessionStorage.setItem(sessionKey, "true");
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-8">
          <Image
            src="/logo.svg"
            alt="국민건강보험공단"
            width={110}
            height={34}
            className="object-contain"
          />
          {/* 설정 버튼 */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
          >
            <Settings className="w-6 h-6" style={{ color: '#4E5968' }} />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">안녕하세요,</h1>
          <p className="text-xl text-gray-600">어떤 업무를 도와드릴까요?</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pb-6 pt-4 flex flex-col gap-4">
        {/* 상한제 제출 서류 안내 카드 */}
        <Link
          href="/documents"
          className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6"
        >
          <div className="flex items-center gap-4">
            {/* 아이콘 */}
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            {/* 텍스트 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                상한제 제출 서류 안내
              </h2>
              <p className="text-base text-gray-500">
                필요한 서류를 빠르게 확인하세요
              </p>
            </div>
            {/* 화살표 */}
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* 자주하는 질문 카드 */}
        <Link
          href="/faq"
          className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6"
        >
          <div className="flex items-center gap-4">
            {/* 아이콘 */}
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* 텍스트 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                자주하는 질문
              </h2>
              <p className="text-base text-gray-500">
                궁금한 점이 더 있으신가요?
              </p>
            </div>
            {/* 화살표 */}
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* 지사 팩스번호 찾기 카드 */}
        <Link
          href="/branch"
          className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6"
        >
          <div className="flex items-center gap-4">
            {/* 아이콘 */}
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {/* 텍스트 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                지사 팩스번호 찾기
              </h2>
              <p className="text-base text-gray-500">
                지사 정보를 찾아보세요
              </p>
            </div>
            {/* 화살표 */}
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* 신청서식 작성예시 카드 */}
        <Link
          href="/forms"
          className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6"
        >
          <div className="flex items-center gap-4">
            {/* 아이콘 */}
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            {/* 텍스트 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                신청서식 작성예시
              </h2>
              <p className="text-base text-gray-500">
                서류 작성 방법을 확인하세요
              </p>
            </div>
            {/* 화살표 */}
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </main>

      {/* 관리자 메뉴 사이드바 */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* 사이드바 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white z-50 shadow-2xl rounded-l-3xl"
            >
              {/* 사이드바 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">관리자 메뉴</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <X className="w-6 h-6" style={{ color: '#4E5968' }} />
                </button>
              </div>

              {/* 메뉴 항목들 */}
              <div className="p-4">
                <nav className="space-y-2">
                  {/* 상담 퀵 패스 */}
                  <Link
                    href="/admin/quick-pass"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all"
                  >
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900">상담 퀵 패스</div>
                      <div className="text-sm text-gray-500">서류 빠른 안내</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {/* 민원 대시보드 */}
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900">민원 대시보드</div>
                      <div className="text-sm text-gray-500">통계 및 실증 데이터 확인</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </nav>
              </div>

              {/* 사이드바 푸터 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
                <div className="text-center text-sm text-gray-400">
                  <div className="mb-1">━━━━━━━━━━━━━━━━</div>
                  <div>ⓒ 2026 NHIS Suwon-East</div>
                  <div>Lead Architect: 이승현 (Lee Seung-hyun)</div>
                  <div className="mt-1">━━━━━━━━━━━━━━━━</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
