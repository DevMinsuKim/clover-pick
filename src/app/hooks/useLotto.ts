"use client";

import { useQuery } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";

interface Lotto {
  draw_number: number;
}

const fetchLotto = async (): Promise<Lotto> => {
  try {
    const { data } = await axios.get("/api/lotto");
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

export default function useLotto() {
  return useQuery({ queryKey: ["lotto"], queryFn: fetchLotto });
}
