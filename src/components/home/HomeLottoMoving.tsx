"use client";

import { getHome } from "@/libs/queries/homeQueries";
import { formatDate } from "@/utils/formatDate";
import { lottoNumberBg } from "@/utils/lottoNumberBg";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import Marquee from "react-fast-marquee";

export default function HomeLottoMoving() {
  const { data, error, isFetching } = useSuspenseQuery(getHome);

  if (error && !isFetching) {
    throw error;
  }

  return (
    <div className="mt-20">
      <Marquee autoFill={true} pauseOnHover={true}>
        <div className="flex gap-10">
          {data.lottoCreateList.map((item, index) => {
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
                className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 first:ml-10 dark:border-none"
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
                        style={{
                          textShadow: "0px 0px 3px rgba(73, 57, 0, .8)",
                        }}
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
      </Marquee>
    </div>
  );
}
