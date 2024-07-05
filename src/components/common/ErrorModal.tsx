import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

export interface ErrorModalProps {
  message: {
    title: string;
    description: string;
    btnText: string;
  };
  onClose: () => void;
}

export default function ErrorModal({
  message: { title, description, btnText },
  onClose,
}: ErrorModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("wheel", preventScroll, { passive: false });
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("wheel", preventScroll);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-20 flex min-w-[320px] items-center justify-center bg-black bg-opacity-50 px-6"
      onClick={handleBackdropClick}
    >
      <div className="max-w-screen-xl whitespace-pre-wrap break-words rounded-xl bg-content1 px-5 py-4 text-center text-foreground shadow-lg sm:m-0">
        {title && (
          <h2 className="mb-4 text-base font-bold sm:text-lg">{title}</h2>
        )}
        {description && (
          <p className="mb-3 text-sm sm:text-base">{description}</p>
        )}
        <Button onClick={onClose}>{btnText}</Button>
      </div>
    </div>,
    document.body,
  );
}
