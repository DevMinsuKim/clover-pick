"use client";

import React from "react";
import animationData from "public/lotties/not_foundAni.json";
import LottiePlayer from "react-lottie-player";

interface AnimationProps {
  loop?: boolean;
  play?: boolean;
  className?: string;
}

export default function NotFoundAni({
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
