"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function FormsPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const forms = [
    { name: "환급금 지급신청서", image: "/환급금 지급신청서.png" },
    { name: "상속대표선정동의서", image: "/상속대표선정동의서.png" },
    { name: "상한제 위임장", image: "/상한제 위임장.png" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white px-5 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-10">
        <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">신청서식 작성예시</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6">
        <div className="space-y-3">
          {forms.map((form) => (
            <button
              key={form.name}
              onClick={() => setSelectedImage(form.image)}
              className="w-full bg-white rounded-[16px] shadow-sm p-5 flex items-center justify-between hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-900">{form.name}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src={selectedImage}
              alt="서식 작성예시"
              width={600}
              height={800}
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
