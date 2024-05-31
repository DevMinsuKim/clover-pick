import { IoSunnyOutline } from "react-icons/io5";

type Props = {
  className?: string;
};

export default function SunIcon({ className }: Props) {
  return <IoSunnyOutline className={className} />;
}
