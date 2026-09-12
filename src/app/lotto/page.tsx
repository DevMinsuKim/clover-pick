export const revalidate = 1;

import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import ErrorFallback from "@/components/common/ErrorFallback";
import ErrorHandlingWrapper from "@/components/common/ErrorHandlingWrapper";
import LotteryRecordsTabs from "@/components/lottery/LotteryRecordsTabs";
import LottoDrawNumber from "@/components/lotto/LottoDrawNumber";
import LottoDrawNumberSkeleton from "@/components/lotto/LottoDrawNumberSkeleton";
import LottoGenerator from "@/components/lotto/LottoGenerator";
import LottoInfo from "@/components/lotto/LottoInfo";
import { getQueryClient } from "@/libs/getQueryClient";
import {
  getLottoHistoryQuery,
  getLottoQuery,
  getLottoWinningQuery,
} from "@/libs/queries/lottoQueries";

export default async function Page() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.query(getLottoQuery).catch(noop),
    queryClient.query(getLottoHistoryQuery()).catch(noop),
    queryClient.query(getLottoWinningQuery()).catch(noop),
  ]);

  return (
    <section className="mx-auto w-full max-w-screen-xl px-6">
      <div className="mb-20 mt-10 flex flex-col items-center justify-center">
        <ErrorHandlingWrapper
          fallbackComponent={ErrorFallback}
          suspenseFallback={<LottoDrawNumberSkeleton />}
        >
          <div className="flex flex-col items-center text-center text-2xl font-extrabold sm:text-4xl">
            <p className="flex items-center">
              <HydrationBoundary state={dehydrate(queryClient)}>
                <LottoDrawNumber />
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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <LotteryRecordsTabs game="lotto" />
        </HydrationBoundary>
      </div>

      <div className="my-20 sm:my-40">
        <LottoInfo />
      </div>
    </section>
  );
}
