"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import SunIcon from "./ui/icons/SunIcon";
import { Tooltip, Button } from "@nextui-org/react";
import DarkIcon from "./ui/icons/DarkIcon";
import SystemIcon from "./ui/icons/SystemIcon";

const menu = [
  {
    id: "light",
    title: "라이트 모드",
    icon: (color: string) => <SunIcon className={`w-6 h-6 ${color}`} />,
  },
  {
    id: "dark",
    title: "다크 모드",
    icon: (color: string) => <DarkIcon className={`w-6 h-6 ${color}`} />,
  },
  {
    id: "system",
    title: "시스템 모드",
    icon: (color: string) => <SystemIcon className={`w-6 h-6 ${color}`} />,
  },
];

const getColor = (
  resolvedTheme: string | undefined,
  theme: string | undefined,
  id: string
) => {
  if (theme === id) {
    return "text-primary";
  } else {
    if (resolvedTheme === id) {
      return "text-default-600";
    }
    return "text-default-300";
  }
};

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
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
              {icon("text-foreground")}
            </Button>
          </Tooltip>
        ))}
      </>
    );

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
