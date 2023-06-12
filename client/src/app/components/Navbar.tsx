"use client";
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import logo from "./lottie/logo.json";
import { WiDaySunny } from "react-icons/wi";

const menu = [
  {
    href: "/",
  },
  {
    href: "/search",
  },
  {
    href: "/new",
  },
];

// const isDarkModeOn = document.body.classList.contains("dark");

export default function Navbar() {
  const [isDarkModeOn, setIsDarkModeOn] = useState(false);

  useEffect(() => {
    setIsDarkModeOn(document.body.classList.contains("dark"));
  }, []);

  const handleClick = () => {
    if (isDarkModeOn) {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    }
  };
  return (
    <div className="flex justify-center items-center">
      <span className="text-base">로또 6/45</span>
      {/* <div className="flex bg-slate-400 rounded-full items-center justify-center w-16 h-16">
        <Lottie animationData={logo} className="w-10 h-10"></Lottie>
      </div> */}
      <WiDaySunny className="w-16 h-16 mx-20" onClick={handleClick} />
      <span className="text-base text-slate-300 hover:text-inherit">
        연금복권
      </span>
    </div>
  );
}
