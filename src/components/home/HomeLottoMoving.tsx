"use client";

import { getHomeQuery } from "@/libs/queries/homeQueries";
import { formatDate } from "@/utils/formatDate";
import { lottoNumberBg } from "@/utils/lottoNumberBg";
import { pensionNumberBg } from "@/utils/pensionNumberBg";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function HomeLottoMoving() {
  const { data, error, isFetching } = useSuspenseQuery(getHomeQuery);

  if (error && !isFetching) {
    throw error;
  }

  const renderPensionNumbers = (number: string) => {
    const numberInt = number.split("");

    return numberInt.map((number, index) => (
      <div
        key={index}
        className="flex items-center justify-between text-center"
      >
        <span
          key={index}
          className={`h-8 w-8 rounded-full border-2 border-[#ffffff] text-base font-bold xs:ml-1 sm:h-8 sm:w-8 sm:text-xl`}
          style={{ borderColor: pensionNumberBg(index) }}
        >
          {number}
        </span>
        {index === 0 && <span className="text-sm xs:ml-1 sm:text-xl">조</span>}
      </div>
    ));
  };

  return (
    <div className="mt-20">
      <div className="group flex space-x-16 overflow-hidden">
        <div className="animate-loop-scroll group-hover:paused flex space-x-16">
          {data.success?.lottoCreateList.map((item, index) => {
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
                className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 shadow dark:border-none"
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

        <div
          className="animate-loop-scroll group-hover:paused flex space-x-16"
          aria-hidden="true"
        >
          {data.success?.lottoCreateList.map((item, index) => {
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
                className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 shadow dark:border-none"
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
      </div>

      <div className="group mt-12 flex space-x-16 overflow-hidden">
        <div className="animate-reverse-loop-scroll group-hover:paused flex space-x-16">
          {data.success?.pensionCreateList.map((item, index) => {
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 shadow dark:border-none"
              >
                <p className="font-bold">{item.draw_number} 회</p>

                <div className="flex px-1">
                  {renderPensionNumbers(item.number)}
                </div>

                <p className="whitespace-pre-wrap break-words text-xs">
                  {formatDate(item.created)}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className="animate-reverse-loop-scroll group-hover:paused flex space-x-16"
          aria-hidden="true"
        >
          {data.success?.pensionCreateList.map((item, index) => {
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 shadow dark:border-none"
              >
                <p className="font-bold">{item.draw_number} 회</p>

                <div className="flex px-1">
                  {renderPensionNumbers(item.number)}
                </div>

                <p className="whitespace-pre-wrap break-words text-xs">
                  {formatDate(item.created)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
