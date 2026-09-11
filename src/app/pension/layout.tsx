import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "연금복권 720+",
  description: "연금복권 720+ 번호 빠르게 생성해보세요!",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
