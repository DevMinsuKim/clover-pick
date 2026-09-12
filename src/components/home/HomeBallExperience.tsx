"use client";

import {
  type ComponentType,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HiArrowPath, HiPause, HiPlay, HiXMark } from "react-icons/hi2";
import type { BallMixProps } from "./BallMix";

const controlClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-divider bg-background px-4 py-3 text-sm font-semibold hover:bg-content1Hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600";

export default function HomeBallExperience() {
  const [open, setOpen] = useState(false);
  const [Scene, setScene] = useState<ComponentType<BallMixProps> | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [running, setRunning] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const area = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const attempt = useRef(0);
  const onReady = useCallback(() => setPhase("ready"), []);
  const onFailure = useCallback(() => setPhase("error"), []);

  useEffect(() => {
    if (!open) return;
    const onVisibility = () =>
      setTabVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      if (media.matches) setRunning(false);
    };
    media.addEventListener("change", onMotion);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    if (area.current) observer.observe(area.current);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMotion);
    };
  }, [open]);

  useEffect(
    () => () => {
      attempt.current++;
    },
    [],
  );

  useEffect(() => {
    if (!open || phase !== "loading") return;
    const timeout = window.setTimeout(onFailure, 20_000);
    return () => window.clearTimeout(timeout);
  }, [open, phase, onFailure]);

  async function start() {
    const request = ++attempt.current;
    setOpen(true);
    setPhase("loading");
    setRunning(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setResetKey((value) => value + 1);
    try {
      // Check before mounting Canvas: renderer setup errors happen asynchronously.
      const context = document.createElement("canvas").getContext("webgl2");
      if (!context) {
        setPhase("error");
        return;
      }
      context.getExtension("WEBGL_lose_context")?.loseContext();
      if (Scene) return;
      // Import on explicit activation, never on hover or initial home render.
      const module = await import("./BallMix");
      if (request === attempt.current) setScene(() => module.default);
    } catch {
      if (request === attempt.current) setPhase("error");
    }
  }

  function close() {
    attempt.current++;
    setOpen(false);
    setRunning(false);
    setVisible(false);
    trigger.current?.focus({ preventScroll: true });
  }
  const active = running && visible && tabVisible && phase !== "error";
  return (
    <section
      aria-labelledby="home-experience-title"
      className="mb-14 rounded-2xl border border-divider bg-content1 p-5 dark:border-zinc-600 sm:mb-20 sm:p-7"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-green-700 dark:text-green-400">
            직접 움직여보는 3D 체험
          </p>
          <h2
            id="home-experience-title"
            className="mt-2 text-lg font-bold sm:text-xl"
          >
            잠깐, 공을 섞어볼까요?
          </h2>
          <p className="mt-2 text-sm leading-6 text-content3">
            추첨 방송처럼, 알록달록한 번호 공을 직접 움직여보세요.
          </p>
        </div>
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls="home-ball-experience"
          onClick={() => (open ? close() : void start())}
          className={`${controlClass} shrink-0`}
        >
          {open ? (
            <HiXMark aria-hidden="true" className="size-4" />
          ) : (
            <HiPlay aria-hidden="true" className="size-4" />
          )}
          {open ? "체험 닫기" : "추첨기 체험하기"}
        </button>
      </div>
      <div id="home-ball-experience" hidden={!open}>
        {open && (
          <>
            <div
              ref={area}
              className="relative mt-6 h-80 overflow-hidden rounded-2xl bg-[#edf6f0] dark:bg-[#14251e] sm:h-[440px]"
              aria-busy={phase === "loading"}
            >
              {phase === "error" ? (
                <div
                  role="alert"
                  className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center"
                >
                  <p className="text-sm leading-6">
                    이 환경에서는 3D 체험을 불러오지 못했어요.
                    <br />
                    번호 생성은 계속 이용할 수 있어요.
                  </p>
                  <button
                    type="button"
                    onClick={() => void start()}
                    className={controlClass}
                  >
                    다시 시도하기
                  </button>
                </div>
              ) : Scene ? (
                <ErrorBoundary
                  key={resetKey}
                  onError={onFailure}
                  fallback={
                    <p role="alert" className="p-6 text-center text-sm">
                      3D 체험을 불러오지 못했어요.
                    </p>
                  }
                >
                  <Scene
                    running={active}
                    onReady={onReady}
                    onFailure={onFailure}
                  />
                </ErrorBoundary>
              ) : null}
              {phase === "loading" && (
                <div
                  role="status"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#edf6f0] text-sm text-content3 dark:bg-[#14251e]"
                >
                  3D 공간을 준비하고 있어요…
                </div>
              )}
              {phase === "ready" && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold"
                >
                  {active ? "공을 섞고 있어요" : "잠시 멈췄어요"}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                id="ball-experience-help"
                className="text-xs leading-6 text-content3 sm:text-sm"
              >
                공 근처를 클릭하거나 가볍게 탭해 보세요.
                <br />
                주변 공이 팡! 흩어져요. 위아래로 쓸면 페이지가 스크롤돼요.
                <span className="sr-only">
                  키보드로는 체험 영역에서 Enter 또는 스페이스 키를 누르세요.
                </span>
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                <button
                  type="button"
                  disabled={phase !== "ready"}
                  onClick={() => setRunning((value) => !value)}
                  className={controlClass}
                >
                  {running ? (
                    <HiPause aria-hidden="true" className="size-4" />
                  ) : (
                    <HiPlay aria-hidden="true" className="size-4" />
                  )}
                  {running ? "멈추기" : "공 섞기"}
                </button>
                <button
                  type="button"
                  disabled={phase !== "ready"}
                  onClick={() => {
                    setPhase("loading");
                    setResetKey((value) => value + 1);
                    setRunning(true);
                  }}
                  className={controlClass}
                >
                  <HiArrowPath aria-hidden="true" className="size-4" />
                  다시 섞기
                </button>
              </div>
            </div>
            <p role="status" className="sr-only">
              {phase === "ready"
                ? active
                  ? "공을 섞고 있어요."
                  : "3D 체험이 일시 정지됐어요."
                : ""}
            </p>
            <p className="mt-4 border-t border-divider pt-4 text-xs leading-5 text-content3 dark:border-zinc-600">
              재미로 즐기는 3D 체험이에요. 실제 복권 추첨과 무관하며, 체험 속
              번호는 저장되지 않아요.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
