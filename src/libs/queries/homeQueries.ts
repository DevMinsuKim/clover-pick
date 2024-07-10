import { getHome } from "@/server/home/homeActions";
import { queryOptions } from "@tanstack/react-query";

export const getHomeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => {
    return getHome();
  },
});
