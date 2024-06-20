import React from "react";
import LottoGenerato from "../components/lotto/LottoGenerato";

export default function page() {
  return (
    <section className="flex flex-col">
      ?회차 번호 뽑기 <LottoGenerato />
    </section>
  );
}
