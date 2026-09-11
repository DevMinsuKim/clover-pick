"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getPensionWinningQuery } from "@/libs/queries/pensionQueries";
import { formatDate } from "@/utils/formatDate";
import { pensionNumberBg } from "@/utils/pensionNumberBg";

export default function PensionGeneratorWinning() {
  const { data, error, isFetching } = useSuspenseQuery(getPensionWinningQuery);
  if (error && !isFetching) {
    throw error;
  }

  if (!data || data.success?.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-lg border bg-content1 py-4 shadow-sm dark:border-none">
        <p className="font-bold">
          아직 당첨 내역이 없습니다.😔 <br />
          다음 회차를 기대해 주세요!
        </p>
      </div>
    );
  }

  const renderPensionNumbers = (number: string, ranking: number) => {
    const numberInt = number.split("");

    return numberInt.map((number, index) => (
      <div
        key={index}
        className="flex items-center justify-between text-center"
      >
        {index === 0 && ranking === 8 && (
          <span className="mr-1 text-sm sm:text-xl">각 조</span>
        )}
        <span
          key={index}
          className={`h-8 w-8 rounded-full border-2 border-[#ffffff] text-base font-bold xs:ml-1 sm:h-8 sm:w-8 sm:text-xl`}
          style={{ borderColor: pensionNumberBg(index) }}
        >
          {number}
        </span>
        {index === 0 && ranking !== 8 && (
          <span className="text-sm xs:ml-1 sm:text-xl">조</span>
        )}
      </div>
    ));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.success?.map((item, index) => {
        return (
          <div
            key={index}
            className="flex flex-col items-center gap-y-2 rounded-lg border bg-content1 px-4 py-2 shadow-sm dark:border-none"
          >
            <p className="text-lg font-bold">
              {item.ranking === 8 ? (
                <strong className="text-primary">보너스</strong>
              ) : (
                <>
                  <strong className="text-primary">{item.ranking} </strong>
                  <span>등</span>
                </>
              )}
            </p>

            <p className="font-bold">{item.draw_number} 회</p>

            <div className="flex px-1">
              {renderPensionNumbers(item.winning_number, item.ranking)}
            </div>

            <p className="whitespace-pre-wrap wrap-break-word text-xs">
              {formatDate(item.winning_created)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
