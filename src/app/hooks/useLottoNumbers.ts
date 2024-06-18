"use client";

import { UseMutationResult, useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

interface LottoNumbers {
  numbers: number;
}

interface NumSets {
  numSets: number;
}

const fetchLottoNumbers = async ({
  numSets,
}: NumSets): Promise<LottoNumbers> => {
  try {
    const { data } = await axios.post<LottoNumbers>("/api/lotto", { numSets });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
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
