import ErrorFallback from "@/components/common/ErrorFallback";
import ErrorHandlingWrapper from "@/components/common/ErrorHandlingWrapper";
import PensionDrawNumber from "@/components/pension/PensionDrawNumber";
import PensionDrawNumberSkeleton from "@/components/pension/PensionDrawNumberSkeleton";
import PensionGenerationHistory from "@/components/pension/PensionGenerationHistory";
import PensionGenerationHistorySkeleton from "@/components/pension/PensionGenerationHistorySkeleton";
import PensionGenerator from "@/components/pension/PensionGenerator";
import PensionGeneratorWinning from "@/components/pension/PensionGeneratorWinning";
import PensionGeneratorWinningSkeleton from "@/components/pension/PensionGeneratorWinningSkeleton";
import PensionInfo from "@/components/pension/PensionInfo";
import { getQueryClient } from "@/libs/getQueryClient";
import {
  getPensionHistoryQuery,
  getPensionQuery,
  getPensionWinningQuery,
} from "@/libs/queries/pensionQueries";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function page() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(getPensionQuery),
    queryClient.prefetchQuery(getPensionHistoryQuery),
    queryClient.prefetchQuery(getPensionWinningQuery),
  ]);

  return (
    <section className="mx-auto w-full max-w-screen-xl px-6">
      <div className="mb-20 mt-10 flex flex-col items-center justify-center">
        <ErrorHandlingWrapper
          fallbackComponent={ErrorFallback}
          suspenseFallback={<PensionDrawNumberSkeleton />}
        >
          <div className="flex flex-col items-center text-center text-2xl font-extrabold sm:text-4xl">
            <p className="flex items-center">
              <HydrationBoundary state={dehydrate(queryClient)}>
                <PensionDrawNumber />
              </HydrationBoundary>
              회차
            </p>
            <p>연금복권 720+ 번호 생성</p>
          </div>
        </ErrorHandlingWrapper>
      </div>

      <ErrorHandlingWrapper
        fallbackComponent={ErrorFallback}
        suspenseFallback={null}
      >
        <PensionGenerator />
      </ErrorHandlingWrapper>

      <div className="mt-20 sm:mt-40">
        <p className="mb-4 text-lg font-bold sm:text-2xl">
          연금복권 번호 생성 목록
        </p>
        <ErrorHandlingWrapper
          fallbackComponent={ErrorFallback}
          suspenseFallback={<PensionGenerationHistorySkeleton />}
        >
          <HydrationBoundary state={dehydrate(queryClient)}>
            <PensionGenerationHistory />
          </HydrationBoundary>
        </ErrorHandlingWrapper>
      </div>

      <div className="mt-20 sm:mt-40">
        <p className="mb-4 text-lg font-bold sm:text-2xl">
          생성한 연금복권 번호 당첨 내역
        </p>
        <ErrorHandlingWrapper
          fallbackComponent={ErrorFallback}
          suspenseFallback={<PensionGeneratorWinningSkeleton />}
        >
          <HydrationBoundary state={dehydrate(queryClient)}>
            <PensionGeneratorWinning />
          </HydrationBoundary>
        </ErrorHandlingWrapper>
      </div>

      <div className="my-20 sm:my-40">
        <PensionInfo />
      </div>
    </section>
  );
}
