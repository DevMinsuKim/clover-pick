"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getLottoQuery } from "@/libs/queries/lottoQueries";

export default function LottoDrawNumber() {
  const { data, error, isFetching } = useSuspenseQuery(getLottoQuery);
  if (error && !isFetching) {
    throw error;
  }

  return <>{data.success?.draw_number ?? 0} </>;
}
