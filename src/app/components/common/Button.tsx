import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onclick?: () => void;
  className?: string;
}

export default function Button({ children, onclick, className }: ButtonProps) {
  return (
    <button
      onClick={onclick}
      className={`hover:bg-primaryHover rounded bg-primary px-4 py-3 font-bold text-white transition duration-200 ease-in-out ${className}`}
    >
      {children}
    </button>
  );
}
