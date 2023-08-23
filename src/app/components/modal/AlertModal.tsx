import React, { ReactNode, useEffect, useRef } from "react";
import useOutSideClick from "../hook/useOutSideClick";
import ModalContainer from "./ModalContainer";

type AlertModalProps = {
  onClose: () => void;
  children: ReactNode;
};

export default function AlertModal({ onClose, children }: AlertModalProps) {
  const modalRef = useRef(null);
  const handleClose = () => {
    onClose?.();
  };

  useOutSideClick(modalRef, handleClose);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <ModalContainer>
      <div className="fixed w-full h-full top-0 bottom-0 right-0 left-0 bg-black/20 dark:bg-black/60 z-50">
        <div
          className="flex flex-col py-4 w-11/12 xl:w-3/5 2xl:w-fit h-fit rounded-2xl absolute top-2/4 left-2/4 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black dark:bg-slate-800 dark:text-white"
          ref={modalRef}
        >
          {children}

          <div className="flex items-center justify-center">
            <button
              className="p-2 bg-indigo-600 text-white rounded-md mt-8"
              onClick={handleClose}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}
