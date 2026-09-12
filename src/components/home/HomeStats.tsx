"use client";

import { useQuery } from "@tanstack/react-query";
import { getHomeQuery } from "@/libs/queries/homeQueries";

export default function HomeStats() {
  const { data, isPending, isError, isFetching, refetch } =
    useQuery(getHomeQuery);
  const counts = [
    { label: "로또 6/45", count: data?.success.lottoCreateCount },
    { label: "연금복권 720+", count: data?.success.pensionCreateCount },
  ];
  return (
    <section
      aria-labelledby="home-records-title"
      className="grid gap-8 rounded-2xl bg-content4 p-6 sm:p-8 lg:grid-cols-2 lg:items-center"
    >
      <div>
        <h2 id="home-records-title" className="text-lg font-bold sm:text-xl">
          번호를 만든 다음에도, 한곳에서
        </h2>
        <p className="mt-3 text-sm leading-7 text-content3">
          생성한 번호는 목록에서 다시 보고,
          <br className="hidden sm:block" /> 추첨 결과가 반영되면 당첨 내역에서
          대조해 보세요.
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold text-content3">
          클로버픽에 쌓인 생성 기록
        </p>
        <dl aria-busy={isPending} className="mt-4 grid grid-cols-2 gap-4">
          {counts.map(({ label, count }) => (
            <div key={label}>
              <dt className="text-xs text-content3 sm:text-sm">{label}</dt>
              <dd className="mt-2 flex min-h-9 flex-wrap items-baseline gap-1.5">
                {count === undefined && isError ? (
                  <span
                    aria-hidden="true"
                    className="text-2xl font-bold text-content3"
                  >
                    —
                  </span>
                ) : count === undefined ? (
                  <span
                    className="inline-block h-8 w-20 rounded bg-content2 motion-safe:animate-pulse"
                    aria-hidden="true"
                  />
                ) : (
                  <>
                    <span className="break-all text-2xl font-bold tabular-nums sm:text-3xl">
                      {count.toLocaleString("ko-KR")}
                    </span>
                    <span className="text-xs text-content3">게임</span>
                  </>
                )}
                {count === undefined && (
                  <span className="sr-only">
                    {isError ? "확인할 수 없음" : "불러오는 중"}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div
          className="mt-3 min-h-5 text-xs leading-5 text-content3"
          role="status"
        >
          {isError && (
            <span>
              생성 기록을 불러오지 못했어요.{" "}
              <button
                type="button"
                disabled={isFetching}
                onClick={() => void refetch()}
                className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
              >
                {isFetching ? "불러오는 중…" : "다시 불러오기"}
              </button>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
