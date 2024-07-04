"use client";

import { getLottoInfo } from "@/libs/queries/lottoQueries";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function DrawLottoNumber() {
  const { data } = useSuspenseQuery(getLottoInfo);

  return <>{data?.draw_number} </>;
}
