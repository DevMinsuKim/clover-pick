import LottoGenerator from "@/components/lotto/LottoGenerator";
import React from "react";
import ErrorFallback from "@/components/common/ErrorFallback";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getDrawLottoNumber } from "@/libs/queries/lottoQueries";
import { getQueryClient } from "@/libs/getQueryClient";
import ErrorHandlingWrapper from "@/components/common/ErrorHandlingWrapper";
import DrawLottoNumberSkeleton from "@/components/lotto/DrawLottoNumberSkeleton";
import DrawLottoNumber from "@/components/lotto/DrawLottoNumber";

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(getDrawLottoNumber);

  return (
    <section>
      <ErrorHandlingWrapper
        fallbackComponent={ErrorFallback}
        suspenseFallback={<DrawLottoNumberSkeleton />}
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DrawLottoNumber />
        </HydrationBoundary>
      </ErrorHandlingWrapper>

      <ErrorHandlingWrapper
        fallbackComponent={ErrorFallback}
        suspenseFallback={null}
      >
        <LottoGenerator />
      </ErrorHandlingWrapper>
    </section>
  );
}
