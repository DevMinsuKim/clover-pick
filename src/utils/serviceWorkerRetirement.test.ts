import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const source = readFileSync(
  new URL("../../public/sw.js", import.meta.url),
  "utf8",
);

function worker(cacheNames: string[]) {
  const handlers = new Map<
    string,
    (event: { waitUntil: (task: Promise<unknown>) => void }) => void
  >();
  const scope = "https://www.cloverpick.com/";
  const unregister = vi.fn().mockResolvedValue(true);
  const claim = vi.fn().mockResolvedValue(undefined);
  const skipWaiting = vi.fn().mockResolvedValue(undefined);
  const cacheStorage = {
    keys: vi.fn().mockResolvedValue(cacheNames),
    delete: vi.fn().mockResolvedValue(true),
  };
  runInNewContext(source, {
    caches: cacheStorage,
    self: {
      addEventListener: (
        type: string,
        callback: typeof handlers extends Map<string, infer T> ? T : never,
      ) => handlers.set(type, callback),
      skipWaiting,
      clients: { claim },
      registration: { scope, unregister },
    },
  });
  async function dispatch(type: string) {
    let task: Promise<unknown> | undefined;
    handlers.get(type)?.({
      waitUntil: (value) => {
        task = value;
      },
    });
    await task;
  }
  return { handlers, unregister, claim, skipWaiting, cacheStorage, dispatch };
}

describe("기존 서비스 워커 종료", () => {
  it("즉시 활성화를 요청하고 fetch 처리기를 등록하지 않는다", async () => {
    const instance = worker([]);
    await instance.dispatch("install");
    expect(instance.skipWaiting).toHaveBeenCalledOnce();
    expect(instance.handlers.has("fetch")).toBe(false);
  });

  it("기존 앱 캐시만 삭제하고 다른 캐시는 보존한 뒤 등록을 해제한다", async () => {
    const precache = "workbox-precache-v2-https://www.cloverpick.com/";
    const instance = worker([
      "start-url",
      "next-data",
      precache,
      "user-content",
      "workbox-precache-v2-https://www.cloverpick.com/another-app/",
    ]);
    await instance.dispatch("activate");
    expect(
      instance.cacheStorage.delete.mock.calls.map(([name]) => name),
    ).toEqual(["start-url", "next-data", precache]);
    expect(instance.claim).toHaveBeenCalledOnce();
    expect(instance.unregister).toHaveBeenCalledOnce();
  });

  it("캐시 삭제에 실패해도 등록은 해제한다", async () => {
    const instance = worker(["next-data"]);
    instance.cacheStorage.delete.mockRejectedValue(
      new Error("Cache unavailable"),
    );
    await instance.dispatch("activate");
    expect(instance.unregister).toHaveBeenCalledOnce();
  });
});
