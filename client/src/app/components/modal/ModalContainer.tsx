import React, { ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalContainerProps = {
  children: ReactNode;
};

export default function ModalContainer({ children }: ModalContainerProps) {
  const modalRoot = document.getElementById("modal");

  if (!modalRoot) {
    return null;
  }

  return createPortal(<>{children}</>, modalRoot);
}
