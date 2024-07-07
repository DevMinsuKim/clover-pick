import React from "react";
import DeferredComponent from "../common/DeferredComponent";

export default function HomeLottoMovingSkeleton() {
  const skeletonItems = Array.from({ length: 10 });
  return (
    <DeferredComponent>
      <div className="mx-auto mt-20 w-full animate-pulse overflow-hidden">
        <div className="flex">
          {skeletonItems.map((item, index) => (
            <div
              key={index}
              className="mx-6 w-72 flex-shrink-0 rounded-xl bg-divider"
            >
              <div className="my-6 px-6">
                <div className="my-2 h-2 rounded bg-content2"></div>
                <div className="my-2 h-2 rounded bg-content2"></div>
                <div className="my-2 h-2 rounded bg-content2"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex">
          {skeletonItems.map((item, index) => (
            <div
              key={index}
              className="mx-6 w-72 flex-shrink-0 rounded-xl bg-divider"
            >
              <div className="my-6 px-6">
                <div className="my-2 h-2 rounded bg-content2"></div>
                <div className="my-2 h-2 rounded bg-content2"></div>
                <div className="my-2 h-2 rounded bg-content2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DeferredComponent>
  );
}
