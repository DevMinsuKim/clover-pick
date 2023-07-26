import React, { forwardRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { LuFileInput } from "react-icons/lu";
import { MdCopyAll } from "react-icons/md";
import LottoBgSelect from "../common/LottoBgSelect";
import AlertModal from "../modal/AlertModal";
import { isDesktop } from "react-device-detect";

type LottoNumbersResponse = {
  numbers: number[][];
};

const DrawingLotto = forwardRef<HTMLDivElement>(function Drawing(props, ref) {
  const [alertMdoal, setAlertModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aniNumber, setAniNumber] = useState([[0, 0, 0, 0, 0, 0]]);
  const [checkBoxNumber, setCheckBoxNumber] = useState([false]);
  const [firstLottery, setFirstLottery] = useState(true);
  const [generatePercent, setGeneratePercent] = useState(0);
  const [iconSize, setIconSize] = useState("1rem");

  const alertMdoalHandler = () => {
    setAlertModal(!alertMdoal);
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

  const getLottoNumbers = (): Promise<LottoNumbersResponse> => {
    return new Promise((resolve, reject) => {
      try {
        const eventSource = new EventSource(
          `${process.env.NEXT_PUBLIC_API_URL}/lotto`
        );

        eventSource.onmessage = (event) => {
          console.log(event.data);
          const data = JSON.parse(event.data);
          if (data.percent === 100) {
            eventSource.close();
            resolve({ numbers: data.numbers });
            setGeneratePercent(data.percent);
          } else {
            setGeneratePercent(data.percent);
          }
        };

        eventSource.onerror = (event) => {
          eventSource.close();
          reject(
            new Error(
              "로또 생성에 오류가 발생했습니다. 다시 시도하여 주시기 바랍니다."
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
    const maxNumber = 45;
    let isLoading = true;

    const updateNumber = () => {
      if (isLoading) {
        const randomNumbers = Array.from({ length: aniNumber.length }, () =>
          Array.from(
            { length: aniNumber[0].length },
            () =>
              Math.floor(Math.random() * (maxNumber - minNumber + 1)) +
              minNumber
          )
        );
        setAniNumber(randomNumbers);
        requestAnimationFrame(updateNumber);
      }
    };

    setIsLoading(true);
    setGeneratePercent(0);
    setFirstLottery(false);
    updateNumber();
    setCheckBoxNumber([false]);

    try {
      const data = await getLottoNumbers();
      isLoading = false;
      setIsLoading(false);
      setAniNumber(data.numbers);
      setCheckBoxNumber(Array(data.numbers.length).fill(false));
    } catch (err) {
      console.error(err);
    }
  };

  const generationClick = async () => {
    if (!isLoading) {
      animateNumber();
    }
  };

  const handleCheckboxChange = (index: number) => {
    setCheckBoxNumber((prevCheckboxes) =>
      prevCheckboxes.map((isChecked, i) =>
        i === index ? !isChecked : isChecked
      )
    );
  };

  const autoInput = () => {
    if (isDesktop) {
      console.log("PC입니다.");
    } else {
      alertMdoalHandler();
      console.log("모바일입니다.");
    }
  };

  return (
    <div
      className="flex bg-gray-100 dark:bg-slate-800 items-center justify-center scroll-mt-16"
      ref={ref}
    >
      <div className="flex flex-col rounded-3xl items-center animate-generationLottoBg bg-indigo-600 my-28 xl:my-64 xl:max-w-xl 2xl:max-w-3xl 3xl:max-w-5xl">
        {aniNumber.map((row, rowIndex) =>
          isLoading && rowIndex !== 0 ? null : (
            <ul
              key={rowIndex}
              className={`flex justify-center rounded-full gap-4 px-4 md:gap-6 md:px-4 xl:gap-8 xl:px-6 mx-2 mt-2 xl:mt-4 2xl:mt-6 ${
                checkBoxNumber[rowIndex] ? "bg-indigo-950" : "bg-indigo-900"
              }`}
            >
              {row[0] !== 0 && !isLoading && (
                <label key={rowIndex} className={"flex"}>
                  <input
                    type={"checkbox"}
                    onChange={() => handleCheckboxChange(rowIndex)}
                    className={"hidden"}
                  />

                  <BsFillCheckCircleFill
                    className={`self-center cursor-pointer ${
                      checkBoxNumber[rowIndex]
                        ? "text-indigo-600"
                        : "text-slate-300"
                    }`}
                    size={iconSize}
                  />
                </label>
              )}
              {row.map((number, columnIndex) => (
                <li
                  key={columnIndex}
                  className={`flex rounded-full items-center justify-center my-2 w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 xl:w-12 xl:h-12  2xl:w-16 2xl:h-16 ${
                    number === 0 ? "text-indigo-600 " : "text-white"
                  } font-bold text-xl md:text-2xl xl:text-3xl 2xl:text-4xl ${LottoBgSelect(
                    number
                  )}`}
                >
                  {number}
                </li>
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
                onClick={autoInput}
              >
                <LuFileInput className="mr-1" />
                선택한 번호 자동 입력
              </button>
              <p className="text-2xl self-center">|</p>
              <button className="flex-row flex bg-indigo-600 text-white rounded-2xl p-3 text-xs sm:text-sm xl:text-base 2xl:text-lg items-center justify-center ">
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
            onClick={generationClick}
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
      {alertMdoal && (
        <AlertModal onClose={alertMdoalHandler}>
          <div className="font-bold text-lg">PC에서 이용해주세요</div>
        </AlertModal>
      )}
    </div>
  );
});

export default DrawingLotto;
