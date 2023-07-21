"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { AiOutlineDown } from "react-icons/Ai";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { LuFileInput } from "react-icons/lu";
import { MdCopyAll } from "react-icons/md";
import React from "react";
import IntroduceLotto from "./components/lotto/IntroduceLotto";

type LottoNumbersResponse = {
  numbers: number[][];
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [aniNumber, setAniNumber] = useState([[0, 0, 0, 0, 0, 0]]);
  const [roundNumber, setRoundNumber] = useState([
    { circuit: 0, number: [0, 0, 0, 0, 0, 0, 0] },
  ]);
  const [checkBoxNumber, setCheckBoxNumber] = useState([false]);
  const [firstLottery, setFirstLottery] = useState(true);
  const [generatePercent, setGeneratePercent] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRoundNumbers();
  }, []);

  const getRoundNumbers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/lotto/9`
      );
      return setRoundNumber(response.data);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

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

  const handleClick = async () => {
    if (!isLoading) {
      animateNumber();
    }
  };

  const lottoBgSelect = (number: number) => {
    let backgroundColor = "";

    if (number >= 1 && number <= 10) {
      backgroundColor = "bg-yellow-400";
    } else if (number >= 11 && number <= 20) {
      backgroundColor = "bg-blue-400";
    } else if (number >= 21 && number <= 30) {
      backgroundColor = "bg-red-400";
    } else if (number >= 31 && number <= 40) {
      backgroundColor = "bg-gray-400";
    } else if (number >= 41 && number <= 45) {
      backgroundColor = "bg-green-400";
    } else if (number === 0) {
      backgroundColor = "bg-white";
    }

    return backgroundColor;
  };

  const handleCheckboxChange = (index: number) => {
    setCheckBoxNumber((prevCheckboxes) =>
      prevCheckboxes.map((isChecked, i) =>
        i === index ? !isChecked : isChecked
      )
    );
  };

  return (
    <section>
      <IntroduceLotto targetRef={scrollRef} />

      <div
        className="flex bg-slate-100 items-center justify-center scroll-mt-16"
        ref={scrollRef}
      >
        <div className="flex flex-col bg-indigo-600 my-40 py-12 rounded-3xl items-center animate-generationLottoBg  bg-gradient-to-tr from-indigo-400 via-indigo-800 to-indigo-400 max-w-screen-xl">
          {aniNumber.map((row, rowIndex) =>
            isLoading && rowIndex !== 0 ? null : (
              <ul
                key={rowIndex}
                className={`flex justify-center gap-11 mx-72 p-4  rounded-full mt-8 ${
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
                      className={` self-center cursor-pointer ${
                        checkBoxNumber[rowIndex]
                          ? "text-indigo-600"
                          : "text-slate-300"
                      }`}
                      size={"2rem"}
                    />
                  </label>
                )}
                {row.map((number, columnIndex) => (
                  <li
                    key={columnIndex}
                    className={`flex w-20 h-20 rounded-full items-center justify-center ${
                      number === 0 ? "text-indigo-600 " : "text-white"
                    } font-bold text-5xl ${lottoBgSelect(number)}`}
                  >
                    {number}
                  </li>
                ))}
              </ul>
            )
          )}
          <div
            className={`text-indigo-600 p-3 mt-14
             ${!isLoading && !firstLottery && " bg-white"}
             rounded-2xl font-bold text-3xl`}
          >
            {!isLoading && !firstLottery && (
              <div className="flex flex-row mb-5 justify-between">
                <button className="flex-row flex bg-indigo-600 text-white rounded-2xl p-3 text-sm items-center justify-center ">
                  <LuFileInput className="mr-1" />
                  선택한 번호 자동 입력
                </button>
                <p className="text-2xl self-center">|</p>
                <button className="flex-row flex bg-indigo-600 text-white rounded-2xl p-3 text-sm items-center justify-center ">
                  <MdCopyAll className="mr-1" /> 선택한 번호 복사
                </button>
              </div>
            )}

            <button
              className={`w-full rounded-2xl p-3 ${
                isLoading
                  ? "bg-gradient-to-r from-white from-0% via-indigo-900 via-50% to-white to-100% text-white"
                  : firstLottery
                  ? "bg-white"
                  : "bg-indigo-600 text-white"
              }`}
              onClick={handleClick}
              disabled={isLoading}
            >
              <span className="z-10 ">
                {isLoading
                  ? "당신의 당첨을 응원합니다!"
                  : firstLottery
                  ? "당신의 번호를 뽑아보세요!"
                  : "다시 뽑아보세요!"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-ull bg-slate-100 mt-8 justify-center items-center">
        <div className="mb-8 w-full max-w-screen-xl">
          <p className="text-xl font-bold my-6">지난 회차 번호</p>
          <div className="grid grid-flow-row grid-cols-3 gap-4 ">
            {roundNumber.map((row, rowIndex) => (
              <ul key={rowIndex}>
                {rowIndex === 8 ? (
                  <li className="bg-indigo-600 rounded-3xl h-full">
                    <button className="flex text-white h-full w-full text-xl font-bold items-center justify-center">
                      <FaPlus className="mr-2" color="white" />
                      더보기
                    </button>
                  </li>
                ) : (
                  <li className="flex flex-col relative bg-indigo-600 rounded-3xl">
                    <span className="flex absolute bg-white text-indigo-600 font-bold rounded-3xl ml-3 mt-2 p-2">
                      {row.circuit} 회차
                    </span>

                    <div className="flex mt-16 mx-5 mb-2 justify-between">
                      {row.number.map((number, columnIndex) => (
                        <React.Fragment key={columnIndex}>
                          <div
                            key={columnIndex}
                            className={`flex w-10 h-10 rounded-full items-center justify-center ${
                              number === 0 ? "text-indigo-600" : "text-white"
                            } ${lottoBgSelect(number)}`}
                          >
                            {number}
                          </div>
                          {columnIndex === 5 && (
                            <FaPlus
                              className="self-center mx-1"
                              color="white"
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
