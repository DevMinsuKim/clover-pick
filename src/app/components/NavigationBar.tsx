"use client";

import React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

import CombinationLogo from "./ui/icons/CombinationLogo";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";
import { usePathname } from "next/navigation";

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

export default function NavigationBar() {
  const pathName = usePathname();

  return (
    <Navbar>
      <NavbarBrand>
        <Link href="/" color="foreground">
          <CombinationLogo />
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex" justify="center">
        {menu.map(({ href, title }) => (
          <NavbarItem key={title} isActive={pathName === href}>
            <Link
              color={pathName === href ? "primary" : "foreground"}
              href={href}
            >
              {title}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <ThemeSwitcher />
      </NavbarContent>
    </Navbar>
  );
}
