import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "./components/Footer";
import NavigationBar from "./components/NavigationBar";

const notoSansKr = Noto_Sans_KR({ subsets: ["latin"] });

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
      <body className={notoSansKr.className}>
        <Providers>
          <header>
            <NavigationBar />
          </header>
          <main>{children}</main>
          <footer>
            <Footer />
          </footer>
        </Providers>
      </body>
    </html>
  );
}
