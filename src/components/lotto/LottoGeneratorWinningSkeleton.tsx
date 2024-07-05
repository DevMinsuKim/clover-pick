"use client";

import DeferredComponent from "../common/DeferredComponent";

export default function LottoGeneratorWinningSkeleton() {
  const skeletonItems = Array.from({ length: 6 });

  return (
    <DeferredComponent>
      <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skeletonItems.map((item, index) => (
          <div key={index} className="rounded-lg bg-divider p-4">
            <div className="flex flex-col gap-y-3">
              <div className="bg-content2 h-4 rounded"></div>
              <div className="bg-content2 h-4 rounded"></div>
              <div className="bg-content2 h-4 rounded"></div>
              <div className="bg-content2 h-4 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </DeferredComponent>
  );
}
