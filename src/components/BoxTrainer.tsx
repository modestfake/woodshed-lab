import { useMemo, useState, type ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ChevronLeft, ChevronRight, Info, ListOrdered, Music } from "lucide-react";
import { Fretboard, type LabelMode } from "@/components/Fretboard";
import { PlaybackBar } from "@/components/PlaybackBar";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlayback, type PlayMode } from "@/hooks/usePlayback";
import { playMidi } from "@/lib/audio";
import {
  BOX_COUNT,
  KEYS,
  SCALES,
  PROGRESSIONS,
  box,
  boxModeName,
  boxTriad,
  diatonicMap,
  intervalRun,
  keyById,
  scaleById,
} from "@/lib/theory";
import type { Note } from "@/lib/theory";
import { cn } from "@/lib/utils";

const SCALE_GROUPS = Array.from(new Set(SCALES.map((s) => s.group)));

type Feel = "straight" | "swing";
type Overlay = "none" | "intervals" | "progressions";

// Diatonic intervals offerable from the anchor in the Intervals overlay.
const INTERVAL_CHOICES = [2, 3, 4, 5, 6, 7];
const DEGREES = [1, 2, 3, 4, 5, 6, 7];

// Straight feel plays the box as eighth-note triplets — 3 notes/beat, one string
// per beat (natural for 3NPS). Swing drops to duple eighths (2/beat) with a
// medium long-short lilt (≈1.85:1).
const STRAIGHT_NPB = 3;
const SWING_NPB = 2;
const SWING_RATIO = 0.3;

// Random progression playback: a few notes per triad, baked over a few cycles
// and looped (the existing player's loop ping-pongs it).
const RANDOM_CYCLES = 6;
const RANDOM_PER_DEGREE = 4;

// Pick `count` notes at random from a triad, avoiding immediate repeats.
function fewRandom(triad: Note[], count: number): Note[] {
  const out: Note[] = [];
  let prev = -1;
  for (let k = 0; k < count; k++) {
    let i = Math.floor(Math.random() * triad.length);
    if (triad.length > 1 && i === prev) i = (i + 1) % triad.length;
    out.push(triad[i]);
    prev = i;
  }
  return out;
}

