"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import SunIcon from "./ui/icons/SunIcon";
import DarkIcon from "./ui/icons/DarkIcon";
import SystemIcon from "./ui/icons/SystemIcon";
import { Tooltip } from "react-tooltip";
// import { Tooltip } from "@nextui-org/tooltip";

const menu = [
  {
    id: "light",
    title: "밝은 테마",
    icon: (color: string) => <SunIcon className={`h-6 w-6 ${color}`} />,
  },
  {
    id: "dark",
    title: "어두운 테마",
    icon: (color: string) => <DarkIcon className={`h-6 w-6 ${color}`} />,
  },
  {
    id: "system",
    title: "기기 테마 사용",
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
        <div
          className="flex"
          key={id}
          data-tooltip-id="tooltip"
          data-tooltip-content={title}
        >
          <button
            onClick={() => {
              setTheme(id);
            }}
          >
            {icon(getColor("resolvedTheme", theme, id, mounted))}
          </button>
        </div>
      ))}
      <Tooltip id="tooltip" className="custom-tooltip" />
    </div>
  );
}
