import LotteryGuide, { lotteryPurchaseNotice } from "../lottery/LotteryGuide";

export default function LottoInfo() {
  return (
    <LotteryGuide
      id="lotto-guide-title"
      title="로또6/45 이용 안내"
      officialUrl="https://www.dhlottery.co.kr/lt645/intro"
      sections={[
        {
          title: "서로 다른 번호 6개가 한 게임이에요",
          description:
            "1~45 중 서로 다른 번호 6개를 무작위로 골라요. 번호의 순서는 당첨 결과에 영향을 주지 않아요.",
          note: "맞춤 생성에서는 빠른 조건을 선택하거나 문장으로 조건을 입력해요. AI가 정리한 조건을 확인하면, 그 안에서 번호를 무작위로 골라요.",
        },
        {
          title: "한 번에 최대 5게임을 만들어요",
          description:
            "한 번에 생성한 게임끼리는 같은 조합이 나오지 않아요. 이전에 생성한 조합은 다시 나올 수 있어요.",
          note: "생성 방식이나 과거 출현 횟수에 따라 당첨확률이 높아지지는 않아요. 맞춤 생성은 당첨 번호를 예측하는 기능이 아니에요.",
        },
        {
          title: "당첨 내역은 생성한 번호의 대조 결과예요",
          description:
            "생성한 번호를 해당 회차의 추첨 결과와 비교해요. 일치하는 번호 개수로 등수를 구분하고, 번호 5개가 맞으면 보너스 번호도 확인해요.",
          note: lotteryPurchaseNotice,
        },
        {
          title: "추첨 당일에는 잠시 쉬어가요",
          description: (
            <>
              매주 토요일{" "}
              <strong className="font-semibold text-foreground">
                20:00~23:30
              </strong>
              에는 결과 반영과 다음 회차 준비를 위해 생성을 멈춰요. 기존 번호와
              목록은 계속 볼 수 있어요.
            </>
          ),
          note: "추첨 방송은 토요일 20:35경이며, 방송 일정에 따라 달라질 수 있어요.",
        },
      ]}
      details={{
        summary: "최근 많이 나온 번호 기준 보기",
        content: (
          <div className="space-y-3 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
            <p>
              최근 100회 추첨에서 각 번호가 나온 횟수를 집계해요. 보너스 번호는
              제외해요.
            </p>
            <p>
              많이 나온 상위 20개 번호 안에서 선택한 조건에 맞춰 번호를 골라요.
              횟수가 같으면 작은 번호를 먼저 포함해요.
            </p>
          </div>
        ),
      }}
    />
  );
}
