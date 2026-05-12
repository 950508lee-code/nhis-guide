"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  X,
  BarChart3,
  Zap,
  FileText,
  HelpCircle,
  MapPin,
  PenLine,
  ChevronRight,
} from "lucide-react";
import SplashScreen from "./components/SplashScreen";

type TextScale = "normal" | "large";

const TEXT_SCALE_MAP: Record<TextScale, string> = {
  normal: "1",
  large: "1.15",
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [textScale, setTextScale] = useState<TextScale>("normal");

  useEffect(() => {
    const splashKey = "nhis_splash_shown";
    if (!sessionStorage.getItem(splashKey)) {
      setShowSplash(true);
      sessionStorage.setItem(splashKey, "true");
    }

    const saved = localStorage.getItem("nhis_text_scale") as TextScale | null;
    if (saved && saved in TEXT_SCALE_MAP) setTextScale(saved);
  }, []);

  useEffect(() => {
    document.documentElement.style.zoom = TEXT_SCALE_MAP[textScale];
    localStorage.setItem("nhis_text_scale", textScale);
  }, [textScale]);

  const menuItems = [
    {
      href: "/documents",
      Icon: FileText,
      iconBg: "#E0EAFF",
      iconBgInner: "#EEF2FF",
      iconColor: "#3B5BDB",
      title: "상한제 제출 서류 안내",
      desc: "필요한 서류를 빠르게 확인",
    },
    {
      href: "/faq",
      Icon: HelpCircle,
      iconBg: "#F0E7FF",
      iconBgInner: "#F5EFFF",
      iconColor: "#6F42C1",
      title: "자주하는 질문",
      desc: "상한제 관련 궁금증 해결",
    },
    {
      href: "/branch",
      Icon: MapPin,
      iconBg: "#D4F5E5",
      iconBgInner: "#E3F8EE",
      iconColor: "#10925A",
      title: "지사 팩스번호 찾기",
      desc: "전국 공단 지사 정보",
    },
    {
      href: "/forms",
      Icon: PenLine,
      iconBg: "#FFE8D6",
      iconBgInner: "#FFF1E5",
      iconColor: "#C2410C",
      title: "신청서식 작성예시",
      desc: "서류 작성 방법 안내",
    },
  ];

  const cardShadow =
    "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)";
  const cardRadius = "rounded-[20px]";

  return (
    <div
      className="min-h-[100dvh] flex flex-col relative overflow-hidden"
      style={{ backgroundColor: "#F4F7FB" }}
    >
      {showSplash && <SplashScreen />}


      {/* Header */}
      <header className="relative z-10 px-5 pt-safe pb-2">
        <div className="flex items-center justify-between h-12 mt-1">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-symbol.svg"
              alt="국민건강보험공단"
              width={26}
              height={30}
              className="object-contain"
            />
            <div className="flex items-baseline">
              <span className="text-[17px] font-extrabold tracking-[-0.04em] text-gray-900">
                NHIS
              </span>
              <span
                className="text-[17px] font-extrabold tracking-[-0.02em]"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ·GUIDE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* 글씨 크기 토글 */}
            <div
              className="flex items-center rounded-xl p-0.5 gap-0.5"
              style={{ backgroundColor: "#EEF0F4" }}
              role="group"
              aria-label="글씨 크기 조절"
            >
              {[
                { value: "normal" as TextScale, size: 12, label: "기본" },
                { value: "large" as TextScale, size: 15, label: "크게" },
              ].map((opt) => {
                const active = textScale === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTextScale(opt.value)}
                    aria-label={`글씨 ${opt.label}`}
                    aria-pressed={active}
                    className="w-8 h-7 rounded-lg flex items-center justify-center font-extrabold transition-all active:scale-90"
                    style={{
                      fontSize: `${opt.size}px`,
                      backgroundColor: active ? "#FFFFFF" : "transparent",
                      color: active ? "#2563EB" : "#9CA3AF",
                      boxShadow: active
                        ? "0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)"
                        : "none",
                    }}
                  >
                    가
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="설정 메뉴 열기"
              className="p-2 -mr-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
            >
              <Settings className="w-[22px] h-[22px] text-gray-500" />
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="mt-7">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-[30px] sm:text-[34px] font-extrabold tracking-[-0.035em] leading-[1.15]"
            style={{ color: "#1F2937" }}
          >
            안녕하세요,
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-[19px] sm:text-[21px] mt-1.5 font-semibold tracking-[-0.02em]"
            style={{ color: "#6B7280" }}
          >
            어떤 업무를 도와드릴까요?
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-5 pb-safe pt-6 flex flex-col gap-3">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.1 + i * 0.06,
              ease: "easeOut",
            }}
          >
            <Link
              href={item.href}
              className={`group relative z-10 flex items-center gap-4 bg-white ${cardRadius} p-5 active:scale-[0.98] transition-all`}
              style={{ boxShadow: cardShadow }}
            >
              {/* 아이콘 박스 — 친근한 파스텔 톤 */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${item.iconBgInner} 0%, ${item.iconBg} 100%)`,
                }}
              >
                <item.Icon
                  className="w-7 h-7"
                  strokeWidth={2}
                  style={{ color: item.iconColor }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-[19px] sm:text-[21px] font-bold tracking-[-0.02em] leading-tight" style={{ color: "#1F2937" }}>
                  {item.title}
                </h2>
                <p className="text-[14px] sm:text-[15px] mt-1 font-medium" style={{ color: "#6B7280" }}>
                  {item.desc}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 group-active:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        ))}
      </main>

      {/* 관리자 메뉴 사이드바 */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-[100dvh] w-[85%] max-w-[340px] bg-white z-50 shadow-2xl rounded-l-3xl flex flex-col"
              style={{
                paddingTop: "var(--safe-top)",
                paddingBottom: "var(--safe-bottom)",
              }}
            >
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
                <h2 className="text-[18px] font-bold text-gray-900 tracking-[-0.02em]">
                  관리자 메뉴
                </h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="메뉴 닫기"
                  className="p-2 -mr-1 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-4">
                <nav className="space-y-2">
                  <Link
                    href="/admin/quick-pass"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all"
                  >
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-bold text-gray-900 tracking-[-0.02em]">
                        상담 퀵 패스
                      </div>
                      <div className="text-[12.5px] text-gray-500 mt-0.5">
                        서류 빠른 안내
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>

                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all"
                  >
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-bold text-gray-900 tracking-[-0.02em]">
                        민원 대시보드
                      </div>
                      <div className="text-[12.5px] text-gray-500 mt-0.5">
                        통계 및 실증 데이터 확인
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                </nav>
              </div>

              <div className="mt-auto p-5 border-t border-gray-100">
                <div className="text-center text-[11px] text-gray-400 font-medium leading-relaxed">
                  <div>ⓒ 2026 NHIS Suwon-East</div>
                  <div className="mt-0.5">
                    Lead Architect: 이승현 (Lee Seung-hyun)
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
