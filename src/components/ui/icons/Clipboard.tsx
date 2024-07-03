import { HiOutlineClipboardList } from "react-icons/hi";

type Props = {
  className?: string;
};

export default function Clipboard({ className }: Props) {
  return <HiOutlineClipboardList className={className} />;
}
