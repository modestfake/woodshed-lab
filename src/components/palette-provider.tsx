import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useTheme } from "@/components/theme-provider";
import { PALETTES, darkVariant, readableFg, type Palette } from "@/lib/palettes";

// Holds the selected palette and applies its accent colours as inline CSS vars
// on <html> (the dim/ring variants derive from them in index.css). Lives above
// the switchers so the choice can be surfaced in more than one place (a floating
// pill on desktop, a header button on mobile) without two copies of the state.
const STORAGE_KEY = "palette-preview";

type PaletteState = {
  id: string;
  setId: (id: string) => void;
  palettes: Palette[];
  // Accent colours resolved for the active theme (dark gets the pastel variant).
  swatch: (p: Palette) => { box: string; root: string };
};

const PaletteContext = createContext<PaletteState | undefined>(undefined);

export function PaletteProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const [id, setId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && PALETTES.some((p) => p.id === saved) ? saved : PALETTES[0].id;
  });

  useEffect(() => {
    const p = PALETTES.find((x) => x.id === id) ?? PALETTES[0];
    const box = dark ? darkVariant(p.box) : p.box;
    const root = dark ? darkVariant(p.root) : p.root;
    const style = document.documentElement.style;
    style.setProperty("--box", box);
    style.setProperty("--box-fg", readableFg(box));
    style.setProperty("--root", root);
    style.setProperty("--root-fg", readableFg(root));
    localStorage.setItem(STORAGE_KEY, id);
  }, [id, dark]);

  // ↑ / ↓ cycle through palettes.
  const step = (dir: number) =>
    setId((cur) => {
      const i = PALETTES.findIndex((p) => p.id === cur);
      return PALETTES[(i + dir + PALETTES.length) % PALETTES.length].id;
    });
  useHotkeys("up", () => step(-1), { preventDefault: true });
  useHotkeys("down", () => step(1), { preventDefault: true });

  const swatch = (p: Palette) => ({
    box: dark ? darkVariant(p.box) : p.box,
    root: dark ? darkVariant(p.root) : p.root,
  });

  return (
    <PaletteContext.Provider value={{ id, setId, palettes: PALETTES, swatch }}>
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used within a PaletteProvider");
  return ctx;
}
