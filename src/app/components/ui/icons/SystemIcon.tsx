import { HiOutlineComputerDesktop } from "react-icons/hi2";

type Props = {
  className?: string;
};

export default function SystemIcon({ className }: Props) {
  return <HiOutlineComputerDesktop className={className} />;
}
