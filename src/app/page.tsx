import React from "react";
import BallMix from "./components/BallMix";
import Image from "next/image";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center py-40 bg-red-400">
      <div className="flex flex-col items-center md:flex-row ">
        <h2 className="text-base md:text-lg lg:text-xl">
          상상 이상의 디테일까지 포착해 주는 카메라.
        </h2>
        <div className="relative">
          <Image
            className="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-10 top-1/2 left-1/2"
            src={"/images/pattern.png"}
            width={300}
            height={300}
            alt="pattern"
          />
          <BallMix />
          <div className="absolute top-[calc(50%+90px)] left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-10">
            탭 하거나 드래그 해보세요
          </div>
        </div>
      </div>
    </section>
  );
}
