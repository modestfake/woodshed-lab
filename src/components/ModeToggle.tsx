import { useHotkeys } from "react-hotkeys-hook";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");
  useHotkeys("t", toggle, { preventDefault: true });

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={toggle}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light (T)" : "Switch to dark (T)"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
