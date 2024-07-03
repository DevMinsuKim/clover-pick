interface errorMessageProps {
  title: string;
  description: string;
}

export const errorMessage = (errorCode: string): errorMessageProps => {
  switch (errorCode) {
    case "1000":
      return {
        title: "데이터를 로드하는데 실패했습니다.",
        description: "잠시 후 다시 시도해 주세요.",
      };
    case "1101":
      return {
        title: "로또 번호 생성 횟수는 최대 5회까지 가능합니다.",
        description: "",
      };
    case "2000":
      return {
        title: "서버에서 오류가 발생했습니다.",
        description:
          "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n잠시 후 다시 시도해 주세요.",
      };
    default:
      return {
        title: "이용에 불편을 드려 죄송합니다.",
        description:
          "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n잠시 후 다시 시도해 주세요.",
      };
  }
};
