"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col items-center justify-center text-center">
      <strong className="text-2xl sm:text-3xl">
        찾으시는 페이지가 없습니다.
      </strong>
      <p className="my-8 text-sm sm:text-base">
        잘못된 접근이거나 요청하신 페이지를 찾을 수 없습니다. <br /> 입력하신
        페이지의 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.
      </p>
      <Button onClick={() => handleGoBack()}>이전 페이지로 돌아가기</Button>
    </div>
  );
}
