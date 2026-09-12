export const revalidate = 1;

import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import ErrorFallback from "@/components/common/ErrorFallback";
import ErrorHandlingWrapper from "@/components/common/ErrorHandlingWrapper";
import LotteryRecordsTabs from "@/components/lottery/LotteryRecordsTabs";
import PensionDrawNumber from "@/components/pension/PensionDrawNumber";
import PensionDrawNumberSkeleton from "@/components/pension/PensionDrawNumberSkeleton";
import PensionGenerator from "@/components/pension/PensionGenerator";
import PensionInfo from "@/components/pension/PensionInfo";
import { getQueryClient } from "@/libs/getQueryClient";
import {
  getPensionHistoryQuery,
  getPensionQuery,
  getPensionWinningQuery,
} from "@/libs/queries/pensionQueries";

export default async function Page() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.query(getPensionQuery).catch(noop),
    queryClient.query(getPensionHistoryQuery()).catch(noop),
    queryClient.query(getPensionWinningQuery()).catch(noop),
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
            <p>연금복권720+ 번호 생성</p>
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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <LotteryRecordsTabs game="pension" />
        </HydrationBoundary>
      </div>

      <div className="my-20 sm:my-40">
        <PensionInfo />
      </div>
    </section>
  );
}
