import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
import { ROUTES } from "@/constants/routes";
import { primaryActionClassName } from "../common/actionStyles";

export default function HomeActions() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <Link href={ROUTES.LOTTO_645} className={primaryActionClassName}>
        로또 6/45 생성하기{" "}
        <HiArrowRight aria-hidden="true" className="size-4 shrink-0" />
      </Link>
      <Link href={ROUTES.PENSION_720} className={primaryActionClassName}>
        연금복권 720+ 생성하기{" "}
        <HiArrowRight aria-hidden="true" className="size-4 shrink-0" />
      </Link>
    </div>
  );
}
