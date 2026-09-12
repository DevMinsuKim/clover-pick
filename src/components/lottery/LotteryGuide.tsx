import type { ReactNode } from "react";
import Info from "../ui/icons/Info";

export const lotteryPurchaseNotice =
  "생성·복사만으로 복권이 구매되지는 않아요. 당첨 내역은 실제 복권 구매나 당첨금 수령을 의미하지 않아요.";

export default function LotteryGuide({
  id,
  title,
  sections,
  details,
  officialUrl,
}: {
  id: string;
  title: string;
  sections: { title: string; description: ReactNode; note: ReactNode }[];
  details: { summary: string; content: ReactNode };
  officialUrl: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className="break-keep rounded-2xl border border-divider bg-content1 px-5 py-6 dark:border-zinc-600 sm:p-8"
    >
      <h2
        id={id}
        className="flex items-center gap-2 text-lg font-bold sm:text-xl"
      >
        <span aria-hidden="true">
          <Info className="size-5 shrink-0" />
        </span>
        {title}
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold">{section.title}</h3>
            <p className="mt-2 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
              {section.description}
            </p>
            <p className="mt-3 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
              {section.note}
            </p>
          </div>
        ))}
      </div>
      <details className="mt-6 border-t border-divider pt-5 dark:border-zinc-600">
        <summary className="cursor-pointer py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {details.summary}
        </summary>
        <div className="mt-4">{details.content}</div>
      </details>
      <a
        href={officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block py-2 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        동행복권 공식 안내 확인하기<span className="sr-only"> (새 탭)</span>
      </a>
    </section>
  );
}
