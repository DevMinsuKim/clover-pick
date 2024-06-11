import React from "react";
import BallMix from "./components/BallMix";
import Image from "next/image";
import ArrowUp from "./components/ui/icons/ArrowUp";
import UpDown from "./components/effect/UpDown";
import ArrowBounce from "./components/ui/icons/ArrowBounce";
import Link from "next/link";
import { ROUTES } from "./constants/routes";
import Button from "./components/Button";

{
  /* <ArrowBounce className="h-20 w-20 bg-white fill-white" /> */
}

export default function Home() {
  return (
    <section>
      <div className="mt-20">
        <h2 className="text-center text-4xl font-extrabold sm:text-5xl lg:mt-32 lg:text-6xl">
          클로버픽 AI가 <br className="md:hidden" />
          선택한 번호, <br /> 최고의 행운을 <br className="md:hidden" />
          당신에게!
        </h2>

        <div className="mt-16 flex w-full flex-col items-center gap-5 md:flex-row md:justify-center">
          <div className="w-full max-w-sm md:w-auto">
            <Link href={ROUTES.LOTTO_645}>
              <Button className="w-full">로또 6/45 번호 추첨하기</Button>
            </Link>
          </div>
          <div className="w-full max-w-sm md:w-auto">
            <Link href={ROUTES.LOTTO_645}>
              <Button className="w-full">연금복권 720+ 번호 추첨하기</Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          {/* <Image
            priority
            src={"/images/pattern.png"}
            alt="pattern"
            width={1920}
            height={1080}
            layout="fill"
            objectFit="contain"
            className="absolute left-0 top-0 opacity-10 dark:opacity-5"
          /> */}
          <div className="mt-16 h-full min-h-40 w-full max-w-md bg-red-400 md:min-h-96">
            <BallMix />
          </div>
        </div>
      </div>

      <div>test@@@@@@@@@@</div>

      {/* <div className="relative h-[30rem] w-auto">
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

              
            </div>
          </div>
        </div> */}
      {/* <div className="w-full bg-red-800">
        <p className="text-4xl">당첨내역</p>
      </div> */}
    </section>
  );
}
