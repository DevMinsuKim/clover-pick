import { queryOptions } from "@tanstack/react-query";
import { getHome } from "@/server/home/homeActions";

export const getHomeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHome(),
  staleTime: 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
});
