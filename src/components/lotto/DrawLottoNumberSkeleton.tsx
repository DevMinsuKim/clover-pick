import React from "react";
import DeferredComponent from "../common/DeferredComponent";

export default function DrawLottoNumberSkeleton() {
  return (
    <DeferredComponent>
      <div className="mx-auto mt-10 flex w-52 animate-pulse flex-col items-center justify-center sm:w-72">
        <div className="h-7 w-full max-w-32 rounded bg-divider sm:h-10 sm:max-w-44"></div>
        <div className="mt-3 h-7 w-full rounded bg-divider sm:h-10"></div>
      </div>
    </DeferredComponent>
  );
}
