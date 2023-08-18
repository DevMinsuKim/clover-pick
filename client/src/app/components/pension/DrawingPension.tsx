import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { LuFileInput } from "react-icons/lu";
import { MdCopyAll } from "react-icons/md";
import NumberBgSelect, { IndexBgSelect } from "../common/NumberBgSelect";
import AlertModal from "../modal/AlertModal";
import { isDesktop } from "react-device-detect";
import axios from "axios";
import ActionModal from "../modal/ActionModal";

interface NumberSet {
  numbers: number[];
  clicked: boolean;
}

const DrawingPension = forwardRef<HTMLDivElement>(function Drawing(props, ref) {
  const [noSelect, setNoSelect] = useState(false);
  const [clipboard, setClipboard] = useState(false);
  const [error, setError] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [alertMdoal, setAlertModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aniNumber, setAniNumber] = useState([
    {
      numbers: [0, 0, 0, 0, 0, 0, 0],
      clicked: false,
    },
  ]);
  const [firstLottery, setFirstLottery] = useState(true);
  const [generatePercent, setGeneratePercent] = useState(0);
  const [iconSize, setIconSize] = useState("1rem");

  const alertMdoalHandler = () => {
    setAlertModal(!alertMdoal);
    if (error) setError(false);
    if (clipboard) setClipboard(false);
    if (noSelect) setNoSelect(false);
  };

  const actionModalHandler = () => {
    setActionModal(!actionModal);
  };

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth;

      if (width < 330) setIconSize("1rem");
      else if (width < 425) setIconSize("1rem");
      else if (width < 576) setIconSize("1rem");
      else if (width < 768) setIconSize("1.5rem");
      else if (width < 1024) setIconSize("2rem");
      else if (width < 1440) setIconSize("2rem");
      else setIconSize("2rem");
    };

    checkSize();

    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const getPensionNumbers = (): Promise<NumberSet[]> => {
    return new Promise((resolve, reject) => {
      try {
        const eventSource = new EventSource(
          `${process.env.NEXT_PUBLIC_API_URL}/pension`
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.percent === 100) {
            eventSource.close();

            const updatedData = data.numbers.map((numbersArray: number[]) => {
              return { numbers: numbersArray, clicked: false };
            });

            resolve(updatedData);
            setGeneratePercent(data.percent);
          } else {
            setGeneratePercent(data.percent);
          }
        };

        eventSource.onerror = (event) => {
          eventSource.close();
          reject(
            new Error(
              "연금복권 생성에 오류가 발생했습니다. 다시 시도하여 주시기 바랍니다."
            )
          );
        };
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  };

  const animateNumber = async () => {
    const minNumber = 1;
    const maxNumber = 9;
    let isLoading = true;

    const updateNumber = () => {
      if (isLoading) {
        const randomNumbers = Array.from({ length: aniNumber.length }, () =>
          Array.from(
            { length: aniNumber[0].numbers.length },
            () =>
              Math.floor(Math.random() * (maxNumber - minNumber + 1)) +
              minNumber
          )
        ).map((numbers) => ({ numbers, clicked: false }));

        setAniNumber(randomNumbers);
        requestAnimationFrame(updateNumber);
      }
    };

    setIsLoading(true);
    setGeneratePercent(0);
    setFirstLottery(false);
    updateNumber();

    try {
      const data = await getPensionNumbers();
      isLoading = false;
      setIsLoading(false);
      setAniNumber(data);
    } catch (err) {
      console.error(err);
    }
  };

  const generationPension = async () => {
    if (!isLoading) {
      animateNumber();
    }
  };

  const checkboxChangeHandler = (index: number) => {
    setAniNumber(
      aniNumber.map((item, idx) =>
        idx === index ? { ...item, clicked: !item.clicked } : item
      )
    );
  };

  const autoInput = async () => {
    const selectedNumbers = aniNumber
      .filter((row) => row.clicked)
      .map((row) => row.numbers);

    try {
      await axios.post(
        `/api/pension-auto-selector`,
        JSON.stringify(selectedNumbers),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return actionModalHandler();
    } catch (err) {
      alertMdoalHandler();
      setError(true);
    }
  };

  const autoInputHandler = () => {
    if (isDesktop) {
      const hasSelection = aniNumber.some((row) => row.clicked);
      if (!hasSelection) {
        setNoSelect(true);
        setAlertModal(true);
      } else {
        actionModalHandler();
      }
    } else {
      alertMdoalHandler();
    }
  };

  const copyToClipboard = useCallback(() => {
    const hasSelection = aniNumber.some((row) => row.clicked);
    if (!hasSelection) {
      setNoSelect(true);
      setAlertModal(true);
    } else {
      const selectedNumbers = aniNumber
        .filter((row) => row.clicked)
        .map((row) => row.numbers);

      const formattedText = selectedNumbers
        .map((numbers) => {
          const [firstNum, ...restNums] = numbers;
          return `(${firstNum}조, ${restNums.join(", ")})`;
        })
        .join(", ");

      navigator.clipboard.writeText(formattedText);

      setAlertModal(true);
      setClipboard(true);
    }
  }, [aniNumber]);

  return (
    <div
      className="flex bg-gray-100 dark:bg-slate-800 items-center justify-center scroll-mt-16"
      ref={ref}
    >
      <div className="flex flex-col rounded-3xl items-center animate-generationPensionBg bg-indigo-600 my-28 xl:my-64 xl:max-w-xl 2xl:max-w-3xl 3xl:max-w-5xl">
        {aniNumber.map((row, rowIndex) =>
          isLoading && rowIndex !== 0 ? null : (
            <ul
              key={rowIndex}
              onClick={() => checkboxChangeHandler(rowIndex)}
              className={`flex justify-center rounded-full gap-1 px-2 md:gap-3 md:px-4 xl:gap-3 xl:px-6 mx-2 mt-2 xl:mt-4 2xl:mt-6 ${
                row.clicked ? "bg-indigo-950" : "bg-indigo-900"
              }`}
            >
              {row.numbers[0] !== 0 && !isLoading && (
                <div className={"flex items-center"}>
                  <input
                    type={"checkbox"}
                    className={"hidden"}
                    checked={row.clicked}
                    onChange={() => {}}
                  />
                  <BsFillCheckCircleFill
                    className={`cursor-pointer${
                      row.clicked ? "text-indigo-600" : "text-slate-300"
                    }`}
                    size={iconSize}
                  />
                </div>
              )}
              {row.numbers.map((number, columnIndex) => (
                <>
                  <li
                    key={columnIndex}
                    className={`flex rounded-full items-center justify-center my-2 w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 xl:w-12 xl:h-12 2xl:w-16 2xl:h-16 text-white font-bold text-xl md:text-2xl xl:text-3xl 2xl:text-4xl ${IndexBgSelect(
                      columnIndex
                    )}`}
                  >
                    {number}
                  </li>
                  <li
                    className={`${
                      columnIndex !== 0 && "hidden"
                    } flex rounded-full items-center justify-center my-2 w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 xl:w-12 xl:h-12 2xl:w-16 2xl:h-16
                    } font-bold text-xl md:text-2xl xl:text-3xl 2xl:text-4xl bg-white text-indigo-600`}
                  >
                    조
                  </li>
                </>
              ))}
            </ul>
          )
        )}

        <div
          className={`text-indigo-600 p-3 my-2 xl:my-6
             ${!isLoading && !firstLottery && " bg-white"}
             rounded-2xl font-bold`}
        >
          {!isLoading && !firstLottery && (
            <div className="flex flex-row mb-5 justify-between">
              <button
                className="flex-row flex bg-indigo-600 text-white rounded-2xl p-3 text-xs sm:text-sm xl:text-base 2xl:text-lg items-center justify-center "
                onClick={autoInputHandler}
              >
                <LuFileInput className="mr-1" />
                선택한 번호 자동입력
              </button>
              <p className="text-2xl self-center">|</p>
              <button
                className="flex-row flex bg-indigo-600 text-white rounded-2xl p-3 text-xs sm:text-sm xl:text-base 2xl:text-lg items-center justify-center"
                onClick={copyToClipboard}
              >
                <MdCopyAll className="mr-1" /> 선택한 번호 복사
              </button>
            </div>
          )}

          <button
            className={`relative w-full rounded-2xl p-2 ${
              isLoading
                ? "bg-white"
                : firstLottery
                ? "bg-white"
                : "bg-indigo-600 text-white"
            }`}
            onClick={generationPension}
            disabled={isLoading}
          >
            <div
              className={`absolute top-0 left-0 h-full bg-indigo-200 rounded-2xl transition-all duration-400 ease-in-out ${
                generatePercent === 100 && "hidden"
              }`}
              style={{ width: `${generatePercent}%` }}
            />
            <span className="relative z-10 text-sm sm:text-base xl:text-lg 2xl:text-2xl">
              {isLoading
                ? "당신의 당첨을 응원합니다!"
                : firstLottery
                ? "당신의 번호를 뽑아보세요!"
                : "다시 뽑아보세요!"}
            </span>
          </button>
        </div>
      </div>
      {actionModal && (
        <ActionModal onClose={actionModalHandler} onRun={autoInput}>
          <p className="px-4 text-center font-bold text-xs sm:text-sm md:text-base xl:text-lg mb-4">
            번호 자동입력 안내
          </p>
          <p className="px-4 text-center text-xs sm:text-sm md:text-base xl:text-lg mb-2">
            해당 기능은 모바일에서 이용할 수 없으며, PC 브라우저에서 진행하셔야
            합니다.
          </p>
          <p className="px-4 text-center text-xs sm:text-sm md:text-base xl:text-lg mb-2">
            1. 아래 확인 버튼을 누르시면 자동으로 동행복권 사이트로 이동합니다.{" "}
            <br />
            2. 회원가입 또는 로그인을 진행하시면 선택한 번호가 자동으로
            입력됩니다. <br />
            3. 자동 기입된 번호가 맞는지 확인하시고, 본인이 구매 버튼을 누른 후
            정상적으로 구매가 이루어졌는지 확인합니다.
          </p>
          <p className="px-4 text-center text-xs sm:text-sm md:text-base xl:text-lg mb-2">
            <br /> 모든 과정에서 입력하신 정보는 저희 측에서 보관하지 않습니다.
          </p>
          <p className="px-4 text-center text-xs sm:text-sm md:text-base xl:text-lg">
            위 내용을 확인하셨다면, 아래 확인 버튼을 눌러주세요.
          </p>
        </ActionModal>
      )}
      {alertMdoal && (
        <AlertModal onClose={alertMdoalHandler}>
          {error && (
            <p className="px-4 text-center font-bold text-xs sm:text-sm md:text-base xl:text-lg">
              작업 중인 창을 닫았거나 다른 이유로 현재 요청을 처리할 수
              없습니다. <br />
              잠시 후에 다시 시도해 주세요.
            </p>
          )}
          {clipboard && (
            <p className="px-4 text-center font-bold text-xs sm:text-sm md:text-base xl:text-lg">
              클립보드에 복사가 완료되었습니다.
            </p>
          )}
          {noSelect && (
            <p className="px-4 text-center font-bold text-xs sm:text-sm md:text-base xl:text-lg">
              선택한 번호가 없습니다. <br />
              번호를 선택하신 후 다시 시도해주세요.
            </p>
          )}
          {!isDesktop && !error && !clipboard && !noSelect ? (
            <p className="px-4 text-center font-bold text-xs sm:text-sm md:text-base xl:text-lg">
              죄송합니다! <br /> 현재 해당 기능은 모바일에서 이용하실 수
              없습니다.
              <br /> 더 나은 사용자 경험을 위해 <br className="sm:hidden" />
              PC 브라우저를 이용해주세요.
              <br />
              감사합니다!
            </p>
          ) : null}
        </AlertModal>
      )}
    </div>
  );
});

export default DrawingPension;
