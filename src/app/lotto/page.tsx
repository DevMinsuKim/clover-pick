import GetDrawLottoNumber from "@/components/lotto/GetDrawLottoNumber";
import LottoGenerator from "@/components/lotto/LottoGenerator";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/common/ErrorFallback";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getDrawLottoNumber } from "@/libs/queries/lottoQueries";
import { getQueryClient } from "@/libs/getQueryClient";
import GetDrawLottoNumberSkeleton from "@/components/lotto/GetDrawLottoNumberSkeleton";

export default async function Page() {
  const queryClient = getQueryClient();
  // const { reset } = useQueryErrorResetBoundary();

  await queryClient.prefetchQuery(getDrawLottoNumber);

  return (
    <section>
      {/* <ErrorBoundary FallbackComponent={ErrorFallback}> */}
      {/* <GetDrawLottoNumberSkeleton /> */}
      <Suspense fallback={<GetDrawLottoNumberSkeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <GetDrawLottoNumber />
        </HydrationBoundary>
      </Suspense>
      {/* </ErrorBoundary> */}

      {/* <LottoGenerator /> */}
    </section>
  );
}
