"use client";

import { useEffect } from "react";
import Button from "./components/common/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center">
      <h2 className="mb-11 text-center text-xl font-bold sm:text-5xl">
        서버 오류가 발생했습니다. <br />
        잠시 후 다시 시도해주세요.
      </h2>
      <Button onclick={() => reset()}>다시 시도</Button>
    </div>
  );
}
