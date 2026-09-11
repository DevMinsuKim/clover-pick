import {
  dehydrate,
  environmentManager,
  noop,
  type QueryClient,
} from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getQueryClient } from "./getQueryClient";

const clients: QueryClient[] = [];
function client() {
  const instance = getQueryClient();
  clients.push(instance);
  return instance;
}

beforeEach(() => {
  vi.spyOn(environmentManager, "isServer").mockReturnValue(true);
});
afterEach(() => {
  for (const instance of clients) instance.clear();
  clients.length = 0;
  vi.restoreAllMocks();
});

describe("QueryClient SSR migration", () => {
  it("isolates query data between server requests", () => {
    const first = client();
    const second = client();
    first.setQueryData(["private"], "first request");
    expect(second).not.toBe(first);
    expect(second.getQueryData(["private"])).toBeUndefined();
  });

  it("reuses one client during browser renders", () => {
    vi.mocked(environmentManager.isServer).mockReturnValue(false);
    expect(client()).toBe(client());
  });

  it("dehydrates data and honors staleTime without refetching fresh data", async () => {
    const instance = client();
    const queryFn = vi.fn().mockResolvedValue({ draw_number: 1234 });
    const options = { queryKey: ["round"], queryFn };
    await instance.query(options).catch(noop);
    await instance.query(options).catch(noop);
    expect(queryFn).toHaveBeenCalledOnce();
    expect(dehydrate(instance).queries[0].state.data).toEqual({
      draw_number: 1234,
    });
  });

  it("keeps successful queries when a parallel prefetch fails and allows retry", async () => {
    const instance = client();
    const failedQuery = vi
      .fn()
      .mockRejectedValue(new Error("Temporary fetch error"));
    await expect(
      Promise.all([
        instance
          .query({ queryKey: ["good"], queryFn: async () => 1 })
          .catch(noop),
        instance
          .query({ queryKey: ["retry"], queryFn: failedQuery })
          .catch(noop),
      ]),
    ).resolves.toEqual([1, undefined]);
    expect(dehydrate(instance).queries.map(({ queryKey }) => queryKey)).toEqual(
      [["good"]],
    );
    failedQuery.mockResolvedValue(2);
    await instance
      .query({ queryKey: ["retry"], queryFn: failedQuery })
      .catch(noop);
    expect(instance.getQueryData(["retry"])).toBe(2);
  });
});
