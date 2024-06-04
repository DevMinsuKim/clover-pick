import React from "react";
import BallMix from "./components/BallMix";
import Image from "next/image";
// import ArrowBounce from "./components/ui/icons/ArrowBounce";

export default function Home() {
  return (
    <section className="relative flex flex-col items-center justify-center">
      <Image
        className="absolute right-0 top-10 opacity-10 blur-2xl dark:opacity-5"
        src={"/images/pattern.png"}
        width={600}
        height={600}
        alt="pattern"
      />
      <div className="relative flex w-full flex-col items-center justify-end md:flex-row">
        <h2 className="absolute left-0 text-5xl">
          클로버픽 AI가 선택한 번호, <br /> 최고의 행운을 당신에게!
        </h2>
        <div className="relative h-[30rem] w-auto">
          <BallMix />
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 transform">
            {/* <ArrowBounce /> */}
            <p className="rounded-md bg-content1 p-2">볼을 섞어보세요!</p>
          </div>
        </div>
      </div>
      <div className="w-full bg-red-800">
        <p className="text-4xl">당첨내역</p>
      </div>
    </section>
  );
}
