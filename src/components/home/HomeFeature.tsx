"use client";

import React from "react";
import { DotLottiePlayer, Controls } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";

export default function HomeFeature() {
  return (
    <div className="mx-auto mt-52 max-w-screen-xl px-6">
      <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between">
        <div className="mb-6 sm:mb-0">
          <p className="text-3xl font-bold sm:text-6xl">
            로또, 연금복권 <br /> AI로 편리하게
          </p>
          <p className="mt-12 text-xl font-bold sm:text-2xl">
            부담없이 무료로 쉽고 빠르게 생성해보세요!
          </p>
        </div>

        <div className="h-[50%] w-[50%]">
          <DotLottiePlayer src="/lottie/ai.lottie" autoplay loop />
        </div>
      </div>

      <div className="mt-52 flex flex-col items-center justify-center text-center sm:text-left">
        <p className="text-2xl font-bold sm:text-5xl">
          다음 기능들이 곧 추가됩니다.
        </p>
        <p className="mt-12 text-xl font-bold sm:text-2xl">
          빠른 시일 내에 만나보실 수 있도록 최선을 다하고 있어요.
        </p>

        <div className="mt-10 flex w-full flex-col items-center justify-center md:flex-row md:items-stretch md:gap-12 lg:gap-32">
          <div className="flex w-full max-w-[360px] flex-col items-center justify-center rounded-xl border bg-content1 px-4 py-6 text-center shadow dark:border-none">
            <div className="max-h-[100px] max-w-[100px] rounded-xl bg-primaryHover sm:max-h-[150px] sm:max-w-[150px]">
              <DotLottiePlayer src="/lottie/calculator.lottie" autoplay loop />
            </div>
            <p className="mt-7 text-xl font-bold">당첨금 실수령액 계산기</p>
            <p className="mt-3 text-base">
              축하합니다! 당첨 금액을 알려주세요.
              <br />
              세금을 제외한 실 수령액을 빠르게 알려드릴게요.
            </p>
          </div>

          <div className="mt-5 flex w-full max-w-[360px] flex-col items-center justify-center rounded-xl border bg-content1 px-4 py-6 text-center shadow dark:border-none md:mt-0">
            <div className="max-h-[100px] max-w-[100px] rounded-xl bg-primaryHover sm:max-h-[150px] sm:max-w-[150px]">
              <DotLottiePlayer src="/lottie/analysis.lottie" autoplay loop />
            </div>
            <p className="mt-7 text-xl font-bold">당첨 통계 분석</p>
            <p className="mt-3 text-base">
              당첨 번호의 패턴을 분석하고, <br />
              최신 통계 정보를 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
