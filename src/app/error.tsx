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
  const { title, description, btnText } = errorHandler(error);

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center`}>
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

      <Button onClick={() => reset()}>{btnText}</Button>
    </div>
  );
}
