"use client";
import React, { useEffect, useState } from "react";
import { WiDaySunny } from "react-icons/wi";
import { MdNightlight } from "react-icons/md";
import { GrPersonalComputer } from "react-icons/gr";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function Navbar() {
  const pathName = usePathname();

  const { resolvedTheme, theme, setTheme } = useTheme();

  return (
    <div className="flex justify-center items-center">
      <nav>
        <ul className="flex items-center p-3">
          <li
            className={`flex cursor-pointer items-center justify-center  ${
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

          <li>
            {resolvedTheme === "light" ? (
              <WiDaySunny
                className={
                  "flex w-6 h-6 md:w-8 sm:h-8 cursor-pointer text-amber-300 mx-4"
                }
                onClick={() => setTheme("dark")}
              />
            ) : (
              <MdNightlight
                className={
                  "flex w-4 h-4 md:w-6 sm:h-6 cursor-pointer text-amber-500 mx-4"
                }
                onClick={() => setTheme("light")}
              />
            )}
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
