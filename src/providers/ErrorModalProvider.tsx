"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import ErrorModal from "@/components/common/ErrorModal";

interface ErrorMessage {
  title: string;
  description: string;
  btnText: string;
}

interface ErrorModalProviderProps {
  showError: (message: ErrorMessage) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorModalProviderProps | undefined>(
  undefined,
);

export const useErrorModal = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorModalProvider");
  }
  return context;
};

export const ErrorModalProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<ErrorMessage | null>(null);

  const showError = (message: ErrorMessage) => {
    setError(message);
  };

  const hideError = () => {
    setError(null);
  };

  return (
    <ErrorContext value={{ showError, hideError }}>
      {children}
      {error && <ErrorModal message={error} onClose={hideError} />}
    </ErrorContext>
  );
};
