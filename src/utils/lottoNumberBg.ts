export const lottoNumberBg = (number: number) => {
  if (number === 0) {
    return "#aaaaaa";
  } else if (number <= 10) {
    return "#fbc400";
  } else if (number <= 20) {
    return "#69c8f2";
  } else if (number <= 30) {
    return "#ff7272";
  } else if (number <= 40) {
    return "#aaaaaa";
  } else if (number <= 45) {
    return "#b0d840";
  }
};
