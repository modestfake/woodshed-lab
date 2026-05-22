import { useMemo, useState, type ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ChevronLeft, ChevronRight, Info, Play, Square } from "lucide-react";
import { Fretboard, type LabelMode } from "@/components/Fretboard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePlayback } from "@/hooks/usePlayback";
import { playMidi } from "@/lib/audio";
import { BOX_COUNT, KEYS, SCALES, box, diatonicMap, keyById, scaleById } from "@/lib/theory";
import { cn } from "@/lib/utils";

const SCALE_GROUPS = Array.from(new Set(SCALES.map((s) => s.group)));

export function BoxTrainer() {
  const [keyId, setKeyId] = useState("C");
  const [scaleId, setScaleId] = useState("major");
  const [boxN, setBoxN] = useState(1);
  const [labelMode, setLabelMode] = useState<LabelMode>("name");

  const theKey = keyById(keyId);
  const theScale = scaleById(scaleId);
  const map = useMemo(() => diatonicMap(theKey, theScale), [theKey, theScale]);
  const active = useMemo(() => box(theKey, theScale, boxN), [theKey, theScale, boxN]);

  const { playingKey, isPlaying, toggle } = usePlayback(active);

  const step = (dir: number) => setBoxN((n) => ((n - 1 + dir + BOX_COUNT) % BOX_COUNT) + 1);

  // ← / → step through the boxes, Space plays the current box.
  useHotkeys("left", () => step(-1), { preventDefault: true });
  useHotkeys("right", () => step(1), { preventDefault: true });
  useHotkeys("space", () => toggle(), { preventDefault: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <Field label="Key">
          <Select value={keyId} onValueChange={setKeyId}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEYS.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Scale">
          <Select value={scaleId} onValueChange={setScaleId}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCALE_GROUPS.map((group) => (
                <SelectGroup key={group}>
                  <SelectLabel>{group}</SelectLabel>
                  {SCALES.filter((s) => s.group === group).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Box">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => step(-1)}
              aria-label="Previous box"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: BOX_COUNT }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setBoxN(n)}
                  className={cn(
                    "h-9 w-9 rounded-md border text-sm font-semibold transition-colors",
                    n === boxN
                      ? "border-[var(--box)] bg-[var(--box)] text-[var(--box-fg)]"
                      : "border-input bg-background hover:bg-accent",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={() => step(1)} aria-label="Next box">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Field>

        <Field label="Labels">
          <ToggleGroup
            type="single"
            value={labelMode}
            onValueChange={(v) => v && setLabelMode(v as LabelMode)}
            variant="outline"
          >
            <ToggleGroupItem value="name" className="px-3">
              Notes
            </ToggleGroupItem>
            <ToggleGroupItem value="degree" className="px-3">
              Degrees
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        <Field label="Playback">
          <Button
            onClick={(e) => {
              toggle();
              e.currentTarget.blur();
            }}
            className="w-32"
          >
            {isPlaying ? (
              <>
                <Square className="h-4 w-4 fill-current" /> Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" /> Play box
              </>
            )}
          </Button>
        </Field>
      </div>

      <Fretboard
        map={map}
        active={active}
        labelMode={labelMode}
        onPlay={playMidi}
        playingKey={playingKey}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Legend className="bg-[var(--root)]" text="Root (1)" />
        <Legend className="bg-[var(--box)]" text={`Box ${boxN} tones`} />
        <Legend className="bg-[var(--box-dim)]" text="Other boxes" />
        <span className="flex items-center gap-1.5 text-xs">
          <Info className="h-3.5 w-3.5" />
          Click any fret to hear it
        </span>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function Legend({ className, text }: { className: string; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("h-3.5 w-3.5 rounded-full", className)} />
      {text}
    </span>
  );
}
