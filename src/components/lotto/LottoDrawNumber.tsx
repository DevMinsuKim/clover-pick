"use client";

import { getLotto } from "@/libs/queries/lottoQueries";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function LottoDrawNumber() {
  const { data, error, isFetching } = useSuspenseQuery(getLotto);
  if (error && !isFetching) {
    throw error;
  }

  return <>{data?.draw_number} </>;
}
