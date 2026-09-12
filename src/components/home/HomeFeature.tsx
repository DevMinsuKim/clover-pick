import {
  HiArrowsRightLeft,
  HiChatBubbleLeftRight,
  HiCheck,
} from "react-icons/hi2";

const methods = [
  {
    title: "고민 없이, 랜덤 생성",
    description:
      "특별히 떠오르는 번호가 없다면 게임 수만 고르세요. 한 번에 최대 5게임을 간편하게 만들 수 있어요.",
    icon: HiArrowsRightLeft,
    steps: ["게임 수 선택", "번호 생성"],
    note: "한 번에 만든 게임끼리는 같은 조합이 나오지 않아요.",
  },
  {
    title: "내 조건으로, 맞춤 생성",
    description:
      "빠른 조건을 고르거나 원하는 조건을 문장으로 적어보세요. AI가 정리한 조건을 확인한 뒤 번호를 만들어요.",
    icon: HiChatBubbleLeftRight,
    steps: ["조건 입력", "조건 확인", "번호 생성"],
    note: "포함·제외할 숫자부터 앞·끝자리까지, 복권별로 선택해요.",
  },
];
export default function HomeFeature() {
  return (
    <section aria-labelledby="home-methods-title" className="py-14 sm:py-20">
      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
        고르는 방법은 두 가지
      </p>
      <h2
        id="home-methods-title"
        className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
      >
        가볍게 골라도, 취향을 담아도 좋아요.
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2 sm:gap-6">
        {methods.map(({ title, description, icon: Icon, steps, note }) => (
          <article
            key={title}
            className="flex flex-col rounded-2xl border border-divider bg-content1 p-5 dark:border-zinc-600 sm:p-7"
          >
            <Icon
              aria-hidden="true"
              className="size-7 text-green-700 dark:text-green-400"
            />
            <h3 className="mt-5 text-lg font-bold sm:text-xl">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-content3 sm:text-base">
              {description}
            </p>
            <ol className="mt-6 flex flex-wrap gap-x-4 gap-y-3 border-t border-divider pt-5 text-xs font-semibold dark:border-zinc-600 sm:text-sm">
              {steps.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span
                    className="flex size-5 items-center justify-center rounded-full bg-content1Hover text-xs tabular-nums"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-auto flex items-start gap-2 pt-5 text-xs leading-5 text-content3">
              <HiCheck
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-green-700 dark:text-green-400"
              />
              {note}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
