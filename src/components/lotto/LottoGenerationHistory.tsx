"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getLottoHistoryQuery } from "@/libs/queries/lottoQueries";
import { formatDate } from "@/utils/formatDate";
import { lottoNumberBg } from "@/utils/lottoNumberBg";

export default function LottoGenerationHistory() {
  const { data, error, isFetching } = useSuspenseQuery(getLottoHistoryQuery);
  if (error && !isFetching) {
    throw error;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.success?.map((item, index) => {
        const winningNumbers = [
          item.number1,
          item.number2,
          item.number3,
          item.number4,
          item.number5,
          item.number6,
        ];

        return (
          <div
            key={index}
            className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 shadow-sm dark:border-none"
          >
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

            <p className="whitespace-pre-wrap wrap-break-word text-xs">
              {formatDate(item.created)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
