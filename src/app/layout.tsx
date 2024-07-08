import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryClientProvider";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import { ErrorModalProvider } from "@/providers/ErrorModalProvider";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import GoogleAdsense from "@/components/common/GoogleAdsense";

const notoSansKR = Noto_Sans_KR({ subsets: ["latin"] });

const titleEn = "CloverPick";
const titleKr = "클로버픽";

export const metadata: Metadata = {
  title: {
    default: titleKr,
    template: `%s | ${titleKr}`,
  },
  description: `클로버픽 AI로 쉽고 빠르게 번호를 생성해보세요!`,
  keywords: [
    "로또",
    "로또 번호 생성",
    "로또 당첨 번호 조회",
    "AI 로또 번호",
    "AI 연금복권 번호",
    "복권",
    "연금",
    "연금복권",
    "연금복권 번호 생성",
    "연금복권 당첨 번호 조회",
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
        className={`${notoSansKR.className} mx-auto w-full min-w-[320px] break-keep`}
      >
        <ThemeProvider>
          <QueryProvider>
            <ErrorModalProvider>
              <header className="sticky top-0 z-20 mx-auto w-full bg-background px-6">
                <NavBar />
              </header>
              <main className="min-h-screen flex-grow">
                {children}
                <SpeedInsights />
              </main>
              <footer>
                <Footer />
              </footer>
            </ErrorModalProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
      <GoogleTagManager
        gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER ?? ""}
      />
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ""} />
      <GoogleAdsense pId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER ?? ""} />
    </html>
  );
}
