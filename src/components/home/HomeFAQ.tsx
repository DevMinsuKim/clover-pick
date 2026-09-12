import Accordion from "../common/Accordion";

const faqs = [
  {
    question: "회원가입이나 이용 요금이 있나요?",
    answer:
      "회원가입 없이 무료로 번호를 생성할 수 있어요. 두 복권 모두 한 번에 최대 5게임까지 만들 수 있고, 맞춤 생성에는 최대 300자까지 입력할 수 있어요.",
  },
  {
    question: "AI가 당첨 번호를 예측하나요?",
    answer:
      "아니요. AI는 입력한 문장을 번호 조건으로 정리해요. 조건을 확인하면 그 안에서 번호를 무작위로 골라요. 특정 생성 방식이나 과거 출현 횟수에 따라 당첨확률이 높아지지는 않아요.",
  },
  {
    question: "생성한 번호는 어디에서 다시 볼 수 있나요?",
    answer:
      "각 복권 페이지의 ‘생성 목록’에서 볼 수 있어요. 이 목록은 모든 사용자가 함께 보는 공용 목록이에요. 추첨 결과가 반영되면 ‘당첨 내역’에서 생성 번호와 추첨 번호를 대조한 결과도 확인할 수 있어요.",
  },
  {
    question: "번호를 만들면 복권도 구매되나요?",
    answer:
      "생성·복사만으로 복권이 구매되지는 않아요. 실제 구매는 동행복권이나 판매점에서 별도로 진행해 주세요. 클로버픽의 당첨 내역은 실제 복권 구매나 당첨금 수령을 의미하지 않아요.",
  },
  {
    question: "번호 생성을 잠시 쉬는 시간이 있나요?",
    answer:
      "추첨 결과 반영과 다음 회차 준비를 위해 로또는 매주 토요일 20:00~23:30, 연금복권은 매주 목요일 17:00~22:00에 생성을 멈춰요. 기존 번호와 목록은 계속 볼 수 있어요.",
  },
];

export default function HomeFAQ() {
  return (
    <section
      aria-labelledby="home-faq-title"
      className="grid gap-6 py-14 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
    >
      <div>
        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
          시작하기 전에
        </p>
        <h2
          id="home-faq-title"
          className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          궁금한 점을 모았어요.
        </h2>
        <p className="mt-4 text-sm leading-6 text-content3 sm:text-base sm:leading-7">
          처음 이용해도 편하게,
          <br />
          번호 생성부터 결과 확인까지.
        </p>
      </div>
      <div className="min-w-0 border-t border-divider dark:border-zinc-600">
        {faqs.map(({ question, answer }) => (
          <Accordion
            key={question}
            name="home-faq"
            summary={question}
            indicator="plus"
            className="border-b border-divider dark:border-zinc-600"
            summaryClassName="min-h-14 py-5 text-sm font-semibold sm:text-base"
          >
            <p className="pb-5 pr-6 text-sm leading-7 text-content3 sm:text-base">
              {answer}
            </p>
          </Accordion>
        ))}
      </div>
    </section>
  );
}
