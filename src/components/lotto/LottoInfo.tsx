import Info from "../ui/icons/Info";

const bodyClass =
  "text-sm leading-6 text-zinc-600 sm:text-base sm:leading-7 dark:text-zinc-300";

export default function LottoInfo() {
  return (
    <section
      aria-labelledby="lotto-guide-title"
      className="break-keep rounded-2xl border border-divider bg-content4/60 p-5 sm:p-8 dark:border-zinc-700"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-content1 text-primary1 dark:text-primary"
        >
          <Info className="size-6" />
        </span>
        <h2 id="lotto-guide-title" className="text-lg font-bold sm:text-2xl">
          로또 이용 안내
        </h2>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <h3 className="text-base font-bold sm:text-lg">번호 생성 방식</h3>
          <dl className="mt-4 space-y-5">
            <div>
              <dt className="text-sm font-semibold sm:text-base">랜덤 생성</dt>
              <dd className={`mt-1.5 ${bodyClass}`}>
                1~45 중 서로 다른 번호 6개를 무작위로 골라요.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold sm:text-base">맞춤 생성</dt>
              <dd className={`mt-1.5 space-y-2 ${bodyClass}`}>
                <p>
                  빠른 조건을 선택하거나 원하는 조건을 문장으로 입력해요. 입력한
                  문장은 AI가 번호 조건으로 정리해요.
                </p>
                <p>
                  정리된 조건을 확인하면, 그 조건에 맞는 번호를 무작위로 골라요.
                </p>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold sm:text-base">
                한 번에 최대 5세트
              </dt>
              <dd className={`mt-1.5 ${bodyClass}`}>
                한 번에 생성한 세트끼리는 같은 조합이 나오지 않아요. 이전에
                생성한 조합은 다시 나올 수 있어요.
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="rounded-xl border border-divider bg-content1 p-4 sm:p-5 dark:border-zinc-600">
            <h3 className="text-base font-bold sm:text-lg">
              번호 생성 제한 시간
            </h3>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-semibold text-primary1 dark:text-primary">
              <span className="text-sm sm:text-base">매주 토요일</span>
              <span className="whitespace-nowrap text-base tabular-nums sm:text-lg">
                20:00 ~ 23:30
              </span>
            </p>
            <p className={`mt-3 ${bodyClass}`}>
              추첨 결과를 확인하고 다음 회차를 준비하는 동안 번호 생성을 잠시
              멈춰요.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold sm:text-lg">
              최근 많이 나온 번호 기준
            </h3>
            <div className={`mt-3 space-y-2 ${bodyClass}`}>
              <p>
                최근 100회 추첨에서 각 번호가 나온 횟수를 집계해요. 보너스
                번호는 제외해요.
              </p>
              <p>
                많이 나온 상위 20개 번호 안에서 선택한 조건에 맞춰 번호를
                골라요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 border-t border-divider pt-5 text-sm leading-6 text-zinc-600 sm:mt-8 dark:border-zinc-600 dark:text-zinc-300">
        생성 방식이나 과거 출현 횟수에 따라 당첨확률이 높아지지는 않아요.
      </p>
    </section>
  );
}
