import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

interface Lotto {
  draw_number: number;
}

interface LottoHistory {
  draw_number: number;
  winning_number1: number;
  winning_number2: number;
  winning_number3: number;
  winning_number4: number;
  winning_number5: number;
  winning_number6: number;
  created: string;
}

interface getLottoWinning {
  draw_number: number;
  ranking: number;
  winning_number1: number;
  winning_number2: number;
  winning_number3: number;
  winning_number4: number;
  winning_number5: number;
  winning_number6: number;
  winning_created: string;
}

interface LottoGeneratorNumbers {
  lottoNumbers: {
    numbers: number[];
  }[];
}

interface LottoRepeat {
  repeat: number;
}

export const getLotto = queryOptions({
  queryKey: ["lotto"],
  queryFn: async () => {
    const { data } = await axiosInstance.get<Lotto>("/api/lotto");
    return data;
  },
});

export const getLottoHistory = queryOptions({
  queryKey: ["lottoHistory"],
  queryFn: async () => {
    const { data } =
      await axiosInstance.get<LottoHistory[]>("/api/lotto/history");
    return data;
  },
});

export const getLottoWinning = queryOptions({
  queryKey: ["lottoWinning"],
  queryFn: async () => {
    const { data } =
      await axiosInstance.get<getLottoWinning[]>("/api/lotto/winning");
    return data;
  },
});

export const createLottoNumbers = async (repeat: LottoRepeat) => {
  const { data } = await axiosInstance.post<LottoGeneratorNumbers>(
    "/api/lotto",
    repeat,
  );
  return data;
};
