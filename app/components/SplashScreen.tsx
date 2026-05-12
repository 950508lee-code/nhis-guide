"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 4200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setIsVisible(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          style={{
            background:
              "linear-gradient(180deg, #FFFFFF 0%, #F5F9FF 55%, #EBF2FE 100%)",
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* 은은한 메쉬 글로우 — 좌상단 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 0.5,
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
            }}
            transition={{
              opacity: { duration: 1.4 },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 12, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute top-[-100px] left-[-100px] w-[320px] h-[320px] sm:top-[-120px] sm:left-[-120px] sm:w-[420px] sm:h-[420px] rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(191,219,254,0.5) 0%, transparent 65%)",
            }}
          />

          {/* 은은한 메쉬 글로우 — 우하단 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 0.4,
              scale: [1, 1.12, 1],
              x: [0, -25, 0],
            }}
            transition={{
              opacity: { duration: 1.4, delay: 0.3 },
              scale: { duration: 11, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 13, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute bottom-[-100px] right-[-100px] w-[340px] h-[340px] sm:bottom-[-120px] sm:right-[-120px] sm:w-[440px] sm:h-[440px] rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(254,202,202,0.35) 0%, transparent 65%)",
            }}
          />

          {/* 콘텐츠 */}
          <div className="relative z-10 flex flex-col items-center px-5 sm:px-6 w-full">
            {/* 로고 영역 */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
              className="relative mb-5 sm:mb-6"
            >
              {/* 부드러운 단발 링 — 등장 시 1회 */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{
                  duration: 1.4,
                  delay: 0.3,
                  ease: "easeOut",
                  times: [0, 1],
                }}
                style={{
                  borderColor: "rgba(239,45,56,0.2)",
                }}
                className="absolute inset-0 rounded-full border-2"
              />

              {/* 로고 — 부드러운 플로팅 (y + x sway) */}
              <motion.div
                animate={{
                  y: [0, -14, 0, -10, 0],
                  x: [0, 3, 0, -3, 0],
                }}
                transition={{
                  y: {
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  },
                  x: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  },
                }}
              >
                {/* 회전 + 미세 스케일 브레스 */}
                <motion.div
                  animate={{
                    rotate: [-2.5, 2.5, -2.5],
                    scale: [1, 1.03, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    },
                    scale: {
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    },
                  }}
                >
                  <Image
                    src="/logo-symbol.svg"
                    alt="국민건강보험공단"
                    width={200}
                    height={210}
                    priority
                    className="object-contain w-[150px] h-[158px] sm:w-[180px] sm:h-[189px] md:w-[200px] md:h-[210px]"
                    style={{
                      filter:
                        "drop-shadow(0 16px 32px rgba(239,45,56,0.18)) drop-shadow(0 4px 8px rgba(0,0,0,0.05))",
                    }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* 워드마크 — NHIS-GUIDE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
              className="mb-6 sm:mb-8 flex items-baseline"
            >
              <span
                className="text-[20px] sm:text-[24px] md:text-[26px] font-black tracking-[-0.04em] text-gray-900"
                style={{ fontFeatureSettings: '"ss01"' }}
              >
                NHIS
              </span>
              <span
                className="text-[20px] sm:text-[24px] md:text-[26px] font-black tracking-[-0.02em]"
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
            </motion.div>

            {/* 메인 카피 — 1줄 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.7, ease: "easeOut" }}
              className="text-center px-2"
            >
              <h1 className="text-[19px] sm:text-[22px] md:text-[26px] font-semibold tracking-[-0.02em] leading-tight text-gray-700">
                복잡한 서류 안내를
              </h1>
            </motion.div>

            {/* 메인 카피 — 2줄 (하이라이트) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 text-center relative inline-block px-2"
            >
              <h2
                className="text-[30px] sm:text-[36px] md:text-[40px] font-black tracking-[-0.03em] leading-[1.05] relative"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                쉽고, 정확하게
              </h2>

              {/* 키워드 하이라이트 스윕 */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-1/2 -translate-x-1/2 h-[10px] w-[180px] sm:w-[220px] md:w-[250px] origin-left rounded-full -z-10"
                style={{
                  bottom: "0px",
                  background:
                    "linear-gradient(90deg, rgba(96,165,250,0.3) 0%, rgba(59,130,246,0.45) 50%, rgba(96,165,250,0.3) 100%)",
                }}
              />
            </motion.div>

            {/* 로딩 인디케이터 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.4 }}
              className="flex items-center gap-1.5 mt-10 sm:mt-12"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.25, 1, 0.25],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.16,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-blue-500"
                />
              ))}
            </motion.div>
          </div>

          {/* 하단 브랜드 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.5 }}
            className="absolute left-0 right-0 px-4 text-center"
            style={{
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
            }}
          >
            <p className="text-[9px] sm:text-[11px] text-gray-400 tracking-[0.14em] uppercase font-semibold whitespace-nowrap">
              National Health Insurance Service
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
