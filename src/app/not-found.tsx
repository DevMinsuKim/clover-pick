import React from "react";
import Button from "./components/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-center">
      <strong className="text-2xl sm:text-3xl">
        찾으시는 페이지가 없습니다.
      </strong>
      <p className="my-8 text-sm sm:text-base">
        잘못된 접근이거나 요청하신 페이지를 찾을 수 없습니다. <br /> 입력하신
        페이지의 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.
      </p>
      <Link href="/">
        <Button>홈으로</Button>
      </Link>
    </div>
  );
}
