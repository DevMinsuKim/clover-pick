import Info from "../ui/icons/Info";

const prizes = [
  ["1등", "조와 여섯 자리 모두 일치", "월 700만 원 × 20년"],
  ["2등", "조만 다르고 여섯 자리 일치", "월 100만 원 × 10년"],
  ["보너스", "조와 관계없이 보너스 여섯 자리 일치", "월 100만 원 × 10년"],
  ["3등", "끝 다섯 자리 일치", "100만 원"],
  ["4등", "끝 네 자리 일치", "10만 원"],
  ["5등", "끝 세 자리 일치", "5만 원"],
  ["6등", "끝 두 자리 일치", "5천 원"],
  ["7등", "끝 한 자리 일치", "1천 원"],
];
export default function PensionInfo() {
  return (
    <section
      aria-labelledby="pension-guide-title"
      className="rounded-2xl border border-divider bg-content1 px-5 py-6 dark:border-zinc-600 sm:p-8"
    >
      <h2
        id="pension-guide-title"
        className="flex items-center gap-2 text-lg font-bold sm:text-xl"
      >
        <Info className="size-5 shrink-0" />
        연금복권720+ 이용 안내
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-8">
        <div>
          <h3 className="font-semibold">조와 자리 순서가 중요해요</h3>
          <p className="mt-2 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
            번호는 1~5조와 000000~999999의 여섯 자리로 구성돼요. 앞자리 0과 반복
            숫자도 가능하며, 숫자의 순서가 다르면 다른 번호예요.
          </p>
          <p className="mt-3 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
            맞춤 생성에서는 AI가 입력 문장을 조건으로 정리하고, 확인한 조건
            안에서 번호를 무작위로 골라요. 당첨 번호를 예측하는 기능은 아니에요.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">모든 조는 같은 번호로 5개예요</h3>
          <p className="mt-2 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
            같은 여섯 자리 번호에 1~5조를 각각 붙여요. 낱개 생성에서도 한 번에
            만든 번호끼리는 조까지 모두 같은 번호가 나오지 않아요.
          </p>
          <p className="mt-3 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
            실제 구매 가능 여부는 동행복권이나 판매점에서 확인해 주세요. 이미
            판매된 번호는 구매할 수 없을 수 있어요.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">
            당첨 내역은 생성한 번호의 대조 결과예요
          </h3>
          <p className="mt-2 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
            오른쪽 끝자리부터 연속으로 일치하는지 확인해요. 보너스는 조와
            관계없이 여섯 자리가 모두 맞아야 해요. 여러 등위가 겹치면 가장 큰
            당첨금 하나를 적용해요.
          </p>
          <p className="mt-3 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
            생성·복사만으로 복권이 구매되지는 않아요. 당첨 내역은 실제 복권
            구매나 당첨금 수령을 의미하지 않아요.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">추첨 당일에는 잠시 쉬어가요</h3>
          <p className="mt-2 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
            매주 목요일{" "}
            <strong className="font-semibold text-foreground">
              17:00~22:00
            </strong>
            에는 결과 반영과 다음 회차 준비를 위해 생성을 멈춰요. 기존 번호와
            목록은 계속 볼 수 있어요.
          </p>
          <p className="mt-3 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
            추첨 방송은 목요일 19:05경이며, 방송 일정에 따라 달라질 수 있어요.
          </p>
        </div>
      </div>
      <details className="mt-6 border-t border-divider pt-5 dark:border-zinc-600">
        <summary className="cursor-pointer py-1 text-sm font-semibold">
          등수별 당첨 기준 보기
        </summary>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {prizes.map(([rank, rule, prize]) => (
            <div key={rank} className="rounded-lg bg-content1Hover/50 p-4">
              <dt className="text-sm font-bold">
                {rank} · {prize}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-content3">{rule}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-5 text-content3">
          당첨금은 세전 기준이에요. 3~7등은 1등 추첨번호와 비교해요.
        </p>
      </details>
      <a
        href="https://www.dhlottery.co.kr/pt720/intro"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block py-2 text-sm underline underline-offset-4"
      >
        동행복권 공식 안내 확인하기<span className="sr-only"> (새 탭)</span>
      </a>
    </section>
  );
}
