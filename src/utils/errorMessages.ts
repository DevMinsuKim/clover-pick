interface errorMessageProps {
  title: string;
  description: string;
  btnText: string;
}

export const errorMessage = (errorCode: string): errorMessageProps => {
  switch (errorCode) {
    case "1":
      return {
        title: "로또 번호 생성 중 오류가 발생했습니다.",
        description: "잠시 후 다시 시도해 주세요.",
        btnText: "확인",
      };
    case "2":
      return {
        title: "로또 번호 복사 중 오류가 발생했습니다.",
        description: "잠시 후 다시 시도해 주세요.",
        btnText: "확인",
      };
    case "3":
      return {
        title: "서비스 이용 제한 시간입니다.",
        description:
          "매주 토요일 저녁 20시부터 22시까지는 서비스를 이용할 수 없습니다.\n이후에 다시 시도해 주세요.",
        btnText: "확인",
      };
    case "4":
      return {
        title: "연금복권 번호 생성 중 오류가 발생했습니다.",
        description: "잠시 후 다시 시도해 주세요.",
        btnText: "확인",
      };
    case "5":
      return {
        title: "연금복권 번호 복사 중 오류가 발생했습니다.",
        description: "잠시 후 다시 시도해 주세요.",
        btnText: "확인",
      };
    case "6":
      return {
        title: "서비스 이용 제한 시간입니다.",
        description:
          "매주 목요일 오후 17시부터 24시까지는 서비스를 이용할 수 없습니다.\n이후에 다시 시도해 주세요.",
        btnText: "확인",
      };

    case "1000":
      return {
        title: "데이터를 로드하는데 실패했습니다.",
        description: "잠시 후 다시 시도해 주세요.",
        btnText: "다시 시도하기",
      };
    case "1101":
      return {
        title: "로또 번호 생성 횟수는 최대 5회까지 가능합니다.",
        description: "",
        btnText: "확인",
      };
    case "1102":
      return {
        title: "서비스 이용 제한 시간입니다.",
        description:
          "매주 토요일 오후 8시부터 10시까지는 서비스를 이용할 수 없습니다.\n이후에 다시 시도해 주세요.",
        btnText: "확인",
      };

    case "2000":
      return {
        title: "서버에서 오류가 발생했습니다.",
        description:
          "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n잠시 후 다시 시도해 주세요.",
        btnText: "다시 시도하기",
      };
    default:
      return {
        title: "이용에 불편을 드려 죄송합니다.",
        description:
          "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n잠시 후 다시 시도해 주세요.",
        btnText: "다시 시도하기",
      };
  }
};
