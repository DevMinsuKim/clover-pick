import { queryOptions } from "@tanstack/react-query";
import { getHome } from "@/server/home/homeActions";

export const getHomeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => {
    return getHome();
  },
});
