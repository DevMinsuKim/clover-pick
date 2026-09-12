import { HiArrowDown } from "react-icons/hi2";
import { lottoNumberBg } from "@/utils/lottoNumberBg";
import Clover from "../ui/icons/Clover";

const exampleNumbers = [7, 14, 21, 24, 40, 42];

export default function HomeNumberPreview() {
  return (
    <figure
      aria-labelledby="home-preview-caption"
      className="relative rounded-3xl bg-green-50 p-5 dark:bg-green-950/25 sm:p-8 lg:p-10"
    >
      <div
        aria-hidden="true"
        className="absolute right-5 top-5 rotate-12 text-green-200/70 dark:text-green-900/50"
      >
        <Clover className="size-14 sm:size-20" />
      </div>
      <figcaption
        id="home-preview-caption"
        className="relative mb-5 text-xs font-semibold tracking-wide text-green-800 dark:text-green-300"
      >
        내 말이 번호 조건이 되는, 맞춤 생성
      </figcaption>
      <div className="relative rounded-2xl border border-green-100 bg-background p-5 shadow-sm dark:border-green-900 sm:p-6">
        <span className="text-xs font-semibold text-content3">
          이렇게 입력하면
        </span>
        <blockquote className="mt-3 text-lg font-bold leading-8 sm:text-xl">
          “7과 21은 넣고,
          <br />
          30번대는 빼줘.”
        </blockquote>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-green-800 dark:text-green-300">
          <span className="rounded-md bg-green-50 px-2.5 py-1.5 dark:bg-green-950/50">
            7 · 21 포함
          </span>
          <span className="rounded-md bg-green-50 px-2.5 py-1.5 dark:bg-green-950/50">
            30~39 제외
          </span>
        </div>
        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-divider dark:bg-zinc-600" />
          <HiArrowDown className="size-4 text-content3" />
          <span className="h-px flex-1 bg-divider dark:bg-zinc-600" />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">조건에 맞는 번호</span>
          <span className="text-content3">1게임 예시</span>
        </div>
        <div
          role="img"
          aria-label={`예시 로또 번호: ${exampleNumbers.join(", ")}`}
          className="mt-4 flex items-center justify-between gap-1"
        >
          {exampleNumbers.map((number) => (
            <span
              key={number}
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-zinc-900 tabular-nums xs:size-9 xs:text-base sm:size-11 sm:text-lg"
              style={{ backgroundColor: lottoNumberBg(number) }}
            >
              {number}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-xs leading-5 text-green-900/75 dark:text-green-200/70">
        조건을 확인한 뒤, 그 안에서 무작위로 골라요.
        <br />
        화면 이해를 돕기 위한 예시예요.
      </p>
    </figure>
  );
}
