"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import useLottoGenerator from "@/hooks/useLottoGenerator";
import useLotto from "@/hooks/useLotto";
import Loader from "@/components/common/Loader";

export default function LottoGenerator() {
  const {
    data: lottoData,
    error: lottoError,
    isLoading: isLottoLoading,
    refetch: refetchLotto,
  } = useLotto();

  const {
    mutate,
    data: generatedLottoNumbers,
    error: generatedLottoError,
    isError: isGeneratedLottoError,
    isPending: isGeneratedLottoPending,
  } = useLottoGenerator();

  const [lottoCount, setLottoCount] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentLottoNumbers, setCurrentLottoNumbers] = useState([
    [0, 0, 0, 0, 0, 0],
  ]);
  const dropDownData = [1, 2, 3, 4, 5];

  const handleClick = () => {
    mutate({ count: lottoCount });
  };

  const dropdownChangeHandler = (item: number) => {
    setLottoCount(item);
    setIsDropdownOpen(!isDropdownOpen);
  };

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

  useEffect(() => {
    if (generatedLottoNumbers) {
      setCurrentLottoNumbers(generatedLottoNumbers.winning_numbers);
    }
  }, [generatedLottoNumbers]);

  const renderLottoNumbers = (numbers: number[][]) => {
    return numbers.map((item, index) => (
      <div key={index} className="flex justify-between">
        {item.map((subItem, subIndex) => (
          <div
            key={subIndex}
            className={`${lottoNumberBg(subItem)} mt-3 flex h-16 w-16 items-center justify-center rounded-full p-4 text-3xl font-bold`}
          >
            <span>{subItem}</span>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="mt-20 flex flex-col items-center justify-center">
      {true && (
        <div>
          {"예기치 않은 오류가 발생했습니다.\n나중에 다시 시도하십시오."
            .split("\n")
            .map((line, index) => (
              <p className="text-center" key={index}>
                {line}
              </p>
            ))}
          <Button
            onClick={() => {
              refetchLotto();
            }}
          >
            다시 시도
          </Button>
        </div>
      )}

      {!lottoError && (
        <p className="text-center text-2xl font-extrabold sm:text-4xl">
          <strong>{isLottoLoading ? 0 : lottoData?.draw_number} </strong>
          회차 <br /> 로또 6/45 번호 추첨
        </p>
      )}

      <div className="mt-8 w-full max-w-lg rounded-xl border bg-content1 text-center shadow-md dark:border-none">
        <div className="px-3">
          <p className="mt-7 font-bold">로또 번호 생성 횟수를 선택하세요.</p>
          <div className="relative mb-7 mt-3 w-full max-w-lg text-left">
            <div>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                type="button"
                className="inline-flex w-full justify-between rounded-md border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-content1Hover focus:ring-primary dark:border-none dark:bg-black dark:hover:bg-content1Hover"
              >
                {lottoCount}
                <svg
                  className={`-mr-1 ml-2 h-5 w-5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 transform" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06 0L10 10.94l3.71-3.73a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full origin-top-right rounded-md border bg-white dark:border-none dark:bg-black">
                <div className="p-2">
                  {dropDownData.map((item, index) => {
                    return (
                      <p
                        onClick={() => dropdownChangeHandler(item)}
                        key={index}
                        className="block rounded px-2 py-2 text-sm text-foreground hover:bg-content1Hover"
                        role="menuitem"
                      >
                        {item}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* {isGeneratedLottoError && <p>{generatedLottoError.message}</p>} */}
          {true && <p>에러 발생</p>}
          <ul>{renderLottoNumbers(currentLottoNumbers)}</ul>
        </div>

        <div className="mb-3 mt-7 h-[2px] w-full bg-content1Hover" />

        <Button
          className={`mb-3 text-sm sm:text-base ${isGeneratedLottoPending && "brightness-75 hover:bg-primary"}`}
          disabled={isGeneratedLottoPending}
          onClick={() => {
            handleClick();
          }}
        >
          <div className="flex items-center gap-2">
            <div>
              {isGeneratedLottoPending ? "추첨 중..." : "번호 추첨하기"}
            </div>
            {isGeneratedLottoPending && (
              <Loader className="h-4 w-4 border-4 border-primary1 border-t-white" />
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}
