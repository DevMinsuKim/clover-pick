export const dynamic = "force-dynamic";

import ErrorFallback from "@/components/common/ErrorFallback";
import ErrorHandlingWrapper from "@/components/common/ErrorHandlingWrapper";
import PensionDrawNumber from "@/components/pension/PensionDrawNumber";
import PensionDrawNumberSkeleton from "@/components/pension/PensionDrawNumberSkeleton";
import PensionGenerator from "@/components/pension/PensionGenerator";
import { getQueryClient } from "@/libs/getQueryClient";
import { getPension } from "@/libs/queries/pensionQueries";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function page() {
  const queryClient = getQueryClient();

  await Promise.all([queryClient.prefetchQuery(getPension)]);

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
    </section>
  );
}
