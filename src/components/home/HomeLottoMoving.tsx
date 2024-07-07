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
            const numbers = [
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
                className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 shadow first:ml-10 dark:border-none"
              >
                <p className="font-bold">{item.draw_number} 회</p>

                <div className="flex">
                  {numbers.map((number, numIndex) => (
                    <div
                      key={numIndex}
                      className={`mx-1 flex h-9 w-9 items-center justify-center gap-2 rounded-full`}
                      style={{ backgroundColor: lottoNumberBg(number) }}
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
