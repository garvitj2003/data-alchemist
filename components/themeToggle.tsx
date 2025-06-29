"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // wait until component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant={"secondary"}
      size={"icon"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="text-foreground transition-all duration-600 rotate-0 dark:rotate-90 scale-0 dark:scale-100" />
      ) : (
        <Moon className=" text-foreground duration-600 dark:rotate-90 rotate-0 dark:scale-0 scale-100 transition-all" />
      )}
    </Button>
  );
}