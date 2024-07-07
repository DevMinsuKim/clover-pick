"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center text-center`}
    >
      <h2 className="text-2xl font-extrabold sm:text-3xl">
        찾으시는 페이지가 없습니다.
      </h2>
      <p className="my-8 text-sm sm:text-base">
        잘못된 접근이거나 요청하신 페이지를 찾을 수 없습니다. <br /> 입력하신
        페이지의 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={() => handleGoBack()}>이전 페이지로 돌아가기</Button>
        <Link href={"/"}>
          <Button className="w-full">홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
