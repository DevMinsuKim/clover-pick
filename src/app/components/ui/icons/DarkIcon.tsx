import { MdDarkMode } from "react-icons/md";
import { CiDark } from "react-icons/ci";

type Props = {
  className?: string;
};

export default function DarkIcon({ className }: Props) {
  return <CiDark className={className} />;
}
