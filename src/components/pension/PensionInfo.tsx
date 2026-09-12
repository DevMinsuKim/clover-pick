import LotteryGuide, { lotteryPurchaseNotice } from "../lottery/LotteryGuide";

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
    <LotteryGuide
      id="pension-guide-title"
      title="연금복권720+ 이용 안내"
      officialUrl="https://www.dhlottery.co.kr/pt720/intro"
      sections={[
        {
          title: "조와 여섯 자리 번호가 한 게임이에요",
          description:
            "번호는 1~5조와 000000~999999의 여섯 자리로 구성돼요. 앞자리 0과 반복 숫자도 가능하며, 숫자의 순서가 다르면 다른 번호예요.",
          note: "맞춤 생성에서는 빠른 조건을 선택하거나 문장으로 조건을 입력해요. AI가 정리한 조건 안에서 번호를 무작위로 고르며, 당첨 번호를 예측하는 기능은 아니에요.",
        },
        {
          title: "한 번에 최대 5게임을 만들어요",
          description:
            "‘모든 조’를 선택하면 같은 여섯 자리 번호에 1~5조를 붙여 총 5게임을 만들어요. 이 옵션을 끄면 한 번에 만든 게임끼리 조와 번호가 모두 같지 않게 골라요.",
          note: "실제 구매 가능 여부는 동행복권이나 판매점에서 확인해 주세요. 이미 판매된 번호는 구매할 수 없을 수 있어요.",
        },
        {
          title: "당첨 내역은 생성한 번호의 대조 결과예요",
          description:
            "오른쪽 끝자리부터 연속으로 일치하는지 확인해요. 보너스는 조와 관계없이 여섯 자리가 모두 맞아야 해요. 여러 등위가 겹치면 가장 큰 당첨금 하나를 적용해요.",
          note: lotteryPurchaseNotice,
        },
        {
          title: "추첨 당일에는 잠시 쉬어가요",
          description: (
            <>
              매주 목요일{" "}
              <strong className="font-semibold text-foreground">
                17:00~22:00
              </strong>
              에는 결과 반영과 다음 회차 준비를 위해 생성을 멈춰요. 기존 번호와
              목록은 계속 볼 수 있어요.
            </>
          ),
          note: "추첨 방송은 목요일 19:05경이며, 방송 일정에 따라 달라질 수 있어요.",
        },
      ]}
      details={{
        summary: "등수별 당첨 기준 보기",
        content: (
          <>
            <dl className="grid gap-3 sm:grid-cols-2">
              {prizes.map(([rank, rule, prize]) => (
                <div key={rank} className="rounded-lg bg-content1Hover/50 p-4">
                  <dt className="text-sm font-bold">
                    {rank} · {prize}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-content3">
                    {rule}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-5 text-content3">
              당첨금은 세전 기준이에요. 3~7등은 1등 추첨번호와 비교해요.
            </p>
          </>
        ),
      }}
    />
  );
}
