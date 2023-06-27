"use client";
import { useState } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import React from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [aniNumber, setAniNumber] = useState([0, 0, 0, 0, 0, 0]);
  const [number, setNumber] = useState([[]]);
  const [circuitNumber, setCircuitNumber] = useState([
    {
      circuit: "1090",
      number: [1, 11, 21, 31, 42, 5, 16],
    },
    {
      circuit: "1089",
      number: [1, 11, 21, 31, 42, 5, 16],
    },
    {
      circuit: "1088",
      number: [1, 11, 21, 31, 42, 5, 16],
    },
    {
      circuit: "1087",
      number: [1, 11, 21, 31, 42, 5, 16],
    },
    {
      circuit: "1086",
      number: [1, 11, 21, 31, 42, 5, 16],
    },
    {
      circuit: "1085",
      number: [1, 11, 21, 31, 42, 5, 16],
    },
    {
      circuit: "1084",
      number: [1, 11, 21, 31, 42, 5, 16],
    },
    {
      circuit: "1083",
      number: [1, 11, 21, 31, 42, 5, 16],
    },
  ]);

  const getLottoNumbers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/lotto`
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const animateNumber = async () => {
    // const animationDuration = 2000;
    const minNumber = 1;
    const maxNumber = 45;
    // const framesPerSecond = 30;
    // const frameDuration = 1000 / framesPerSecond;
    // const totalFrames = Math.ceil(animationDuration / frameDuration);
    let currentFrame = 0;
    let isLoading = false;

    const updateNumber = () => {
      const randomNumbers = Array.from(
        { length: aniNumber.length },
        () =>
          Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
      );

      setAniNumber(randomNumbers);

      currentFrame++;

      if (isLoading) {
        requestAnimationFrame(updateNumber);
      } else {
        setAniNumber(data.numbers[0]);
      }
    };

    setIsLoading(true);
    isLoading = true;
    updateNumber();
    const data = await getLottoNumbers();
    const [, ...remainingData] = data.numbers;
    setNumber(remainingData);
    isLoading = false;
    setIsLoading(false);
  };

  const handleClick = async () => {
    if (!isLoading) {
      animateNumber();
    }
  };

  const lottoBgSelect = (number: Number) => {
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

  return (
    <section className="flex w-full flex-col">
      <div
        className={
          "flex flex-col w-full h-[720px] bg-gradient-to-t from-indigo-100 dark:bg-gradient-to-t dark:from-indigo-900  items-center justify-center"
        }
      >
        <p className="text-5xl text-center font-bold">
          로또의 미래, <br /> LSTM 기반 로또 6/45 <br /> 예측 시스템
        </p>
        <p className="text-2xl text-center mt-14">
          인공지능 신경망 LSTM의 힘을 결합한 우리의 시스템은 로또 번호 예측의
          새로운 경지를 엽니다. <br /> 더 이상의 추측이 아닌, 데이터 기반의
          정확한 예측으로 당신의 로또 경험을 혁신시켜줍니다. <br /> 로또의
          미래를 함께 만들어 가요
        </p>
      </div>

      <div className="flex bg-slate-100 items-center justify-center">
        <div className="flex flex-col w-2/5 bg-indigo-600 my-40 py-12 rounded-3xl items-center">
          <ul className="flex w-full justify-center gap-12">
            {aniNumber.map((number, index) => {
              return (
                <li
                  key={index}
                  className={`flex w-20 h-20 rounded-full items-center justify-center ${
                    number === 0 ? "text-indigo-600 " : "text-white"
                  } font-bold text-5xl ${lottoBgSelect(number)}`}
                >
                  {number}
                </li>
              );
            })}
          </ul>
          <button
            className={`text-indigo-600 p-5 mt-14 ${
              isLoading ? " bg-slate-50" : "bg-white "
            } rounded-2xl font-bold text-3xl`}
            onClick={handleClick}
            disabled={isLoading}
          >
            {isLoading
              ? "당신의 당첨을 응원합니다!"
              : "당신의 번호를 뽑아보세요!"}
          </button>
          {!isLoading &&
            number.map((row, rowIndex) => (
              <ul
                key={rowIndex}
                className="flex w-full justify-center gap-12 mt-10"
              >
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
            ))}
        </div>
      </div>

      <div className="flex bg-slate-100 items-center justify-center mt-8">
        <div className="w-[1320px] mb-8">
          <p className="text-xl font-bold my-6">지난 회차 번호</p>
          <div className="grid grid-flow-row grid-cols-3 gap-4">
            {circuitNumber.map((row, rowIndex) => (
              <ul key={rowIndex}>
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
                          <FaPlus className="self-center mx-1" color="white" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </li>
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
