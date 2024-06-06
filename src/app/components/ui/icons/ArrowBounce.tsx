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
  className?: string;
}

export default function ArrowBounce({
  loop = true,
  play = true,
  className,
}: AnimationProps) {
  return (
    <LottiePlayer
      animationData={animationData}
      loop={loop}
      play={play}
      className={className}
    />
  );
}
