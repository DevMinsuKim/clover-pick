import React from "react";

export default function LottoBgSelect(number: number) {
  let backgroundColor = "";

  if (number >= 1 && number <= 10) {
    backgroundColor = "bg-yellow-400";
  } else if (number >= 11 && number <= 20) {
    backgroundColor = "bg-blue-400";
  } else if (number >= 21 && number <= 30) {
    backgroundColor = "bg-red-400";
  } else if (number >= 31 && number <= 40) {
    backgroundColor = "bg-gray-400";
  } else if (number >= 41 && number <= 45) {
    backgroundColor = "bg-green-400";
  } else if (number === 0) {
    backgroundColor = "bg-white";
  }

  return backgroundColor;
}
