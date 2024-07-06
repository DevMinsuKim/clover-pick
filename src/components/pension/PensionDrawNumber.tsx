"use client";

import { getLotto } from "@/libs/queries/lottoQueries";
import { getPension } from "@/libs/queries/pensionQueries";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function PensionDrawNumber() {
  const { data, error, isFetching } = useSuspenseQuery(getPension);
  if (error && !isFetching) {
    throw error;
  }

  return <>{data?.draw_number} </>;
}
