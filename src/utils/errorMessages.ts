export const getErrorMessage = (error: Error) => {
  const errorMessage = error.message;

  switch (true) {
    case errorMessage.includes("Network"):
      return {
        title: "네트워크 오류가 발생했습니다.",
        description: "인터넷 연결을 확인하고 다시 시도해 주세요.",
      };
    case errorMessage.includes("Timeout"):
      return {
        title: "요청 시간이 초과되었습니다. ",
        description: "잠시 후 다시 시도해 주세요.",
      };
    case errorMessage.includes("Authorization"):
      return {
        title: "현재 페이지에 접근할 수 있는 권한이 없습니다.",
        description: "",
      };
    case errorMessage.includes("Internal Server Error"):
      return {
        title: "서버에 문제가 발생했습니다.",
        description:
          "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n 잠시 후 다시 시도해 주세요.",
      };
    case errorMessage.includes("Bad Request"):
      return {
        title: "잘못된 요청입니다.",
        description: "입력한 정보를 확인하고 다시 시도해 주세요.",
      };
    default:
      return {
        title: "이용에 불편을 드려 죄송합니다.",
        description:
          "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n 잠시 후 다시 시도해 주세요.",
      };
  }
};
