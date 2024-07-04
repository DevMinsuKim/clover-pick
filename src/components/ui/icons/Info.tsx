import { BsInfo } from "react-icons/bs";

type Props = {
  className?: string;
};

export default function Info({ className }: Props) {
  return <BsInfo className={className} />;
}
