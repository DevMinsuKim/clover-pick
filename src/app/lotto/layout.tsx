import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "로또 6/45",
  description: "로또 6/45 번호 추첨 및 관련된 정보 제공",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
