import { HiOutlineClipboardCheck } from "react-icons/hi";

type Props = {
  className?: string;
};

export default function ClipboardCheck({ className }: Props) {
  return <HiOutlineClipboardCheck className={className} />;
}
