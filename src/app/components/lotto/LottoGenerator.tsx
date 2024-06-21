"use client";

import React, { useState } from "react";
import Button from "../common/Button";
import useLottoGenerator from "../../hooks/useLottoGenerator";
import useLotto from "../../hooks/useLotto";

export default function LottoGenerator() {
  const {
    data: lottoData,
    error: lottoError,
    isError: isLottoError,
    isLoading: isLottoLoading,
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
  const dropDownData = [1, 2, 3, 4, 5];
  const initialLottoNumbers = [[0, 0, 0, 0, 0, 0]];

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
      {isLottoError && (
        <div>
          {lottoError.message.split("\n").map((line, index) => (
            <p className="text-center" key={index}>
              {line}
            </p>
          ))}
        </div>
      )}
      {!isLottoError && (
        <p className="text-center text-2xl font-extrabold sm:text-4xl">
          <strong>{isLottoLoading ? 0 : lottoData?.draw_number} </strong>
          회차 <br /> 로또 6/45 번호 추첨
        </p>
      )}

      <div className="mt-8 w-full max-w-lg rounded-xl bg-divider px-5 py-3 text-center">
        <p className="font-bold">로또 번호 생성 횟수를 선택하세요</p>
        <div className="relative mt-3 w-full max-w-lg text-left">
          <div>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              type="button"
              className="hover:bg-content1Hover inline-flex w-full justify-between rounded-md border bg-white px-4 py-2 text-sm font-medium text-foreground focus:ring-primary dark:border-none dark:bg-black"
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
                      className="hover:bg-content1Hover block rounded px-2 py-2 text-sm text-foreground"
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

        {isGeneratedLottoError && <p>{generatedLottoError.message}</p>}
        {isGeneratedLottoPending && <p>로딩중...</p>}
        {!generatedLottoNumbers && !isGeneratedLottoPending && (
          <ul>{renderLottoNumbers(initialLottoNumbers)}</ul>
        )}

        {generatedLottoNumbers && (
          <ul>
            <ul>{renderLottoNumbers(generatedLottoNumbers.winning_numbers)}</ul>
          </ul>
        )}

        <Button
          className="mt-10"
          onclick={() => {
            handleClick();
          }}
        >
          번호 추첨하기
        </Button>
      </div>
    </div>
  );
}
