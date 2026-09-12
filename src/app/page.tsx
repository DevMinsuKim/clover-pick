import type { Metadata } from "next";
import HomeActions from "@/components/home/HomeActions";
import HomeBallExperience from "@/components/home/HomeBallExperience";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeFeature from "@/components/home/HomeFeature";
import HomeNumberPreview from "@/components/home/HomeNumberPreview";
import HomeStats from "@/components/home/HomeStats";
import Clover from "@/components/ui/icons/Clover";

const title = "로또·연금복권 랜덤 & 맞춤 번호 생성";
const description =
  "로또 6/45와 연금복권 720+ 번호를 무료로 간편하게 만들어보세요. 랜덤 생성부터 AI로 원하는 조건을 정리하는 맞춤 생성, 생성 목록과 추첨 결과 대조까지 클로버픽에서.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${title} | 클로버픽`,
    description,
    url: "/",
    type: "website",
    locale: "ko_KR",
    siteName: "클로버픽",
  },
};

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-6">
      <section
        aria-labelledby="home-title"
        className="grid items-center gap-10 border-b border-divider pb-14 pt-10 dark:border-zinc-700 sm:gap-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:py-20"
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
            <span aria-hidden="true">
              <Clover className="size-4" />
            </span>
            로또 · 연금복권 번호 생성
          </p>
          <h1
            id="home-title"
            className="mt-5 text-[2.5rem] font-extrabold leading-[1.25] tracking-tight sm:text-6xl lg:text-[3.5rem] xl:text-6xl"
          >
            오늘의 번호,
            <br />
            <span className="text-green-700 dark:text-green-400">
              내 방식대로.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-content3 sm:mt-6 sm:text-lg sm:leading-8">
            가볍게 랜덤으로 고르거나,
            <br />
            원하는 조건을 담아 나만의 번호를 만들어보세요.
          </p>
          <div className="mt-8 max-w-xl">
            <HomeActions />
          </div>
          <p className="mt-4 text-xs leading-5 text-content3 sm:text-sm">
            회원가입 없이 · 무료 번호 생성 · 한 번에 최대 5게임
          </p>
        </div>
        <div className="min-w-0">
          <HomeNumberPreview />
        </div>
      </section>
      <HomeFeature />
      <HomeBallExperience />
      <HomeStats />
      <HomeFAQ />
      <section
        aria-labelledby="home-start-title"
        className="mb-16 rounded-3xl bg-green-50 px-5 py-10 text-center dark:bg-green-950/25 sm:mb-24 sm:px-8 sm:py-12"
      >
        <h2
          id="home-start-title"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          이제, 나만의 번호를 골라볼까요?
        </h2>
        <p className="mt-3 text-sm leading-6 text-content3 sm:text-base">
          로또와 연금복권, 원하는 복권부터 시작해 보세요.
        </p>
        <div className="mx-auto mt-7 max-w-xl">
          <HomeActions />
        </div>
      </section>
    </div>
  );
}
