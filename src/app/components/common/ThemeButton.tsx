import React, { useState } from "react";
import { WiDaySunny } from "react-icons/wi";
import { MdNightlight } from "react-icons/md";
import { HiDesktopComputer } from "react-icons/hi";
import { useTheme } from "next-themes";

export default function ThemeButton() {
  const [toggleDropdown, setToggleDropdown] = useState(false);

  const { setTheme } = useTheme();

  const toggleDropdownHandler = () => {
    setToggleDropdown(!toggleDropdown);
  };

  return (
    <>
      <WiDaySunny
        className={
          "flex w-6 h-6 md:w-8 sm:h-8 cursor-pointer text-slate-800 dark:text-white mx-4 dark:hidden"
        }
        onClick={toggleDropdownHandler}
      />

      <MdNightlight
        className={
          "hidden w-4 h-4 md:w-6 sm:h-6 cursor-pointer text-slate-800 dark:text-white mx-4 dark:flex"
        }
        onClick={toggleDropdownHandler}
      />

      {toggleDropdown && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-3 bg-white dark:bg-slate-800 dark:border-slate-800 border-slate-200 border rounded-md shadow-2xl dark:shadow-slate-900 whitespace-nowrap">
          <ul className="py-2">
            <li
              className="flex items-center hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer px-4 py-1"
              onClick={() => {
                setTheme("light");
                toggleDropdownHandler();
              }}
            >
              <WiDaySunny
                className={
                  "flex w-4 h-4 md:w-5 md:h-5 text-slate-800 dark:text-white"
                }
              />
              <span className="ml-2 text-sm md:text-base">라이트 모드</span>
            </li>
            <li
              className="flex items-center hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer px-4 py-1"
              onClick={() => {
                setTheme("dark");
                toggleDropdownHandler();
              }}
            >
              <MdNightlight
                className={
                  "flex w-4 h-4 md:w-5 md:h-5 text-slate-800 dark:text-white"
                }
              />
              <span className="ml-2 text-sm md:text-base">다크 모드</span>
            </li>
            <li
              className="flex items-center hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer px-4 py-1"
              onClick={() => {
                setTheme("system");
                toggleDropdownHandler();
              }}
            >
              <HiDesktopComputer
                className={
                  "flex w-4 h-4 md:w-5 md:h-5 text-slate-800 dark:text-white"
                }
              />
              <span className="ml-2 text-sm md:text-base">자동</span>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
