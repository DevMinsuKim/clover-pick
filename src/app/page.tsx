"use client";
import React, { useRef } from "react";
import IntroduceLotto from "./components/lotto/IntroduceLotto";
import DrawingLotto from "./components/lotto/DrawingLotto";
import HistoryLotto from "./components/lotto/HistoryLotto";

export default function Home() {
  const scrollRef = useRef(null);

  return (
    <section>
      <IntroduceLotto targetRef={scrollRef} />
      <DrawingLotto ref={scrollRef} />
      <HistoryLotto />
    </section>
  );
}
