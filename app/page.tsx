import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen bg-[#f9fafb] relative overflow-hidden">
      {/* Header with Logo */}
      <header className="absolute top-0 right-0 px-6 pt-4 pb-2 z-10">
        <Image
          src="/logo.svg"
          alt="국민건강보험공단"
          width={128}
          height={40}
          className="object-contain"
        />
      </header>

      {/* Main Content */}
      <main className="h-full flex flex-col px-5 pb-4 gap-3 justify-center items-center w-full">
        {/* 상한제 제출 서류 안내 버튼 */}
        <Link
          href="/documents"
          className="w-full h-[168px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-sm active:scale-[0.98] transition-transform overflow-hidden"
        >
          <div className="h-full flex flex-row items-center px-6 gap-4">
            <div className="w-12 h-12 bg-white/35 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0 shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[38px] font-bold text-white leading-[1.2]">
                상한제
                <br />
                제출 서류 안내
              </h2>
            </div>
          </div>
        </Link>

        {/* 지사 팩스번호 찾기 버튼 */}
        <Link
          href="/branch"
          className="w-full h-[168px] bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-sm active:scale-[0.98] transition-transform overflow-hidden"
        >
          <div className="h-full flex flex-row items-center px-6 gap-4">
            <div className="w-12 h-12 bg-white/35 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0 shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[38px] font-bold text-white leading-[1.2]">
                지사
                <br />
                팩스번호 찾기
              </h2>
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