export function BoxTrainer() {
  const [keyId, setKeyId] = useState("C");
  const [scaleId, setScaleId] = useState("major");
  const [boxN, setBoxN] = useState(1);
  const [labelMode, setLabelMode] = useState<LabelMode>("name");
  const [bpm, setBpm] = useState(120);
  const [playMode, setPlayMode] = useState<PlayMode>("asc");
  const [feel, setFeel] = useState<Feel>("straight");
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [anchorDeg, setAnchorDeg] = useState(1);
  const [intervalN, setIntervalN] = useState(3); // step size of the run
  const [progId, setProgId] = useState(PROGRESSIONS[0].id);

  const theKey = keyById(keyId);
  const theScale = scaleById(scaleId);
  const map = useMemo(() => diatonicMap(theKey, theScale), [theKey, theScale]);
  const active = useMemo(() => box(theKey, theScale, boxN), [theKey, theScale, boxN]);
  const activeBoxName = boxModeName(theScale, boxN);

  const intervalsOn = overlay === "intervals";
  const progressionsOn = overlay === "progressions";
  const prog = PROGRESSIONS.find((p) => p.id === progId) ?? PROGRESSIONS[0];

  // Progression triads: the close root-position triad on each degree, in order.
  const triads = useMemo(
    () =>
      progressionsOn ? prog.degrees.map((d) => boxTriad(active, d)).filter((t) => t.length) : null,
    [progressionsOn, prog, active],
  );

  // `lit` = the overlay's highlighted notes (drives the Fretboard tiers).
  // Intervals: the run. Progressions: every triad note.
  const lit = useMemo(() => {
    if (intervalsOn) return intervalRun(active, anchorDeg, intervalN);
    if (triads) return triads.flat();
    return null;
  }, [intervalsOn, triads, active, anchorDeg, intervalN]);

  // `playSeq` = what Play walks, which differs from `lit` for progressions:
  // ascending = each triad low→high, descending = high→low, random = a few notes
  // per triad over a few cycles (looped). Box/Intervals just play `lit`.
  const playSeq = useMemo(() => {
    if (!triads) return lit ?? active;
    if (playMode === "desc") return triads.flatMap((t) => [...t].reverse());
    if (playMode === "random") {
      const seq: Note[] = [];
      for (let c = 0; c < RANDOM_CYCLES; c++)
        for (const t of triads) seq.push(...fewRandom(t, RANDOM_PER_DEGREE));
      return seq;
    }
    return triads.flatMap((t) => t); // ascending + back-and-forth
  }, [triads, lit, active, playMode]);

  const litKeys = useMemo(
    () => (lit ? new Set(lit.map((n) => `${n.string}:${n.fret}`)) : null),
    [lit],
  );
  // Root colour: the run's start note (Intervals) or the tonic notes among the
  // triads (Progressions).
  const anchorKeys = useMemo(() => {
    if (intervalsOn) return lit && lit.length ? new Set([`${lit[0].string}:${lit[0].fret}`]) : null;
    if (progressionsOn && lit)
      return new Set(lit.filter((n) => n.degree === 1).map((n) => `${n.string}:${n.fret}`));
    return null;
  }, [intervalsOn, progressionsOn, lit]);

  const degreeName = (d: number) => map.find((n) => n.degree === d)?.name ?? String(d);

  // Progressions bake direction into `playSeq`, so the player just runs it once
  // (asc/desc) or ping-pongs it (back-and-forth/random → continuous).
  const playMode2: PlayMode = progressionsOn
    ? playMode === "loop" || playMode === "random"
      ? "loop"
      : "asc"
    : playMode;

  const notesPerBeat = feel === "swing" ? SWING_NPB : STRAIGHT_NPB;
  const { playingKey, isPlaying, toggle } = usePlayback(
    playSeq,
    60000 / (bpm * notesPerBeat),
    playMode2,
    feel === "swing" ? SWING_RATIO : 0,
  );

  const step = (dir: number) => setBoxN((n) => ((n - 1 + dir + BOX_COUNT) % BOX_COUNT) + 1);

  // ← / → step through the boxes, Space plays the current box.
  useHotkeys("left", () => step(-1), { preventDefault: true });
  useHotkeys("right", () => step(1), { preventDefault: true });
  useHotkeys("space", () => toggle(), { preventDefault: true });

  return (
    <div className="space-y-6 pb-44 md:pb-28">
      <div className="rounded-xl border bg-card/50">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
          <Ctl label="Key">
            <Select value={keyId} onValueChange={setKeyId}>
              <SelectTrigger size="sm" className="w-20">
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
          </Ctl>

          <Ctl label="Scale">
            <Select value={scaleId} onValueChange={setScaleId}>
              <SelectTrigger size="sm" className="w-48">
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
          </Ctl>

          <Ctl label="Box">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => step(-1)}
                aria-label="Previous box"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-md border border-[var(--box)] bg-[var(--box)] px-2 text-sm font-semibold text-[var(--box-fg)]">
                    {boxN}
                  </span>
                </TooltipTrigger>
                {activeBoxName && <TooltipContent>{activeBoxName}</TooltipContent>}
              </Tooltip>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => step(1)}
                aria-label="Next box"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">/ {BOX_COUNT}</span>
            </div>
          </Ctl>

          <Ctl label="Labels">
            <ToggleGroup
              type="single"
              size="sm"
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
          </Ctl>

          <Ctl label="Overlay">
            <ToggleGroup
              type="single"
              size="sm"
              value={overlay}
              onValueChange={(v) => v && setOverlay(v as Overlay)}
              variant="outline"
            >
              <ToggleGroupItem value="none" className="px-3">
                None
              </ToggleGroupItem>
              <ToggleGroupItem value="intervals" className="px-3">
                Intervals
              </ToggleGroupItem>
              <ToggleGroupItem value="progressions" className="px-3">
                Progressions
              </ToggleGroupItem>
            </ToggleGroup>
          </Ctl>
        </div>

        {overlay !== "none" && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t px-4 py-3">
            {progressionsOn && (
              <Ctl label="Progression">
                <Select value={progId} onValueChange={setProgId}>
                  <SelectTrigger size="sm" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRESSIONS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Ctl>
            )}

            {intervalsOn && (
              <>
                <Ctl label="Anchor">
                  <Select value={String(anchorDeg)} onValueChange={(v) => setAnchorDeg(Number(v))}>
                    <SelectTrigger size="sm" className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREES.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} · {degreeName(d)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Ctl>

                <Ctl label="Interval (run step)">
                  <ToggleGroup
                    type="single"
                    size="sm"
                    value={String(intervalN)}
                    onValueChange={(v) => v && setIntervalN(Number(v))}
                    variant="outline"
                  >
                    {INTERVAL_CHOICES.map((n) => (
                      <ToggleGroupItem key={n} value={String(n)} className="w-9 px-0">
                        {n}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Ctl>
              </>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card/50 p-4">
        <Fretboard
          map={map}
          active={active}
          theKey={theKey}
          labelMode={labelMode}
          onPlay={playMidi}
          playingKey={playingKey}
          litKeys={litKeys}
          anchorKeys={anchorKeys}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Legend className="bg-[var(--root)]" text="Root (1)" />
        <Legend className="bg-[var(--box)]" text={`Box ${boxN} tones`} />
        <Legend className="bg-[var(--box-dim)]" text="Other boxes" />
        <span className="flex items-center gap-1.5 text-xs">
          <Info className="h-3.5 w-3.5" />
          Click any fret to hear it
        </span>
      </div>

      <PlaybackBar
        isPlaying={isPlaying}
        onToggle={toggle}
        playMode={playMode}
        onPlayModeChange={setPlayMode}
        feel={feel}
        onFeelChange={setFeel}
        bpm={bpm}
        onBpmChange={setBpm}
      />
    </div>
  );
}

function Ctl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
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
