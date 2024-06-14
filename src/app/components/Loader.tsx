type Props = {
  className?: string;
};

export default function Loader({ className }: Props) {
  return (
    <div
      className={`animate-spin rounded-full border-divider border-t-primary ${className}`}
    />
  );
}
