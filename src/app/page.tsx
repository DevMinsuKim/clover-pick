export const dynamic = "force-dynamic";
import React from "react";
import Link from "next/link";
import BallMix from "@/components/home/BallMix";
import Button from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import DeviceActionText from "@/components/home/DeviceActionText";
import ErrorFallback from "@/components/common/ErrorFallback";
import ErrorHandlingWrapper from "@/components/common/ErrorHandlingWrapper";
import { getQueryClient } from "@/libs/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getHome } from "@/libs/queries/homeQueries";
import HomeStats from "@/components/home/HomeStats";
import HomeStatsSkeleton from "@/components/home/HomeStatsSkeleton";
import HomeContentMoving from "@/components/home/HomeLottoMoving";
import HomeLottoMovingSkeleton from "@/components/home/HomeLottoMovingSkeleton";
import HomeFeature from "@/components/home/HomeFeature";
import HomeFAQ from "@/components/home/HomeFAQ";

export default function Home() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery(getHome);

  return (
    <section>
      <div className="mx-auto w-full max-w-screen-xl px-6">
        <h2 className="mt-32 text-center text-4xl font-extrabold sm:text-5xl lg:text-6xl">
          클로버픽 AI가 <br className="md:hidden" />
          선택한 번호, <br /> 최고의 행운을 <br className="md:hidden" />
          당신에게!
        </h2>

        <div className="mt-16 flex w-full flex-col items-center gap-5 md:flex-row md:justify-center">
          <div className="w-full max-w-sm md:w-auto">
            <Link href={ROUTES.LOTTO_645}>
              <Button className="w-full">로또 6/45 번호 생성하기</Button>
            </Link>
          </div>
          <div className="w-full max-w-sm md:w-auto">
            <Link href={ROUTES.PENSION_720}>
              <Button className="w-full">연금복권 720+ 번호 생성하기</Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative mt-2 h-56 w-full max-w-screen-sm md:h-72">
            <ErrorHandlingWrapper
              fallbackComponent={ErrorFallback}
              suspenseFallback={null}
            >
              <BallMix />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 transform md:bottom-10">
                <DeviceActionText />
              </div>
            </ErrorHandlingWrapper>
          </div>
        </div>
      </div>

      <ErrorHandlingWrapper
        fallbackComponent={ErrorFallback}
        suspenseFallback={<HomeStatsSkeleton />}
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <HomeStats />
        </HydrationBoundary>
      </ErrorHandlingWrapper>

      <ErrorHandlingWrapper
        fallbackComponent={ErrorFallback}
        suspenseFallback={<HomeLottoMovingSkeleton />}
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <HomeContentMoving />
        </HydrationBoundary>
      </ErrorHandlingWrapper>

      <HomeFeature />

      <HomeFAQ />

      <div className="mx-auto my-20 w-full max-w-screen-xl px-6 md:my-40">
        <div className="rounded-xl border bg-content1 px-6 pb-6 pt-4 shadow dark:border-none sm:py-8">
          <div className="mb-6 flex items-center justify-center">
            <p className="text-center text-xl font-bold sm:text-2xl">
              지금 바로 1분 안에 번호를 생성해 보세요!
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-5 md:flex-row md:justify-center">
            <div className="w-full max-w-sm md:w-auto">
              <Link href={ROUTES.LOTTO_645}>
                <Button className="w-full">로또 6/45 번호 생성하기</Button>
              </Link>
            </div>
            <div className="w-full max-w-sm md:w-auto">
              <Link href={ROUTES.PENSION_720}>
                <Button className="w-full">연금복권 720+ 번호 생성하기</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
