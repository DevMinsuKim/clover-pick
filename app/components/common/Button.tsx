import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`rounded bg-primary px-4 py-3 font-bold text-white transition duration-200 ease-in-out hover:bg-primaryHover ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
