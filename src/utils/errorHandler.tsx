import * as Sentry from "@sentry/nextjs";
import { isAxiosError } from "axios";
import { errorMessage } from "./errorMessages";

interface errorHandlerProps {
  title: string;
  description: string;
}

export const errorHandler = (error: Error): errorHandlerProps => {
  if (error) {
    Sentry.captureException(error);

    // if (process.env.NODE_ENV === "development") {
    //   console.error(error);
    // }

    if (isAxiosError(error)) {
      if (error.response?.data?.error?.code) {
        const errorCode = error.response.data.error.code;
        const { title, description } = errorMessage(errorCode);
        return {
          title: title,
          description: description,
        };
      } else {
        return {
          title: "서버에서 오류가 발생했습니다.",
          description:
            "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n잠시 후 다시 시도해 주세요.",
        };
      }
    } else {
      return {
        title: "이용에 불편을 드려 죄송합니다.",
        description:
          "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n잠시 후 다시 시도해 주세요.",
      };
    }
  } else {
    Sentry.captureMessage("정의 되지 않은 에러가 발생했습니다.");
    return {
      title: "이용에 불편을 드려 죄송합니다.",
      description:
        "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n잠시 후 다시 시도해 주세요.",
    };
  }
};
