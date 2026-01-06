import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "올라운더 홈 - 수강 신청",
  description: "올라운더 홈 학원 수강 신청 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}





