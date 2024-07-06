"use client";

import * as Sentry from "@sentry/nextjs";
import React, { useEffect, useRef, useState } from "react";
import Button from "../common/Button";
import Loader from "../common/Loader";
import { useMutation } from "@tanstack/react-query";
import { createLottoNumbers } from "@/libs/queries/lottoQueries";
import { useErrorModal } from "@/providers/ErrorModalProvider";
import Clipboard from "../ui/icons/Clipboard";
import { Tooltip } from "react-tooltip";
import ClipboardCheck from "../ui/icons/ClipboardCheck";
import { errorMessage } from "@/utils/errorMessages";
import { lottoNumberBg } from "@/utils/lottoNumberBg";

interface LottoGeneratorNumbers {
  lottoNumbers: {
    numbers: number[];
  }[];
}

export default function LottoGenerator() {
  const { showError } = useErrorModal();

  const {
    mutate,
    data: lottoData,
    isPending,
  } = useMutation({
    mutationFn: createLottoNumbers,
    onError: (error) => {
      Sentry.captureException(error);
      const { title, description, btnText } = errorMessage("1");
      showError({
        title: title,
        description: description,
        btnText: btnText,
      });
    },
  });

  const [repeatLotto, setRepeatLotto] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentLottoNumbers, setCurrentLottoNumbers] =
    useState<LottoGeneratorNumbers>({
      lottoNumbers: [{ numbers: [0, 0, 0, 0, 0, 0] }],
    });
  const dropDownData = [1, 2, 3, 4, 5];
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    if (lottoData) {
      try {
        const formattedData = lottoData.lottoNumbers
          .map((item, index) => `${index + 1}. [${item.numbers.join(", ")}]`)
          .join("\n");

        await navigator.clipboard.writeText(formattedData);

        setIsCopied(true);

        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }

        copyTimeoutRef.current = setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      } catch (error) {
        Sentry.captureException(error);
        const { title, description, btnText } = errorMessage("2");
        showError({
          title: title,
          description: description,
          btnText: btnText,
        });
      }
    }
  };

  const handleCreateNumbers = () => {
    const now = new Date();
    const options = { timeZone: "Asia/Seoul", hour12: false };
    const seoulTime = new Date(now.toLocaleString("en-US", options));

    const day = seoulTime.getDay();
    const hours = seoulTime.getHours();

    if (day === 6 && hours >= 20 && hours < 22) {
      Sentry.captureMessage("로또 번호 생성 시간이 아닙니다.", "info");
      const { title, description, btnText } = errorMessage("3");
      showError({
        title: title,
        description: description,
        btnText: btnText,
      });
    } else {
      mutate({ repeat: repeatLotto });
    }
  };

  const dropdownChangeHandler = (item: number) => {
    setRepeatLotto(item);
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    if (lottoData) {
      setCurrentLottoNumbers(lottoData);
    }
  }, [lottoData]);

  const renderLottoNumbers = (data: LottoGeneratorNumbers) => {
    return data.lottoNumbers.map((item, index) => (
      <div key={index} className="mt-3 flex justify-between">
        {item.numbers.map((subItem, subIndex) => (
          <div
            key={subIndex}
            className={`${lottoNumberBg(subItem)} flex h-9 w-9 items-center justify-center rounded-full p-2 sm:h-16 sm:w-16`}
          >
            <p
              className="text-sm font-bold text-white sm:text-3xl"
              style={{ textShadow: "0px 0px 3px rgba(73, 57, 0, .8)" }}
            >
              {subItem}
            </p>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-8 w-full max-w-lg rounded-xl border bg-content1 text-center shadow-md dark:border-none">
        <div className="px-5">
          <p className="mt-7 font-bold">로또 번호 생성 횟수를 선택하세요.</p>
          <div className="relative mb-7 mt-3 w-full max-w-lg text-left">
            <div>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                type="button"
                className="inline-flex w-full justify-between rounded-md border bg-white px-4 py-2 text-sm font-medium text-foreground shadow hover:bg-content1Hover focus:ring-primary dark:border-none dark:bg-black dark:hover:bg-content1Hover"
              >
                {repeatLotto}
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
              <div className="absolute right-0 mt-2 w-full origin-top-right rounded-md border bg-white shadow dark:border-none dark:bg-black">
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
          <ul>{renderLottoNumbers(currentLottoNumbers)}</ul>
        </div>

        <div className="mb-3 mt-7 h-[1px] w-full bg-content1Hover" />

        <div
          className={`mb-3 flex items-center justify-center ${lottoData && "justify-between px-5"}`}
        >
          <Button
            className={`text-sm sm:text-base ${
              isPending &&
              "cursor-progress brightness-90 hover:bg-primary dark:brightness-75"
            }`}
            disabled={isPending}
            onClick={() => {
              handleCreateNumbers();
            }}
          >
            <div className="flex items-center gap-2">
              <div>{isPending ? "생성 중..." : "번호 생성하기"}</div>
              {isPending && (
                <Loader className="h-[1rem] w-[1rem] border-primary1 border-t-white" />
              )}
            </div>
          </Button>

          {lottoData && (
            <button
              data-tooltip-id="tooltip"
              data-tooltip-content={isCopied ? "복사 완료" : "번호 복사"}
              onClick={() => {
                handleCopy();
              }}
            >
              <div className="flex items-center justify-center rounded-full border bg-background p-3 shadow hover:bg-content1Hover dark:border-none dark:hover:bg-content1Hover">
                {isCopied ? (
                  <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Clipboard className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
            </button>
          )}
        </div>
      </div>
      <Tooltip id="tooltip" className="custom-tooltip" />
    </div>
  );
}
