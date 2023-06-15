"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import lotto from "./components/lottie/lotto.json";

export default function Home() {
  const [aniNumber, setAniNumber] = useState([0, 0, 0, 0, 0, 0]);
  const [number, setNumber] = useState([
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12],
    [12, 13, 14, 15, 16, 17],
    [20, 21, 22, 23, 24, 25],
    [30, 31, 32, 33, 34, 35],
  ]);
  const [isAnimating, setAnimating] = useState(false);

  const animateNumber = () => {
    const animationDuration = 2000; // 애니메이션 진행 시간 (2초) (예시 값)
    const minNumber = 1;
    const maxNumber = 45;
    const framesPerSecond = 30; // 초당 프레임 수 (예시 값)
    const frameDuration = 1000 / framesPerSecond;
    const totalFrames = Math.ceil(animationDuration / frameDuration);
    let currentFrame = 0;

    const updateNumber = () => {
      const randomNumber = aniNumber.map(() => {
        return (
          Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
        );
      });

      setAniNumber(randomNumber);

      currentFrame++;

      if (currentFrame <= totalFrames) {
        requestAnimationFrame(updateNumber);
      } else {
        setAnimating(false);
        setAniNumber([1, 7, 15, 30, 38, 45]);
      }
    };

    requestAnimationFrame(updateNumber);
  };

  useEffect(() => {
    if (isAnimating) {
      animateNumber();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating]);

  const handleDrawClick = () => {
    if (!isAnimating) {
      setAnimating(true);
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
              isAnimating ? " bg-slate-50" : "bg-white "
            } rounded-2xl font-bold text-3xl`}
            onClick={handleDrawClick}
            disabled={isAnimating}
          >
            {isAnimating
              ? "당신의 당첨을 응원합니다!"
              : "당신의 번호를 뽑아보세요!"}
          </button>
          {!isAnimating &&
            number.map((row, rowIndex) => (
              <ul key={rowIndex} className="flex w-full justify-center gap-12">
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
    </section>
  );
}
