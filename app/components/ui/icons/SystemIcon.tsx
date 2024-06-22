import { CiDesktop } from "react-icons/ci";

type Props = {
  className?: string;
};

export default function SystemIcon({ className }: Props) {
  return <CiDesktop className={className} />;
}
