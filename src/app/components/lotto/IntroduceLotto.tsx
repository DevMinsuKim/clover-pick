import React, { RefObject } from "react";
import { AiOutlineDown } from "react-icons/ai";

type IntroduceLottoProps = {
  targetRef: RefObject<HTMLElement>;
};

export default function IntroduceLotto({ targetRef }: IntroduceLottoProps) {
  const scrollMove = () => {
    const target = targetRef.current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={
        "relative flex flex-col w-full items-center dark:bg-slate-950 h-screen"
      }
    >
      <p className="text-2xl md:text-3xl lg:text-5xl text-center font-bold mt-28 xl:mt-72 dark:text-white">
        로또 번호 예측, 최고의 선택 <br /> LSTM 기반 로또 6/45
      </p>
      <p className="w-4/5 text-sm sm:text-base md:text-lg lg:text-xl text-center mt-14 dark:text-white">
        인공지능 신경망 LSTM의 힘을 결합한 <br className="lg:hidden" /> 우리의
        시스템은 로또 번호 <br className="3xl:hidden" />
        예측의 새로운 경지를 엽니다. <br />더 이상의 추측이 아닌, 데이터 기반의{" "}
        <br className="lg:hidden" />
        정확한 예측으로 <br />
        당신의 로또 경험을 혁신시켜줍니다. <br />
        로또의 미래를 함께 만들어 가요
      </p>

      <button
        className="p-3 mt-20 text-lg xl:text-2xl bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 hover:shadow-xl"
        onClick={scrollMove}
      >
        당신의 로또 번호를 예측해보세요!
      </button>

      <button
        className="absolute flex flex-col items-center justify-center bottom-3"
        onClick={scrollMove}
      >
        <div className="flex w-5 h-10 xl:w-7 xl:h-14 border-black dark:border-white border-solid border-2 border-radius rounded-2xl items-center justify-center">
          <span className="w-2 h-2 xl:w-3 xl:h-3 rounded-full bg-black dark:bg-white animate-scrollDownDot" />
        </div>
        <AiOutlineDown className="animate-scrollDownArrow mt-2 text-black dark:text-white" />
      </button>
    </div>
  );
}
