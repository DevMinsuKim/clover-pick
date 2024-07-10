"use client";

import { getPensionHistoryQuery } from "@/libs/queries/pensionQueries";
import { formatDate } from "@/utils/formatDate";
import { pensionNumberBg } from "@/utils/pensionNumberBg";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function PensionGenerationHistory() {
  const { data, error, isFetching } = useSuspenseQuery(getPensionHistoryQuery);
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.success?.map((item, index) => {
        return (
          <div
            key={index}
            className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 shadow dark:border-none"
          >
            <p className="font-bold">{item.draw_number} 회</p>

            <div className="flex px-1">{renderPensionNumbers(item.number)}</div>

            <p className="whitespace-pre-wrap break-words text-xs">
              {formatDate(item.created)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
