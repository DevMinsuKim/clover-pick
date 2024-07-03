"use client";

import React from "react";
import { FallbackProps } from "react-error-boundary";
import Button from "./Button";
import { errorHandler } from "@/utils/errorHandler";

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const { title, description } = errorHandler(error);

  return (
    <div className="my-2 flex w-full flex-col items-center justify-center rounded-xl border bg-content1 px-2 py-4 shadow-md dark:border-none">
      {title && (
        <h2 className="mb-2 whitespace-pre-wrap break-words font-extrabold sm:text-lg">
          {title}
        </h2>
      )}
      {description && (
        <div className="mb-4 whitespace-pre-wrap break-words text-sm sm:text-base">
          <p>{description}</p>
        </div>
      )}

      <Button onClick={() => resetErrorBoundary()}>다시 시도하기</Button>
    </div>
  );
}
