"use client";

import React from "react";
import UpDownEffect from "./effect/UpDownEffect";
import ArrowUp from "./ui/icons/ArrowUp";
import useTouchDevice from "../hooks/useTouchDevice";
import Loader from "./Loader";

export default function DeviceActionText() {
  const isTouchDevice = useTouchDevice();

  if (isTouchDevice === null) {
    return <></>;
  }

  return (
    <UpDownEffect>
      <div className="flex items-center rounded-full border bg-content1 p-2 shadow-lg dark:border-none">
        <ArrowUp />
        <p className="ml-2 text-center text-xs sm:text-sm">
          {isTouchDevice ? (
            "클릭"
          ) : (
            <>
              마우스를
              <br className="sm:hidden" /> 움직여 보세요!
            </>
          )}
        </p>
      </div>
    </UpDownEffect>
  );
}
