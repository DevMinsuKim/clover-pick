"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Tooltip } from "@nextui-org/tooltip";
import SunIcon from "./ui/icons/SunIcon";
import DarkIcon from "./ui/icons/DarkIcon";
import SystemIcon from "./ui/icons/SystemIcon";

const menu = [
  {
    id: "light",
    title: "라이트 모드",
    icon: (color: string) => <SunIcon className={`h-6 w-6 ${color}`} />,
  },
  {
    id: "dark",
    title: "다크 모드",
    icon: (color: string) => <DarkIcon className={`h-6 w-6 ${color}`} />,
  },
  {
    id: "system",
    title: "시스템 모드",
    icon: (color: string) => <SystemIcon className={`h-6 w-6 ${color}`} />,
  },
];

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, theme, setTheme } = useTheme();

  const getColor = (
    resolvedTheme: string | undefined,
    theme: string | undefined,
    id: string,
    mounted: boolean,
  ) => {
    if (!mounted) {
      return "text-foreground";
    }

    if (theme === id) {
      return "text-primary";
    }

    if (resolvedTheme === id) {
      return "text-foreground";
    }

    return "text-foreground opacity-60";
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex gap-4">
      {menu.map(({ id, title, icon }) => (
        <Tooltip
          key={id}
          content={title}
          showArrow={true}
          classNames={{
            base: [
              "before:bg-content1 before:border before:dark:border-content1",
            ],
            content: [
              "bg-content1 border dark:border-content1 shadow-md text-foreground rounded-lg text-sm",
            ],
          }}
        >
          <button
            onClick={() => {
              setTheme(id);
            }}
          >
            {icon(getColor(resolvedTheme, theme, id, mounted))}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
