import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import axios from "axios";

interface lotto {
  draw_number: number;
}

export const getDrawLottoNumber = queryOptions({
  queryKey: ["lotto"],
  queryFn: async () => {
    const response = await axiosInstance.get<lotto>("/lotto");
    return response.data;
  },
});
