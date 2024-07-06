import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "연금복권 720+",
  description: "연금복권 720+ 번호 생성 및 관련된 정보 제공",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
