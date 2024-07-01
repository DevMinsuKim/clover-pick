type Props = {
  className?: string;
};

export default function Loader({ className }: Props) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`h-8 w-8 animate-spin rounded-full border-2 border-divider border-t-primary ${className}`}
      />
    </div>
  );
}
