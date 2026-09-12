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

describe("서버와 브라우저의 QueryClient 관리", () => {
  it("서버 요청마다 별도 클라이언트를 생성해 캐시를 격리한다", () => {
    const first = client();
    const second = client();
    first.setQueryData(["private"], "first request");
    expect(second).not.toBe(first);
    expect(second.getQueryData(["private"])).toBeUndefined();
  });

  it("브라우저에서는 같은 클라이언트를 재사용한다", () => {
    vi.mocked(environmentManager.isServer).mockReturnValue(false);
    expect(client()).toBe(client());
  });

  it("캐시 유효 시간 안에는 재조회하지 않고 서버 데이터를 직렬화한다", async () => {
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
});
