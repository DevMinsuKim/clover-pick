"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";

interface LottoGeneratorNumbers {
  winning_numbers: number[][];
}

interface LottoCount {
  count: number;
}

const fetchLottoGenerator = async ({
  count,
}: LottoCount): Promise<LottoGeneratorNumbers> => {
  try {
    const { data } = await axios.post<LottoGeneratorNumbers>(
      "/api/lotto/generator",
      {
        count,
      },
    );
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          "서버에서 에러가 발생했습니다.\n나중에 다시 시도하십시오.",
      );
    } else {
      throw new Error(
        "예기치 않은 오류가 발생했습니다.\n나중에 다시 시도하십시오.",
      );
    }
  }
};

export default function useLottoGenerator() {
  return useMutation({
    mutationFn: fetchLottoGenerator,
  });
}
