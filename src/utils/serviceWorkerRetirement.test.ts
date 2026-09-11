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

describe("retired service worker", () => {
  it("takes over old registrations without installing a fetch handler", async () => {
    const instance = worker([]);
    await instance.dispatch("install");
    expect(instance.skipWaiting).toHaveBeenCalledOnce();
    expect(instance.handlers.has("fetch")).toBe(false);
  });

  it("removes legacy caches, preserves unrelated caches and unregisters", async () => {
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

  it("still unregisters when cache cleanup fails", async () => {
    const instance = worker(["next-data"]);
    instance.cacheStorage.delete.mockRejectedValue(
      new Error("Cache unavailable"),
    );
    await instance.dispatch("activate");
    expect(instance.unregister).toHaveBeenCalledOnce();
  });
});
