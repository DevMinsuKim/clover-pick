import React from "react";
import LottoPick from "../components/lotto/LottoPick";

export default function page() {
  return (
    <section className="flex flex-col">
      ?회차 번호 뽑기 <LottoPick />
    </section>
  );
}
