import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Palette } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { PALETTES, darkVariant, readableFg } from "@/lib/palettes";

// Floating palette picker. Applies the accent colours as inline CSS vars on
// <html>; the dim/ring variants derive from them in index.css.
const STORAGE_KEY = "palette-preview";

export function PaletteSwitcher() {
  const { resolvedTheme } = useTheme();
  const [id, setId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && PALETTES.some((p) => p.id === saved) ? saved : PALETTES[0].id;
  });

  useEffect(() => {
    const style = document.documentElement.style;
    const p = PALETTES.find((p) => p.id === id) ?? PALETTES[0];
    const dark = resolvedTheme === "dark";
    const box = dark ? darkVariant(p.box) : p.box;
    const root = dark ? darkVariant(p.root) : p.root;
    style.setProperty("--box", box);
    style.setProperty("--box-fg", readableFg(box));
    style.setProperty("--root", root);
    style.setProperty("--root-fg", readableFg(root));
    localStorage.setItem(STORAGE_KEY, id);
  }, [id, resolvedTheme]);

  // ↑ / ↓ cycle through palettes.
  const step = (dir: number) =>
    setId((cur) => {
      const i = PALETTES.findIndex((p) => p.id === cur);
      const next = (i + dir + PALETTES.length) % PALETTES.length;
      return PALETTES[next].id;
    });
  useHotkeys("up", () => step(-1), { preventDefault: true });
  useHotkeys("down", () => step(1), { preventDefault: true });

  const dark = resolvedTheme === "dark";

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex items-center gap-1.5 rounded-md border bg-background/90 px-2 py-1.5 shadow-lg backdrop-blur"
      title="↑ / ↓ to cycle palettes"
    >
      <Palette className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <Select value={id} onValueChange={setId}>
        <SelectTrigger size="sm" className="w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="max-h-80">
          {PALETTES.map((p) => {
            const box = dark ? darkVariant(p.box) : p.box;
            const root = dark ? darkVariant(p.root) : p.root;
            return (
              <SelectItem key={p.id} value={p.id}>
                <span className="flex items-center gap-2">
                  <span className="flex gap-0.5">
                    <span className="h-3 w-3 rounded-full" style={{ background: box }} />
                    <span className="h-3 w-3 rounded-full" style={{ background: root }} />
                  </span>
                  <span data-palette-name>{p.name}</span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
