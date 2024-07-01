"use client";

import * as Sentry from "@sentry/nextjs";
import Button from "@/components/common/Button";
import CombinationLogo from "@/components/ui/icons/CombinationLogo";
import { Noto_Sans_KR } from "next/font/google";
import { useEffect } from "react";
import { getErrorMessage } from "@/utils/errorMessages";

const notoSansKR = Noto_Sans_KR({ subsets: ["latin"] });

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const handleReload = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (error) {
      Sentry.captureException(error);
    }
  }, [error]);

  const { title, description } = getErrorMessage(error);

  return (
    <html suppressHydrationWarning lang="ko">
      <body
        className={`${notoSansKR.className} container relative mx-auto flex h-screen w-full min-w-[320px] max-w-screen-xl flex-col items-center justify-center break-keep px-6`}
      >
        <div
          className="absolute top-10 w-48 cursor-pointer sm:w-56"
          onClick={() => handleReload()}
        >
          <CombinationLogo />
        </div>

        {title && (
          <h2 className="mb-7 whitespace-pre-line text-center text-2xl font-extrabold sm:text-4xl">
            {title}
          </h2>
        )}
        {description && (
          <div className="mb-9 whitespace-pre-line text-center sm:text-lg">
            <p>{description}</p>
          </div>
        )}

        <Button onClick={() => handleReload()}>다시 시도하기</Button>
      </body>
    </html>
  );
}
