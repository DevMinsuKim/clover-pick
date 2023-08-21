"use client";
import React, { useRef } from "react";
import DrawingPension from "../components/pension/DrawingPension";
import HistoryPension from "../components/pension/HistoryPension";
import IntroducePension from "../components/pension/IntroducePension";

export default function Pension() {
  const scrollRef = useRef(null);

  return (
    <section>
      <IntroducePension targetRef={scrollRef} />
      <DrawingPension ref={scrollRef} />
      <HistoryPension />
    </section>
  );
}
