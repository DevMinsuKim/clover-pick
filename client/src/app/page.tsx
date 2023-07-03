"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { AiOutlineDown } from "react-icons/Ai";
import { BsFillCheckCircleFill } from "react-icons/bs";
import React from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [aniNumber, setAniNumber] = useState([[0, 0, 0, 0, 0, 0]]);
  const [roundNumber, setRoundNumber] = useState([
    { circuit: 0, number: [0, 0, 0, 0, 0, 0, 0] },
  ]);

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
    const minNumber = 1;
    const maxNumber = 45;
    let currentFrame = 0;
    let isLoading = false;

    const updateNumber = () => {
      const randomNumbers = Array.from({ length: aniNumber.length }, () =>
        Array.from(
          { length: aniNumber[0].length },
          () =>
            Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
        )
      );

      setAniNumber(randomNumbers);

      currentFrame++;

      if (isLoading) {
        requestAnimationFrame(updateNumber);
      } else {
        setAniNumber(data.numbers);
      }
    };

    setIsLoading(true);
    isLoading = true;
    updateNumber();
    const data = await getLottoNumbers();
    isLoading = false;
    setIsLoading(false);
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

  return (
    <section>
      <div
        className={
          "relative flex flex-col w-full h-screen bg-gradient-to-t from-indigo-600  via-indigo-100 to-white dark:bg-gradient-to-t dark:from-indigo-900 items-center"
        }
      >
        <p className="text-5xl text-center font-bold mt-48">
          로또 번호 예측, 최고의 선택 <br /> LSTM 기반 로또 6/45
        </p>
        <p className="text-2xl text-center mt-14">
          인공지능 신경망 LSTM의 힘을 결합한 우리의 시스템은 로또 번호 예측의
          새로운 경지를 엽니다. <br /> 더 이상의 추측이 아닌, 데이터 기반의
          정확한 예측으로 당신의 로또 경험을 혁신시켜줍니다. <br /> 로또의
          미래를 함께 만들어 가요
        </p>

        <button
          className="bg-indigo-600 text-white rounded-2xl p-4 mt-20 text-2xl hover:bg-indigo-500 hover:shadow-xl"
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          당신의 로또 번호를 예측해보세요!
        </button>

        <button
          className="absolute flex flex-col items-center justify-center bottom-3"
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <div className="flex w-8 h-16 border-white border-solid border-2 border-radius rounded-2xl items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-white animate-scrollDownDot" />
          </div>
          <AiOutlineDown
            className="animate-scrollDownArrow mt-2 text-white"
            size={"1.25rem"}
          />
        </button>
      </div>

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
                  rowIndex === 1 ? "bg-indigo-950" : "bg-indigo-900"
                }`}
              >
                {row[0] !== 0 && (
                  <BsFillCheckCircleFill
                    className={` self-center cursor-pointer ${
                      rowIndex === 1 ? "text-indigo-600" : "text-slate-300"
                    }`}
                    size={"2rem"}
                  />
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
