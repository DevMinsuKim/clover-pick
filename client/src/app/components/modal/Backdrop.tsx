import React from "react";

type BackDropType = {
  children: React.ReactNode;
  alertMdoalHandler: () => void;
};

export default function Backdrop({
  children,
  alertMdoalHandler,
}: BackDropType) {
  return <div onClick={alertMdoalHandler}>{children}</div>;
}
