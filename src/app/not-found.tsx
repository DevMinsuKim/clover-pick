"use client";

import React from "react";
import Button from "./components/common/Button";
import { useRouter } from "next/navigation";
import NotFoundAni from "./components/common/NotFoundAni";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-center">
      <NotFoundAni className="max-w-lg" />
      <strong className="text-2xl sm:text-3xl">
        찾으시는 페이지가 없습니다.
      </strong>
      <p className="my-8 text-sm sm:text-base">
        잘못된 접근이거나 요청하신 페이지를 찾을 수 없습니다. <br /> 입력하신
        페이지의 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.
      </p>
      <Button onclick={() => handleGoBack()}>이전 페이지로 돌아가기</Button>
    </div>
  );
}
