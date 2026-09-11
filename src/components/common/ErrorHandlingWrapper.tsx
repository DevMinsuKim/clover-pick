"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import type React from "react";
import { type ComponentType, type ReactNode, Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

interface PropsType {
  children: React.ReactNode;
  fallbackComponent: ComponentType<FallbackProps>;
  suspenseFallback: ReactNode;
}

export default function ErrorHandlingWrapper({
  children,
  fallbackComponent: FallbackComponent,
  suspenseFallback: SuspenseFallback,
}: PropsType) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={FallbackComponent}>
          <Suspense fallback={SuspenseFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
