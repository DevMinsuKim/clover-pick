export default function Loader({ className = "" }) {
  return (
    <div
      className={`border-divider h-full w-full animate-spin rounded-full border-t-primary ${className}`}
    />
  );
}
