import React from "react";
import GetLottoNumbers from "../components/lotto/GetLottoNumbers";

export default function page() {
  return (
    <section className="flex flex-col">
      ?회차 번호 뽑기 <GetLottoNumbers />
    </section>
  );
}
