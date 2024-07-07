"use client";

import DeferredComponent from "../common/DeferredComponent";

export default function PensionGenerationHistorySkeleton() {
  const skeletonItems = Array.from({ length: 6 });

  return (
    <DeferredComponent>
      <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skeletonItems.map((item, index) => (
          <div key={index} className="rounded-lg bg-divider p-4">
            <div className="flex flex-col gap-y-3">
              <div className="h-4 rounded bg-content2"></div>
              <div className="h-4 rounded bg-content2"></div>
              <div className="h-4 rounded bg-content2"></div>
            </div>
          </div>
        ))}
      </div>
    </DeferredComponent>
  );
}
