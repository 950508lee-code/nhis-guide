"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ROUTE_NAMES: Record<string, string> = {
  "/": "메인",
  "/documents": "서류안내",
  "/faq": "자주묻는질문",
  "/branch": "지사찾기",
  "/forms": "신청서식",
  "/admin/quick-pass": "퀵패스",
  "/admin/dashboard": "대시보드",
};

function getRouteName(pathname: string): string {
  if (pathname in ROUTE_NAMES) return ROUTE_NAMES[pathname];
  for (const route of Object.keys(ROUTE_NAMES)) {
    if (route !== "/" && pathname.startsWith(route)) return ROUTE_NAMES[route];
  }
  return pathname;
}

export default function RouteIndicator() {
  const pathname = usePathname();
  const [detail, setDetail] = useState<string>("");

  useEffect(() => {
    setDetail("");
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ detail: string }>;
      setDetail(ce.detail?.detail ?? "");
    };
    window.addEventListener("route-detail", handler);
    return () => window.removeEventListener("route-detail", handler);
  }, [pathname]);

  const name = getRouteName(pathname);
  const label = detail ? `${name} · ${detail}` : name;

  return (
    <div
      className="fixed z-[9999] pointer-events-none select-none"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 4px)",
        right: "6px",
      }}
    >
      <div
        className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-[0.05em] tabular-nums whitespace-nowrap"
        style={{
          backgroundColor: "rgba(15,23,42,0.65)",
          color: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(4px)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
