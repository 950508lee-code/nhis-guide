"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, FileText, ChevronRight, X } from "lucide-react";
import { countMenuVisit } from "@/lib/statistics";

export default function FormsPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    countMenuVisit();
  }, []);

  const forms = [
    {
      name: "환급금 지급신청서",
      desc: "기본 신청 서식 예시",
      image: "/환급금 지급신청서.png",
      iconBg: "#E0EAFF",
      iconBgInner: "#EEF2FF",
      iconColor: "#3B5BDB",
    },
    {
      name: "상속대표선정동의서",
      desc: "상속인 전원 서명 필요",
      image: "/상속대표선정동의서.png",
      iconBg: "#F0E7FF",
      iconBgInner: "#F5EFFF",
      iconColor: "#6F42C1",
    },
    {
      name: "상한제 위임장",
      desc: "위임장 작성 예시",
      image: "/상한제 위임장.png",
      iconBg: "#D4F5E5",
      iconBgInner: "#E3F8EE",
      iconColor: "#10925A",
    },
  ];

  const cardShadow =
    "0 4px 16px -6px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)";

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ backgroundColor: "#F4F7FB" }}
    >
      {/* Header */}
      <header
        className="bg-white/90 backdrop-blur-md px-4 sm:px-5 pt-safe pb-3 flex items-center gap-3 border-b border-gray-100/80 sticky top-0 z-10"
      >
        <Link
          href="/"
          aria-label="뒤로 가기"
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-[17px] sm:text-[19px] font-bold tracking-[-0.02em]" style={{ color: "#1F2937" }}>
          신청서식 작성예시
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-5 pt-5 pb-safe">
        <div className="space-y-3">
          {forms.map((form) => (
            <button
              key={form.name}
              onClick={() => setSelectedImage(form.image)}
              className="group w-full bg-white rounded-[20px] p-5 flex items-center gap-4 active:scale-[0.98] transition-all"
              style={{ boxShadow: cardShadow }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${form.iconBgInner} 0%, ${form.iconBg} 100%)`,
                }}
              >
                <FileText
                  className="w-7 h-7"
                  strokeWidth={2}
                  style={{ color: form.iconColor }}
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h2 className="text-[19px] sm:text-[21px] font-bold tracking-[-0.02em] leading-tight" style={{ color: "#1F2937" }}>
                  {form.name}
                </h2>
                <p className="text-[14px] sm:text-[15px] mt-1 font-medium" style={{ color: "#6B7280" }}>
                  {form.desc}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 group-active:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 16px)",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
          }}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              aria-label="닫기"
              className="absolute -top-12 right-0 text-white p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
            >
              <X className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
            <Image
              src={selectedImage}
              alt="서식 작성예시"
              width={600}
              height={800}
              className="max-h-[80vh] w-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
