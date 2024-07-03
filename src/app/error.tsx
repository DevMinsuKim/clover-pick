"use client";

import Button from "@/components/common/Button";
import { errorHandler } from "@/utils/errorHandler";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { title, description } = errorHandler(error);

  return (
    <div className={`flex h-full flex-col items-center justify-center`}>
      {title && (
        <h2 className="mb-7 whitespace-pre-wrap break-words text-center text-2xl font-extrabold sm:text-4xl">
          {title}
        </h2>
      )}
      {description && (
        <div className="mb-9 whitespace-pre-wrap break-words text-center sm:text-lg">
          <p>{description}</p>
        </div>
      )}

      <Button onClick={() => reset()}>다시 시도하기</Button>
    </div>
  );
}
