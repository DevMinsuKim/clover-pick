"use client";

import { getLottoInfo } from "@/libs/queries/lottoQueries";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function DrawLottoNumber() {
  const { data, error, isFetching } = useSuspenseQuery(getLottoInfo);
  if (error && !isFetching) {
    throw error;
  }

  return <>{data?.draw_number} </>;
}
