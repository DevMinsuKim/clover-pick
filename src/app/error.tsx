"use client";

import Button from "@/components/common/Button";
import { errorHandler } from "@/utils/errorHandler";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { title, description, btnText } = errorHandler(error);

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center`}>
      {title && (
        <h2 className="mb-7 whitespace-pre-wrap wrap-break-word text-center text-2xl font-extrabold sm:text-4xl">
          {title}
        </h2>
      )}
      {description && (
        <div className="mb-9 whitespace-pre-wrap wrap-break-word text-center sm:text-lg">
          <p>{description}</p>
        </div>
      )}

      <Button onClick={retry}>{btnText}</Button>
    </div>
  );
}
