import React from "react";
import DeferredComponent from "../common/DeferredComponent";

export default function DrawLottoNumberSkeleton() {
  return (
    <DeferredComponent>
      <div className="mr-2 h-7 w-20 animate-pulse rounded bg-divider sm:h-8" />
    </DeferredComponent>
  );
}
