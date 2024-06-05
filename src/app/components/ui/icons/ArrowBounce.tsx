"use client";

import React from "react";
import animationData from "@/public/lotties/arrow_bounce.json";
import dynamic from "next/dynamic";

const LottiePlayer = dynamic(() => import("react-lottie-player"), {
  ssr: false,
});

interface AnimationProps {
  loop?: boolean;
  play?: boolean;
  style?: React.CSSProperties;
}

export default function ArrowBounce({
  loop = true,
  play = true,
  style,
}: AnimationProps) {
  return (
    <LottiePlayer
      animationData={animationData}
      loop={loop}
      play={play}
      style={style}
    />
  );
}
