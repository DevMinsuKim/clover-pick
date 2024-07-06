import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";

interface Pension {
  draw_number: number;
}

interface PensionHistory {
  draw_number: number;
  winning_number1: number;
  winning_number2: number;
  winning_number3: number;
  winning_number4: number;
  winning_number5: number;
  winning_number6: number;
  created: string;
}

interface getPensionWinning {
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

interface PensionGeneratorNumbers {
  winning_numbers: number[][];
}

interface CreatePension {
  repeat: number;
  isAllGroup: boolean;
}

export const getPension = queryOptions({
  queryKey: ["pension"],
  queryFn: async () => {
    const { data } = await axiosInstance.get<Pension>("/api/pension");
    return data;
  },
});

export const getPensionHistory = queryOptions({
  queryKey: ["pensionHistory"],
  queryFn: async () => {
    const { data } = await axiosInstance.get<PensionHistory[]>(
      "/api/pension/history",
    );
    return data;
  },
});

export const getPensionWinning = queryOptions({
  queryKey: ["pensionWinning"],
  queryFn: async () => {
    const { data } = await axiosInstance.get<getPensionWinning[]>(
      "/api/pension/winning",
    );
    return data;
  },
});

export const createPensionNumbers = async ({
  repeat,
  isAllGroup,
}: CreatePension) => {
  const { data } = await axiosInstance.post<PensionGeneratorNumbers>(
    "/api/pension",
    { repeat, isAllGroup },
  );
  return data;
};
