"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getPensionQuery } from "@/libs/queries/pensionQueries";

export default function PensionDrawNumber() {
  const { data, error, isFetching } = useSuspenseQuery(getPensionQuery);

  if (error && !isFetching) {
    throw error;
  }

  return <>{data.success?.draw_number ?? 0} </>;
}
