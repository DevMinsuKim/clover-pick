import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";

const notoSansKR = Noto_Sans_KR({ subsets: ["latin"] });

const titleEn = "CloverPick";
const titleKr = "클로버픽";

export const metadata: Metadata = {
  title: {
    default: titleKr,
    template: `%s | ${titleKr}`,
  },
  description: `당첨의 기회를 높이다, ${titleKr}`,
  keywords: [
    "로또",
    "로또 번호 생성",
    "로또 당첨 번호 조회",
    "AI 로또 번호",
    "복권",
    titleKr,
    titleEn,
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="ko">
      <body
        className={`${notoSansKR.className} container mx-auto w-full min-w-[320px] max-w-screen-xl break-words px-6`}
      >
        <Providers>
          <header className="sticky top-0 z-50">
            <NavBar />
          </header>
          <main>{children}</main>
          <footer className="mb-20">
            <Footer />
          </footer>
        </Providers>
      </body>
    </html>
  );
}
