import React from "react";
import DeferredComponent from "../common/DeferredComponent";

export default function PensionDrawNumberSkeleton() {
  return (
    <DeferredComponent>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center text-center text-2xl font-extrabold sm:text-4xl">
          <p className="flex items-center">
            <div className="mr-2 h-7 w-20 animate-pulse rounded bg-divider sm:h-8" />
            회차
          </p>
          <p>연금복권 720+ 번호 생성</p>
        </div>
      </div>
    </DeferredComponent>
  );
}
