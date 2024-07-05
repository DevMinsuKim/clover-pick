"use client";

import { getHome } from "@/libs/queries/homeQueries";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

interface infoCardProps {
  count: number;
  label: string;
}

const Card = ({ count, label }: infoCardProps) => {
  const [displayedCount, setDisplayedCount] = useState(0);

  useEffect(() => {
    const duration = 500;
    const interval = 40;
    const totalIntervals = duration / interval;
    const increment = count / totalIntervals;
    let currentCount = 0;

    const intervalId = setInterval(() => {
      currentCount += increment;
      if (currentCount >= count) {
        currentCount = count;
        clearInterval(intervalId);
      }
      setDisplayedCount(Math.floor(currentCount));
    }, interval);

    return () => clearInterval(intervalId);
  }, [count]);

  return (
    <div className="mx-6 rounded-xl bg-background">
      <div className="my-6">
        <p className="text-3xl font-bold sm:text-4xl">{displayedCount} 개</p>
        <p className="mt-4 text-sm font-bold sm:text-base">{label}</p>
      </div>
    </div>
  );
};

export default function HomeStats() {
  const { data, error, isFetching } = useSuspenseQuery(getHome);
  if (error && !isFetching) {
    throw error;
  }

  return (
    <div className="mt-20 w-full bg-content4">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-3 py-10 text-center md:grid-cols-2 lg:grid-cols-4">
        <Card count={data.lottoCreateCount} label="생성된 로또 6/45" />
        <Card count={data.lottoWinningCount} label="당첨된 로또 6/45" />
        <Card count={0} label="생성된 연금복권 720+" />
        <Card count={0} label="당첨된 연금복권 720+" />
      </div>
    </div>
  );
}
