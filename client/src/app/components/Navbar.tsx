"use client";
import React, { useEffect, useState } from "react";
import { WiDaySunny } from "react-icons/wi";
import { MdNightlight } from "react-icons/md";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const pathName = usePathname();

  const [isDarkModeOn, setIsDarkModeOn] = useState(false);

  useEffect(() => {
    setIsDarkModeOn(document.body.classList.contains("dark"));
  }, []);

  const handleClick = () => {
    if (isDarkModeOn) {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
      setIsDarkModeOn(false);
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "true");
      setIsDarkModeOn(true);
    }
  };
  return (
    <div className="flex justify-center items-center">
      <nav>
        <ul className="flex items-center gap-4 p-2">
          <li
            className={`flex w-24 cursor-pointer items-center justify-center  ${
              pathName === "/" ? "bg-indigo-600 p-2 rounded-md" : ""
            }`}
          >
            <Link href="/">
              <p
                className={`text-lg ${
                  pathName === "/"
                    ? "text-white"
                    : "text-slate-500 dark:text-slate-300 hover:text-slate-900 hover:dark:text-white"
                }`}
              >
                로또 6/45
              </p>
            </Link>
          </li>

          <li>
            {isDarkModeOn ? (
              <WiDaySunny
                className={"flex w-12 h-12 cursor-pointer text-amber-300 "}
                onClick={handleClick}
              />
            ) : (
              <MdNightlight
                className={"flex w-10 h-12 cursor-pointer text-amber-300 "}
                onClick={handleClick}
              />
            )}
          </li>

          <li
            className={`flex w-32 cursor-pointer items-center justify-center ${
              pathName === "/pension" ? "bg-indigo-600 p-2 rounded-md" : ""
            }`}
          >
            <Link href="/pension">
              <p
                className={`text-lg ${
                  pathName === "/pension"
                    ? "text-white"
                    : "text-slate-500 dark:text-slate-300 hover:text-slate-900 hover:dark:text-white"
                }`}
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
