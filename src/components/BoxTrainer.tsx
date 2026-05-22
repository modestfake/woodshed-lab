import { useMemo, useState, type ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Info,
  ListOrdered,
  Music,
  Play,
  Repeat,
  Shuffle,
  Square,
} from "lucide-react";
import { Fretboard, type LabelMode } from "@/components/Fretboard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlayback, type PlayMode } from "@/hooks/usePlayback";
import { playMidi } from "@/lib/audio";
import {
  BOX_COUNT,
  KEYS,
  SCALES,
  box,
  boxModeName,
  diatonicMap,
  keyById,
  scaleById,
} from "@/lib/theory";
import { cn } from "@/lib/utils";

const SCALE_GROUPS = Array.from(new Set(SCALES.map((s) => s.group)));

// Playback plays the box as eighth-note triplets — 3 notes per beat, so one
// string lands per beat, the natural feel for a 3-notes-per-string box.
const NOTES_PER_BEAT = 3;

export function BoxTrainer() {
  const [keyId, setKeyId] = useState("C");
  const [scaleId, setScaleId] = useState("major");
  const [boxN, setBoxN] = useState(1);
  const [labelMode, setLabelMode] = useState<LabelMode>("name");
  const [bpm, setBpm] = useState(120);
  const [playMode, setPlayMode] = useState<PlayMode>("asc");

  const theKey = keyById(keyId);
  const theScale = scaleById(scaleId);
  const map = useMemo(() => diatonicMap(theKey, theScale), [theKey, theScale]);
  const active = useMemo(() => box(theKey, theScale, boxN), [theKey, theScale, boxN]);
  const activeBoxName = boxModeName(theScale, boxN);

  const { playingKey, isPlaying, toggle } = usePlayback(
    active,
    60000 / (bpm * NOTES_PER_BEAT),
    playMode,
  );

  const step = (dir: number) => setBoxN((n) => ((n - 1 + dir + BOX_COUNT) % BOX_COUNT) + 1);

  // ← / → step through the boxes, Space plays the current box.
  useHotkeys("left", () => step(-1), { preventDefault: true });
  useHotkeys("right", () => step(1), { preventDefault: true });
  useHotkeys("space", () => toggle(), { preventDefault: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
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
              {Array.from({ length: BOX_COUNT }, (_, i) => i + 1).map((n) => {
                const name = boxModeName(theScale, n);
                return (
                  <Tooltip key={n}>
                    <TooltipTrigger asChild>
                      <button
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
                    </TooltipTrigger>
                    {name && <TooltipContent>{name}</TooltipContent>}
                  </Tooltip>
                );
              })}
            </div>
            <Button variant="outline" size="icon" onClick={() => step(1)} aria-label="Next box">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {activeBoxName && (
            <p className="text-xs text-muted-foreground">
              Box {boxN} · <span className="font-medium text-foreground">{activeBoxName}</span>
            </p>
          )}
        </Field>

        <Field label="Labels">
          <ToggleGroup
            type="single"
            value={labelMode}
            onValueChange={(v) => v && setLabelMode(v as LabelMode)}
            variant="outline"
          >
            <ToggleGroupItem value="name" className="gap-1.5 px-3">
              <Music className="h-4 w-4" />
              Notes
            </ToggleGroupItem>
            <ToggleGroupItem value="degree" className="gap-1.5 px-3">
              <ListOrdered className="h-4 w-4" />
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

        <Field label="Direction">
          <ToggleGroup
            type="single"
            value={playMode}
            onValueChange={(v) => v && setPlayMode(v as PlayMode)}
            variant="outline"
          >
            <ToggleGroupItem value="asc" aria-label="Ascending" title="Ascending" className="px-3">
              <ArrowUp className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="desc"
              aria-label="Descending"
              title="Descending"
              className="px-3"
            >
              <ArrowDown className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="loop"
              aria-label="Loop back and forth"
              title="Loop (back & forth)"
              className="px-3"
            >
              <Repeat className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="random"
              aria-label="Shuffle (random order)"
              title="Shuffle (random order)"
              className="px-3"
            >
              <Shuffle className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        <Field label="Tempo">
          <div className="flex h-9 items-center gap-3">
            <Slider
              value={[bpm]}
              onValueChange={(v) => setBpm(v[0] ?? bpm)}
              min={40}
              max={240}
              step={5}
              className="w-32"
            />
            <span className="w-16 text-sm tabular-nums text-muted-foreground">{bpm} BPM</span>
          </div>
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
