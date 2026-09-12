"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { useReportWebVitals } from "next/web-vitals";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const reportWebVitals: ReportWebVitalsCallback = (metric) => {
  sendGAEvent("event", metric.name, {
    value: Math.round(
      metric.name === "CLS" ? metric.value * 1000 : metric.value,
    ),
    metric_id: metric.id,
    metric_rating: metric.rating,
    non_interaction: true,
  });
};

export default function WebVitals() {
  useReportWebVitals(reportWebVitals);

  return null;
}
