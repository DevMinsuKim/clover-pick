import CLogo from "../../../../public/images/combination_logo.svg";

type Props = {
  className?: string;
};

export default function CombinationLogo({ className }: Props) {
  return <CLogo className={className} />;
}
