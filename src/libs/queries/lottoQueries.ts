import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

interface Lotto {
  draw_number: number;
}

interface LottoGeneratorNumbers {
  winning_numbers: number[][];
}

interface LottoRepeat {
  repeat: number;
}

export const getDrawLottoNumber = queryOptions({
  queryKey: ["lotto"],
  queryFn: async () => {
    const { data } = await axiosInstance.get<Lotto>("/api/lotto");
    return data;
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lotto`);
    // const data: Lotto = await response.json();
    // return data;
  },
});

export const createLottoNumbers = async (repeat: LottoRepeat) => {
  const { data } = await axiosInstance.post<LottoGeneratorNumbers>(
    "/api/lotto",
    {
      repeat,
    },
  );
  return data;
};
