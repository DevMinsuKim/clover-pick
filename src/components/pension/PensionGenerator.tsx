"use client";

import * as Sentry from "@sentry/nextjs";
import React, { useEffect, useRef, useState } from "react";
import Button from "../common/Button";
import Loader from "../common/Loader";
import { useMutation } from "@tanstack/react-query";
import { useErrorModal } from "@/providers/ErrorModalProvider";
import Clipboard from "../ui/icons/Clipboard";
import { Tooltip } from "react-tooltip";
import ClipboardCheck from "../ui/icons/ClipboardCheck";
import { errorMessage } from "@/utils/errorMessages";
import { pensionNumberBg } from "@/utils/pensionNumberBg";
import { pensionCreateNumberActions } from "@/server/pension/pensionCreateNumberActions";

export default function PensionGenerator() {
  const { showError } = useErrorModal();

  const {
    mutate,
    data: pensionData,
    isPending,
  } = useMutation({
    mutationFn: pensionCreateNumberActions,
    onError: (error) => {
      Sentry.captureException(error);
      const { title, description, btnText } = errorMessage("4");
      showError({
        title: title,
        description: description,
        btnText: btnText,
      });
    },
  });

  const [repeatPension, setRepeatPension] = useState(1);
  const [isAllGroup, setIsAllGroup] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPensionNumbers, setCurrentPensionNumbers] = useState([
    { number: "0000000" },
  ]);
  const dropDownData = [1, 2, 3, 4, 5];
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    if (pensionData) {
      try {
        const formattedData = currentPensionNumbers
          .map(({ number }, index) => {
            const trillionPart = number.charAt(0);
            const remainingPart = number.slice(1);
            return `${index + 1}. [${trillionPart}조 ${remainingPart}]`;
          })
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
        const { title, description, btnText } = errorMessage("5");
        showError({
          title: title,
          description: description,
          btnText: btnText,
        });
      }
    }
  };

  const handleAllGroup = () => {
    setIsAllGroup(!isAllGroup);
  };

  const handleCreateNumbers = () => {
    const now = new Date();
    const options = { timeZone: "Asia/Seoul", hour12: false };
    const seoulTime = new Date(now.toLocaleString("en-US", options));

    const day = seoulTime.getDay();
    const hours = seoulTime.getHours();

    if (day === 4 && hours >= 17 && hours < 24) {
      Sentry.captureMessage("연금복권 번호 생성 시간이 아닙니다.", "info");
      const { title, description, btnText } = errorMessage("6");
      showError({
        title: title,
        description: description,
        btnText: btnText,
      });
    } else {
      mutate({ repeat: repeatPension, isAllGroup: isAllGroup });
    }
  };

  const dropdownChangeHandler = (item: number) => {
    setRepeatPension(item);
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    if (pensionData) {
      setCurrentPensionNumbers(pensionData.success);
    }
  }, [pensionData]);

  const renderPensionNumbers = (numbers: { number: string }[]) => {
    const numberInt = numbers.map((item) => {
      return {
        number: item.number.split(""),
      };
    });

    return numberInt.map((number, index) => (
      <div key={index} className="mt-4 flex items-center justify-between">
        {number.number.map((subNumber, subIndex) => (
          <>
            <span
              key={subIndex}
              className={`h-8 w-8 rounded-full border-2 border-[#ffffff] text-base font-bold sm:h-11 sm:w-11 sm:text-3xl`}
              style={{ borderColor: pensionNumberBg(subIndex) }}
            >
              {subNumber}
            </span>
            {subIndex === 0 && <span className="text-sm sm:text-xl">조</span>}
          </>
        ))}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-8 w-full max-w-lg rounded-xl border bg-content1 text-center shadow-md dark:border-none">
        <div className="px-5">
          <p className="mt-7 font-bold">
            연금복권 번호 생성 횟수를 선택하세요.
          </p>
          <div className="relative mb-7 mt-3 w-full max-w-lg text-left">
            <div>
              <button
                disabled={isAllGroup}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                type="button"
                className="inline-flex w-full justify-between rounded-md border bg-white px-4 py-2 text-sm font-medium text-foreground shadow hover:bg-content1Hover focus:ring-primary disabled:opacity-40 disabled:hover:bg-white dark:border-none dark:bg-black dark:hover:bg-content1Hover disabled:hover:dark:bg-black"
              >
                {repeatPension}
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
              <div className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md border bg-white shadow dark:border-none dark:bg-black">
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

          <div className="mb-6 rounded-xl border bg-background p-4 text-left shadow dark:border-none">
            <p className="font-bold">모든 조를 선택하시겠습니까?</p>
            <p className="text-xs sm:text-sm">
              - 모든 조를 선택하시면 1등과 2등 동시 당첨될 수 있습니다.
            </p>
            <p className="text-xs sm:text-sm">
              - 이 기능을 원하시면 아래 버튼을 눌러 활성화하시고, 번호 생성하기
              버튼을 클릭해주세요.
            </p>
            <p className="text-xs sm:text-sm">
              - 단, 해당 회차에서 당첨될 경우 1등과 2등 동시 당첨될 수 있다는
              것이며, 선택한다고 무조건 당첨되거나 당첨 확률이 증가하는 것은
              아닙니다.
            </p>
            <div
              className={`${
                isAllGroup ? "bg-primary" : "bg-gray-300 dark:bg-gray-500"
              } mt-4 flex h-6 w-10 cursor-pointer items-center rounded-full p-1`}
              onClick={() => {
                handleAllGroup();
              }}
            >
              <div
                className={`h-5 w-5 transform rounded-full bg-white shadow-md ${
                  isAllGroup ? "translate-x-3" : ""
                } transition`}
              />
            </div>
          </div>

          <ul>{renderPensionNumbers(currentPensionNumbers)}</ul>
        </div>

        <div className="mb-3 mt-7 h-[1px] w-full bg-content1Hover" />

        <div
          className={`mb-3 flex items-center justify-center ${pensionData && "justify-between px-5"}`}
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

          {pensionData && (
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
