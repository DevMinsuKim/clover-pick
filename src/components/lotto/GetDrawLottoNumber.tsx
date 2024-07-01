"use client";

import { getDrawLottoNumber } from "@/libs/queries/lottoQueries";
import { useSuspenseQuery } from "@tanstack/react-query";
import GetDrawLottoNumberSkeleton from "@/components/lotto/GetDrawLottoNumberSkeleton";
import React from "react";

export default function GetDrawLottoNumber() {
  const { data } = useSuspenseQuery(getDrawLottoNumber);

  return (
    <div className="mt-10 flex flex-col items-center justify-center">
      <p className="text-center text-2xl font-extrabold sm:text-4xl">
        {data?.draw_number} 회차 <br /> 로또 6/45 번호 추첨
      </p>
    </div>
  );
}
