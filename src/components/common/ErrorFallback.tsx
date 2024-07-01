"use client";

import * as Sentry from "@sentry/nextjs";
import React, { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";
import Button from "./Button";
import { getErrorMessage } from "@/utils/errorMessages";

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  useEffect(() => {
    if (error) {
      console.error(error);
      Sentry.captureException(error);
    }
  }, [error]);
  const { title, description } = getErrorMessage(error);

  return (
    <div className="my-2 flex w-full flex-col items-center justify-center rounded-xl border bg-content1 px-2 py-4 shadow-md dark:border-none">
      {title && (
        <h2 className="mb-2 whitespace-pre-line text-center font-extrabold sm:text-lg">
          {title}
        </h2>
      )}
      {description && (
        <div className="mb-4 whitespace-pre-line text-center text-sm sm:text-base">
          <p>{description}</p>
        </div>
      )}

      <Button onClick={() => resetErrorBoundary()}>다시 시도하기</Button>
    </div>
  );
}
