export const dynamic = "force-dynamic";
import LottoGenerator from "@/components/lotto/LottoGenerator";
import React from "react";
import ErrorFallback from "@/components/common/ErrorFallback";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import {
  getLottoInfo,
  getLottoHistory,
  getLottoWinning,
} from "@/libs/queries/lottoQueries";
import { getQueryClient } from "@/libs/getQueryClient";
import ErrorHandlingWrapper from "@/components/common/ErrorHandlingWrapper";
import DrawLottoNumberSkeleton from "@/components/lotto/DrawLottoNumberSkeleton";
import DrawLottoNumber from "@/components/lotto/DrawLottoNumber";
import LottoGenerationHistory from "@/components/lotto/LottoGenerationHistory";
import LottoGenerationHistorySkeleton from "@/components/lotto/LottoGenerationHistorySkeleton";
import LottoGeneratorWinning from "@/components/lotto/LottoGeneratorWinning";
import LottoInfo from "@/components/lotto/LottoInfo";
import LottoGeneratorWinningSkeleton from "@/components/lotto/LottoGeneratorWinningSkeleton";

export default async function Page() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(getLottoInfo),
    queryClient.prefetchQuery(getLottoHistory),
    queryClient.prefetchQuery(getLottoWinning),
  ]);

  return (
    <section className="mx-auto w-full max-w-screen-xl px-6">
      <div className="mt-10 flex flex-col items-center justify-center">
        <ErrorHandlingWrapper
          fallbackComponent={ErrorFallback}
          suspenseFallback={<DrawLottoNumberSkeleton />}
        >
          <div className="flex flex-col items-center text-center text-2xl font-extrabold sm:text-4xl">
            <p className="flex items-center">
              <HydrationBoundary state={dehydrate(queryClient)}>
                <DrawLottoNumber />
              </HydrationBoundary>
              회차
            </p>
            <p>로또 6/45 번호 생성</p>
          </div>
        </ErrorHandlingWrapper>
      </div>

      <ErrorHandlingWrapper
        fallbackComponent={ErrorFallback}
        suspenseFallback={null}
      >
        <LottoGenerator />
      </ErrorHandlingWrapper>

      <div className="mt-20 sm:mt-40">
        <p className="mb-4 text-lg font-bold sm:text-2xl">
          로또 번호 생성 목록
        </p>
        <ErrorHandlingWrapper
          fallbackComponent={ErrorFallback}
          suspenseFallback={<LottoGenerationHistorySkeleton />}
        >
          <HydrationBoundary state={dehydrate(queryClient)}>
            <LottoGenerationHistory />
          </HydrationBoundary>
        </ErrorHandlingWrapper>
      </div>

      <div className="mt-20 sm:mt-40">
        <p className="mb-4 text-lg font-bold sm:text-2xl">
          생성한 로또 번호 당첨 내역
        </p>
        <ErrorHandlingWrapper
          fallbackComponent={ErrorFallback}
          suspenseFallback={<LottoGeneratorWinningSkeleton />}
        >
          <HydrationBoundary state={dehydrate(queryClient)}>
            <LottoGeneratorWinning />
          </HydrationBoundary>
        </ErrorHandlingWrapper>
      </div>

      <div className="my-20 sm:my-40">
        <LottoInfo />
      </div>
    </section>
  );
}
