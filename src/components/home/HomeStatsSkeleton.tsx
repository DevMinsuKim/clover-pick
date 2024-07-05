"use client";

import React from "react";
import DeferredComponent from "../common/DeferredComponent";

export default function HomeStatsSkeleton() {
  const skeletonItems = Array.from({ length: 4 });

  return (
    <DeferredComponent>
      <div className="mt-20 w-full bg-content4">
        <div className="mx-auto grid max-w-screen-xl animate-pulse grid-cols-1 gap-3 py-10 text-center md:grid-cols-2 lg:grid-cols-4">
          {skeletonItems.map((item, index) => (
            <div key={index} className="mx-6 rounded-xl bg-background">
              <div className="my-6 px-6">
                <div className="h-12 rounded bg-content2 sm:h-10"></div>
                <div className="mt-4 h-4 rounded bg-content2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DeferredComponent>
  );
}
