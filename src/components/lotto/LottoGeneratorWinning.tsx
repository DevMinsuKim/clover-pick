"use client";

import { getLottoWinning } from "@/libs/queries/lottoQueries";
import { formatDate } from "@/utils/formatDate";
import { lottoNumberBg } from "@/utils/lottoNumberBg";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function LottoGeneratorWinning() {
  const { data, error, isFetching } = useSuspenseQuery(getLottoWinning);
  if (error && !isFetching) {
    throw error;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-lg border bg-content1 py-4 shadow dark:border-none">
        <p className="font-bold">
          아직 당첨 내역이 없습니다.😔 <br />
          다음 회차를 기대해 주세요!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item, index) => {
        const winningNumbers = [
          item.winning_number1,
          item.winning_number2,
          item.winning_number3,
          item.winning_number4,
          item.winning_number5,
          item.winning_number6,
        ];

        return (
          <div
            key={index}
            className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 shadow dark:border-none"
          >
            <p className="text-lg font-bold">
              <strong className="text-primary">{item.ranking}</strong> 등
            </p>
            <p className="font-bold">{item.draw_number} 회</p>

            <div className="flex">
              {winningNumbers.map((number, numIndex) => (
                <div
                  key={numIndex}
                  className={`mx-1 flex h-9 w-9 items-center justify-center gap-2 rounded-full`}
                  style={{ backgroundColor: lottoNumberBg(number) }}
                >
                  <p
                    className="text-white"
                    style={{ textShadow: "0px 0px 3px rgba(73, 57, 0, .8)" }}
                  >
                    {number}
                  </p>
                </div>
              ))}
            </div>

            <p className="whitespace-pre-wrap break-words text-xs">
              {formatDate(item.winning_created)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
