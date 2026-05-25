import { Palette as PaletteIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { usePalette } from "@/components/palette-provider";

// Two placements share the same palette state: a floating pill bottom-right on
// desktop, and a compact icon button in the header on mobile (where the floating
// pill would collide with the docked playback bar).
export function PaletteSwitcher({ variant = "floating" }: { variant?: "floating" | "compact" }) {
  const { id, setId, palettes, swatch } = usePalette();

  const menu = (
    <SelectContent align="end" position="popper" sideOffset={8} className="max-h-80">
      {palettes.map((p) => {
        const { box, root } = swatch(p);
        return (
          <SelectItem key={p.id} value={p.id}>
            <span className="flex items-center gap-2">
              <span className="flex gap-0.5">
                <span className="h-3 w-3 rounded-full" style={{ background: box }} />
                <span className="h-3 w-3 rounded-full" style={{ background: root }} />
              </span>
              <span>{p.name}</span>
            </span>
          </SelectItem>
        );
      })}
    </SelectContent>
  );

  if (variant === "compact") {
    return (
      <Select value={id} onValueChange={setId}>
        <SelectTrigger
          aria-label="Palette"
          size="sm"
          className="w-8 justify-center p-0 [&>svg:last-child]:hidden"
        >
          <PaletteIcon className="size-4" />
        </SelectTrigger>
        {menu}
      </Select>
    );
  }

  const current = palettes.find((p) => p.id === id) ?? palettes[0];
  const { box, root } = swatch(current);
  return (
    <div
      className="fixed right-4 bottom-[3.25rem] z-50 hidden translate-y-1/2 md:block"
      title="↑ / ↓ to cycle palettes"
    >
      <Select value={id} onValueChange={setId}>
        <SelectTrigger className="gap-2 rounded-full bg-card/90 px-3 py-2 shadow-lg backdrop-blur">
          <PaletteIcon className="size-4" />
          <span className="flex gap-0.5">
            <span className="h-3.5 w-3.5 rounded-full" style={{ background: box }} />
            <span className="h-3.5 w-3.5 rounded-full" style={{ background: root }} />
          </span>
        </SelectTrigger>
        {menu}
      </Select>
    </div>
  );
}
