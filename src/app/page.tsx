import React from "react";
import BallMix from "./components/BallMix";
import Image from "next/image";
import ArrowUp from "./components/ui/icons/ArrowUp";
import UpDown from "./components/effect/UpDown";

export default function Home() {
  return (
    <section>
      <div className="relative flex w-full flex-col items-center justify-end md:flex-row">
        <h2 className="left-0 mt-28 text-4xl md:absolute md:text-5xl">
          클로버픽 AI가 선택한 번호, <br /> 최고의 행운을 당신에게!
        </h2>
        <div className="relative h-[30rem] w-auto">
          <BallMix />
          <div className="absolute bottom-[5%] left-1/2 w-full -translate-x-1/2 transform">
            <div className="flex flex-col items-center justify-center">
              <Image
                priority
                src={"/images/pattern.png"}
                alt="pattern"
                width={1920}
                height={1080}
                className="absolute opacity-10 dark:opacity-5"
              />
              <UpDown>
                <div className="rounded-full bg-content1 p-3 shadow">
                  <ArrowUp />
                </div>
              </UpDown>
              <div className="flex items-center justify-center rounded-xl bg-content1 px-3 pb-2 pt-1 shadow">
                <p>볼을 섞어보세요!</p>
              </div>

              {/* <ArrowBounce className="h-20 w-20 bg-white fill-white" /> */}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-red-800">
        <p className="text-4xl">당첨내역</p>
      </div>
    </section>
  );
}
