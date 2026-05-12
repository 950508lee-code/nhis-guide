import type { Metadata, Viewport } from "next";
import PageTransition from "./components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "NHIS·GUIDE — 본인부담상한제 환급 서류 안내",
  description: "본인부담상한제 환급 서류를 쉽고 정확하게 안내해 드립니다",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NHIS·GUIDE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="light" style={{ colorScheme: "light" }}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
