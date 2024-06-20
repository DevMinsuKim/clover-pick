"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";

interface LottoNumbers {
  winning_numbers: number[][];
}

interface LottoCount {
  count: number;
}

const fetchLottoNumbers = async ({
  count,
}: LottoCount): Promise<LottoNumbers> => {
  try {
    const { data } = await axios.post<LottoNumbers>("/api/lotto/numbers", {
      count,
    });
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "서버에서 에러가 발생했습니다.",
      );
    } else {
      throw new Error("예기치 않은 오류가 발생했습니다.");
    }
  }
};

export default function useLottoNumbers() {
  return useMutation({
    mutationFn: fetchLottoNumbers,
  });
}
