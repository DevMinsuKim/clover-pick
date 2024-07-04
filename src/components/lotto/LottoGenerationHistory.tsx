"use client";

import { getLottoHistory } from "@/libs/queries/lottoQueries";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function LottoGenerationHistory() {
  const { data } = useSuspenseQuery(getLottoHistory);

  const lottoNumberBg = (number: number) => {
    if (number === 0) {
      return "bg-[#aaaaaa]";
    } else if (number <= 10) {
      return "bg-[#fbc400]";
    } else if (number <= 20) {
      return "bg-[#69c8f2]";
    } else if (number <= 30) {
      return "bg-[#ff7272]";
    } else if (number <= 40) {
      return "bg-[#aaaaaa]";
    } else if (number <= 45) {
      return "bg-[#b0d840]";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  };

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
            className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 dark:border-none"
          >
            <p className="font-bold">{item.draw_number} 회</p>

            <div className="flex">
              {winningNumbers.map((number, numIndex) => (
                <div
                  key={numIndex}
                  className={`${lottoNumberBg(number)} mx-1 flex h-9 w-9 items-center justify-center gap-2 rounded-full`}
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
              {formatDate(item.created)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
