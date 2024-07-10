"use client";

import { getPensionQuery } from "@/libs/queries/pensionQueries";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function PensionDrawNumber() {
  const { data, error, isFetching } = useSuspenseQuery(getPensionQuery);

  if (error && !isFetching) {
    throw error;
  }

  return <>{data.success?.draw_number ?? 0} </>;
}
