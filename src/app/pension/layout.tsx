import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "연금복권 720+",
  description:
    "연금복권720+ 번호를 랜덤으로 고르거나 조·앞자리·끝자리 조건에 맞게 생성하고, 생성한 번호의 당첨 내역을 확인하세요.",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
