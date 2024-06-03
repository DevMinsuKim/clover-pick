"use client";

import React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

import CombinationLogo from "./ui/icons/CombinationLogo";
import { usePathname } from "next/navigation";
import Link from "next/link";

const menu = [
  {
    href: "/",
    title: "로또 6/45",
  },
  {
    href: "/pension",
    title: "연금복권 720+",
  },
];

export default function NavBar() {
  const pathName = usePathname();

  return (
    <div className="mx-auto flex max-w-screen-lg items-center justify-between px-6 py-5">
      <Link href="/">
        <CombinationLogo />
      </Link>
      <nav>
        <ul className="hidden gap-4 md:flex">
          {menu.map(({ href, title }) => (
            <li key={title}>
              <Link
                href={href}
                className={`${pathName === href ? "font-bold text-primary" : "text-foreground"} transition-opacity hover:opacity-80`}
              >
                {title}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="bg-content1 dark:border-content1 fixed bottom-0 left-0 flex w-full justify-evenly rounded-t-xl border-2 px-6 py-5 shadow-md md:hidden">
          {menu.map(({ href, title }) => (
            <li key={title}>
              <Link
                href={href}
                className={`${pathName === href ? "font-bold text-primary" : "text-foreground"} transition-opacity hover:opacity-80`}
              >
                {title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
