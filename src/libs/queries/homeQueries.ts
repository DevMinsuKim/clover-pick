import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

interface Home {
  lottoCreateCount: number;
  lottoCreateList: {
    draw_number: number;
    winning_number1: number;
    winning_number2: number;
    winning_number3: number;
    winning_number4: number;
    winning_number5: number;
    winning_number6: number;
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
