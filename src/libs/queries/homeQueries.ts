import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

interface Home {
  lottoCreateCount: number;
  lottoWinningCount: number;
  lottoCreateList: {
    draw_number: number;
    number1: number;
    number2: number;
    number3: number;
    number4: number;
    number5: number;
    number6: number;
    created: string;
  }[];
}

export const getHome = queryOptions({
  queryKey: ["home"],
  queryFn: async () => {
    const { data } = await axiosInstance.get<Home>("/api/home");
    return data;
  },
});
