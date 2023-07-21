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
            {!isDarkModeOn ? (
              <WiDaySunny
                className={
                  "flex w-6 h-6 md:w-8 sm:h-8 cursor-pointer text-amber-300 mx-4"
                }
                onClick={handleClick}
              />
            ) : (
              <MdNightlight
                className={
                  "flex w-4 h-4 md:w-6 sm:h-6 cursor-pointer text-amber-500 mx-4"
                }
                onClick={handleClick}
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
