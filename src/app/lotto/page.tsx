import GetDrawLottoNumber from "@/components/lotto/GetDrawLottoNumber";
import LottoGenerator from "@/components/lotto/LottoGenerator";
import React from "react";
import ErrorFallback from "@/components/common/ErrorFallback";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getDrawLottoNumber } from "@/libs/queries/lottoQueries";
import { getQueryClient } from "@/libs/getQueryClient";
import GetDrawLottoNumberSkeleton from "@/components/lotto/GetDrawLottoNumberSkeleton";
import ErrorHandlingWrapper from "@/components/common/ErrorHandlingWrapper";

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(getDrawLottoNumber);

  return (
    <section>
      <ErrorHandlingWrapper
        fallbackComponent={ErrorFallback}
        suspenseFallback={<GetDrawLottoNumberSkeleton />}
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <GetDrawLottoNumber />
        </HydrationBoundary>
      </ErrorHandlingWrapper>

      {/* <LottoGenerator /> */}
    </section>
  );
}
