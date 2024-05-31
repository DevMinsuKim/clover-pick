"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import SunIcon from "./ui/icons/SunIcon";
import { Tooltip, Button } from "@nextui-org/react";

const menu = [
  {
    id: "light",
    title: "라이트모드",
    icon: (color: string) => <SunIcon className={`w-7 h-7 ${color}`} />,
  },
  {
    id: "dark",
    title: "다크모드",
    icon: (color: string) => <SunIcon className={`w-7 h-7 ${color}`} />,
  },
  {
    id: "system",
    title: "시스템모드",
    icon: (color: string) => <SunIcon className={`w-7 h-7 ${color}`} />,
  },
];

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log(resolvedTheme, theme);
    // setMounted(true);
  }, [resolvedTheme, theme]);

  if (!mounted) return null;

  const getColor = (
    resolvedTheme: string | undefined,
    theme: string | undefined,
    id: string
  ) => {
    if (theme === id) {
      return "text-primary";
    } else {
      if (resolvedTheme === id) {
        return "text-foreground";
      }
      return "text-content4";
    }
  };

  return (
    <>
      {menu.map(({ id, title, icon }) => (
        <Tooltip content={title} key={id} showArrow={true}>
          <Button
            className="w-auto h-auto p-0 m-0 min-h-0 min-w-0 bg-transparent"
            onClick={() => {
              setTheme(id);
            }}
          >
            {icon(getColor(resolvedTheme, theme, id))}
          </Button>
        </Tooltip>
      ))}
    </>
  );
}
