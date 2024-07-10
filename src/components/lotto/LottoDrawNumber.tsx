"use client";

import { getLottoQuery } from "@/libs/queries/lottoQueries";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function LottoDrawNumber() {
  const { data, error, isFetching } = useSuspenseQuery(getLottoQuery);
  if (error && !isFetching) {
    throw error;
  }

  return <>{data.success?.draw_number ?? 0} </>;
}
