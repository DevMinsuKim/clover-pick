export const lottoNumberBg = (number: number) => {
  if (number === 0) {
    return "bg-[#aaaaaa]";
  } else if (number <= 10) {
    return "bg-[#fbc400]";
  } else if (number <= 20) {
    return "bg-[#69c8f2]";
  } else if (number <= 30) {
    return "bg-[#ff7272]";
  } else if (number <= 40) {
    return "bg-[#aaaaaa]";
  } else if (number <= 45) {
    return "bg-[#b0d840]";
  }
};
