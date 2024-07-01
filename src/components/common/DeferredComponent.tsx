"use client";

import { useEffect, useState } from "react";

export default function DeferredComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDeferred, setIsDeferred] = useState(false);
  useEffect(() => {
    // 150ms 지난 후 children Render
    const timeoutId = setTimeout(() => {
      setIsDeferred(true);
    }, 150);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!isDeferred) {
    return null;
  }

  return <>{children}</>;
}
