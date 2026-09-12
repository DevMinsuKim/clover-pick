"use client";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  getLottoHistoryQuery,
  getLottoWinningQuery,
} from "@/libs/queries/lottoQueries";
import {
  getPensionHistoryQuery,
  getPensionWinningQuery,
} from "@/libs/queries/pensionQueries";
import type {
  LotteryRecordsInput,
  LotteryRecordsKind,
} from "@/server/lottery/lotteryRecordsContracts";
import { formatDate, formatDrawDate } from "@/utils/formatDate";
import { lottoNumberBg } from "@/utils/lottoNumberBg";
import DeferredComponent from "../common/DeferredComponent";
import PensionNumbers from "../pension/PensionNumbers";
import LotteryRecordsSkeleton from "./LotteryRecordsSkeleton";

const controlClass =
  "min-h-11 rounded-lg border border-divider px-4 py-2 text-sm font-semibold transition hover:bg-content1Hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed dark:border-zinc-600";

export default function LotteryRecordsList({
  kind,
  active,
  game,
}: {
  kind: LotteryRecordsKind;
  active: boolean;
  game: "lotto" | "pension";
}) {
  const client = useQueryClient();
  const listStart = useRef<HTMLParagraphElement>(null);
  const [input, setInput] = useState<LotteryRecordsInput>({ page: 1 });
  const gameLabel = game === "lotto" ? "로또" : "연금복권";
  const options =
    game === "lotto"
      ? kind === "history"
        ? getLottoHistoryQuery(input)
        : getLottoWinningQuery(input)
      : kind === "history"
        ? getPensionHistoryQuery(input)
        : getPensionWinningQuery(input);
  const { data, isPending, isFetching, isPlaceholderData, isError, refetch } =
    useQuery({
      ...options,
      enabled: active,
      placeholderData: keepPreviousData,
      retry: 1,
      refetchOnWindowFocus: false,
    });
  const label = kind === "history" ? "생성 목록" : "당첨 내역";
  const busy = isFetching || isPlaceholderData;
  const pageSummary = data?.totalCount
    ? `${label} ${data.page} / ${data.totalPages}페이지 · 총 ${data.totalCount.toLocaleString("ko-KR")}게임`
    : "";

  function changePage(page: number) {
    if (!data || busy) return;
    // Scroll as a direct response to the click, never after the network response.
    // Desktop pages fit on screen, so keep their viewport unchanged.
    if (
      window.matchMedia("(max-width: 767px)").matches &&
      listStart.current &&
      listStart.current.getBoundingClientRect().top < 80
    ) {
      listStart.current.focus({ preventScroll: true });
      listStart.current.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
    setInput({ page, snapshotId: data.snapshotId });
  }

  async function latest() {
    if (busy) return;
    if (input.page === 1 && input.snapshotId === undefined) void refetch();
    else {
      await client.invalidateQueries({
        queryKey: [
          `${game}${kind === "history" ? "History" : "Winning"}`,
          1,
          null,
        ],
        exact: true,
        refetchType: "none",
      });
      setInput({ page: 1 });
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p
          ref={listStart}
          tabIndex={-1}
          className="scroll-mt-24 text-sm text-content3 focus:outline-none"
        >
          {kind === "history"
            ? `생성한 ${gameLabel} 번호`
            : `생성한 ${gameLabel} 번호의 당첨 내역`}
        </p>
        <button
          type="button"
          onClick={latest}
          disabled={busy}
          className={controlClass}
        >
          최신 목록
        </button>
      </div>
      <div aria-busy={busy}>
        {isPending && <LotteryRecordsSkeleton />}
        {isError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-divider bg-content1 p-5 text-center dark:border-zinc-600"
          >
            <p className="text-sm">
              {label}을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className={`${controlClass} mt-3`}
            >
              다시 시도
            </button>
          </div>
        )}
        {data && (
          <>
            {data.items.length === 0 ? (
              <div className="rounded-xl border border-divider bg-content1 px-4 py-12 text-center dark:border-zinc-600">
                <p className="font-semibold">
                  {kind === "history"
                    ? "아직 생성한 번호가 없어요."
                    : "아직 당첨 내역이 없어요."}
                </p>
                <p className="mt-2 text-sm text-content3">
                  {kind === "history"
                    ? "위에서 번호를 생성해 보세요."
                    : "추첨 결과를 확인하면 당첨된 번호가 여기에 표시돼요."}
                </p>
              </div>
            ) : (
              <ul
                aria-label={label}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {data.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col items-center gap-3 rounded-xl border border-divider bg-content1 px-3 py-5 shadow-sm dark:border-zinc-600"
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <p>{item.round}회</p>
                      {item.ranking !== null && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-sm text-primary1 dark:text-primary">
                          {game === "pension" && item.ranking === 8
                            ? "보너스"
                            : `${item.ranking}등`}
                        </span>
                      )}
                    </div>
                    {game === "pension" ? (
                      <PensionNumbers compact number={item.numbers.join("")} />
                    ) : (
                      <div className="flex w-full max-w-72 justify-between gap-1">
                        {item.numbers.map((number) => (
                          <span
                            key={number}
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white xs:size-9 xs:text-base"
                            style={{
                              backgroundColor: lottoNumberBg(number),
                              textShadow: "0px 0px 3px rgba(73, 57, 0, .8)",
                            }}
                          >
                            {number}
                          </span>
                        ))}
                      </div>
                    )}
                    {kind === "history" ? (
                      <p className="text-xs text-content3">
                        생성일{" "}
                        <time dateTime={item.generatedAt}>
                          {formatDate(item.generatedAt)}
                        </time>
                      </p>
                    ) : item.drawDate ? (
                      <p className="text-xs text-content3">
                        추첨일{" "}
                        <time dateTime={item.drawDate}>
                          {formatDrawDate(item.drawDate)}
                        </time>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {data.totalCount > 0 && (
              <nav
                aria-label={`${label} 페이지`}
                className="mt-5 flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  className={`${controlClass} ${data.page <= 1 ? "opacity-40" : ""}`}
                  disabled={busy || data.page <= 1}
                  onClick={() => changePage(data.page - 1)}
                >
                  이전
                </button>
                <p className="relative min-w-24 px-5 text-center text-sm tabular-nums">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center"
                  >
                    {busy && (
                      <DeferredComponent>
                        <span className="size-4 animate-spin rounded-full border-2 border-content2 border-t-primary1 dark:border-t-primary motion-reduce:animate-none" />
                      </DeferredComponent>
                    )}
                  </span>
                  <span aria-hidden="true">
                    {data.page} / {data.totalPages}
                  </span>
                  <span className="sr-only">
                    {data.totalPages}페이지 중 {data.page}페이지
                  </span>
                </p>
                <button
                  type="button"
                  className={`${controlClass} ${data.page >= data.totalPages ? "opacity-40" : ""}`}
                  disabled={busy || data.page >= data.totalPages}
                  onClick={() => changePage(data.page + 1)}
                >
                  다음
                </button>
              </nav>
            )}
          </>
        )}
      </div>
      <p
        role="status"
        className="mt-3 min-h-5 text-center text-xs text-content3"
      >
        <span aria-hidden="true">{pageSummary}</span>
        <span className="sr-only">
          {busy ? "목록을 불러오는 중이에요." : pageSummary}
        </span>
      </p>
    </div>
  );
}
