import { FaArrowUp } from "react-icons/fa";

type Props = {
  className?: string;
};

export default function ArrowUp({ className }: Props) {
  return <FaArrowUp className={className} />;
}
