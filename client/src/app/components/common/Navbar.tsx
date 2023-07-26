"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeButton from "./ThemeButton";

export default function Navbar() {
  const pathName = usePathname();

  return (
    <div className="flex justify-center">
      <nav>
        <ul className="flex items-center p-3">
          <li
            className={`flex cursor-pointer items-center justify-center ml-5  ${
              pathName === "/" ? "bg-indigo-600 p-2 rounded-md" : "p-2"
            }`}
          >
            <Link href="/">
              <p
                className={`text-sm ${
                  pathName === "/"
                    ? "text-white"
                    : "text-slate-500 dark:text-slate-300 hover:text-indigo-900 hover:dark:text-white"
                } md:text-base`}
              >
                로또 6/45
              </p>
            </Link>
          </li>

          <li className="relative items-center">
            <ThemeButton />
          </li>

          <li
            className={`flex cursor-pointer items-center justify-center ${
              pathName === "/pension" ? "bg-indigo-600 p-2 rounded-md" : "p-2"
            }`}
          >
            <Link href="/pension">
              <p
                className={`text-sm ${
                  pathName === "/pension"
                    ? "text-white"
                    : "text-slate-500 dark:text-slate-300 hover:text-indigo-900 hover:dark:text-white"
                } md:text-base`}
              >
                연금복권720+
              </p>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
