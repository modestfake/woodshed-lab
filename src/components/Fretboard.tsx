import { memo, useEffect, useMemo, useRef } from "react";
import { MAX_FRET, STRING_LABELS, TUNING, chromaticLabel, type Key, type Note } from "@/lib/theory";
import { cn } from "@/lib/utils";

const FRETS = Array.from({ length: MAX_FRET + 1 }, (_, i) => i);
const INLAYS = [3, 5, 7, 9, 15];
const DOUBLE_INLAY = 12;
// Display order is top -> bottom: high e ... low E.
const ROWS = [5, 4, 3, 2, 1, 0];

export type LabelMode = "name" | "degree";

type Props = {
  map: Note[];
  active: Note[];
  theKey: Key;
  labelMode: LabelMode;
  onPlay: (midi: number) => void;
  playingKey?: string | null;
  // Overlay (Intervals/Progressions): cell keys to spotlight. When set, the box
  // recedes to a faint context tier and only these pop; `anchorKeys` of them use
  // the root colour. Null/undefined = no overlay (plain box).
  litKeys?: Set<string> | null;
  anchorKeys?: Set<string> | null;
};

export function Fretboard({
  map,
  active,
  theKey,
  labelMode,
  onPlay,
  playingKey,
  litKeys,
  anchorKeys,
}: Props) {
  const mapByCell = useMemo(() => {
    const m = new Map<string, Note>();
    for (const n of map) m.set(`${n.string}:${n.fret}`, n);
    return m;
  }, [map]);

  const activeSet = useMemo(() => new Set(active.map((n) => `${n.string}:${n.fret}`)), [active]);
  const overlayOn = litKeys != null;

  // Fret span the active box occupies, for the translucent box band behind it.
  const span = useMemo(() => {
    if (!active.length) return null;
    let min = Infinity;
    let max = -Infinity;
    for (const n of active) {
      if (n.fret < min) min = n.fret;
      if (n.fret > max) max = n.fret;
    }
    return { min, max };
  }, [active]);

  // When the board is wider than the viewport, scroll the active box to centre
  // on each box change so you don't lose it off the right edge.
  const scrollRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = scrollRef.current;
    const board = boardRef.current;
    if (!scroller || !board || !span) return;
    const overflow = scroller.scrollWidth - scroller.clientWidth;
    if (overflow <= 0) return; // fits in view, nothing to scroll
    const boardRect = board.getBoundingClientRect();
    const scrollRect = scroller.getBoundingClientRect();
    const centerFrac = (span.min + span.max + 1) / 2 / (MAX_FRET + 1);
    const boxCenterX = boardRect.left + centerFrac * boardRect.width;
    const target = scroller.scrollLeft + boxCenterX - (scrollRect.left + scroller.clientWidth / 2);
    scroller.scrollTo({ left: Math.max(0, Math.min(target, overflow)), behavior: "smooth" });
  }, [span]);

  return (
    <div ref={scrollRef} className="overflow-x-auto pb-1">
      <div className="min-w-[760px]">
        <div className="flex">
          {/* string labels */}
          <div
            className="grid w-6 shrink-0 text-xs font-medium text-muted-foreground"
            style={{ gridTemplateRows: "repeat(6, 1fr)", height: 264 }}
          >
            {ROWS.map((s) => (
              <div key={s} className="flex items-center justify-center">
                {STRING_LABELS[s]}
              </div>
            ))}
          </div>

          {/* board */}
          <div ref={boardRef} className="relative flex-1" style={{ height: 264 }}>
            {/* fret wires + strings — strings drawn last so they sit on top */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 18 6"
              preserveAspectRatio="none"
            >
              {FRETS.slice(1).map((f) => (
                <line
                  key={f}
                  x1={f}
                  x2={f}
                  y1={0.1}
                  y2={5.9}
                  stroke="currentColor"
                  className={
                    f === 1
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-200 dark:text-zinc-800"
                  }
                  strokeWidth={f === 1 ? 4 : 1.5}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {ROWS.map((s, row) => (
                <line
                  key={s}
                  x1={0}
                  x2={18}
                  y1={row + 0.5}
                  y2={row + 0.5}
                  stroke="currentColor"
                  className="text-zinc-400 dark:text-zinc-500"
                  strokeWidth={0.8 + (5 - s) * 0.45}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* inlay markers */}
            {INLAYS.map((f) => (
              <span
                key={f}
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-300 dark:bg-zinc-600"
                style={{ left: `${((f + 0.5) / 18) * 100}%`, top: "50%" }}
              />
            ))}
            {[33, 67].map((top) => (
              <span
                key={top}
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-300 dark:bg-zinc-600"
                style={{
                  left: `${((DOUBLE_INLAY + 0.5) / 18) * 100}%`,
                  top: `${top}%`,
                }}
              />
            ))}

            {/* active box band — spans the frets the box's notes occupy */}
            {span && (
              <div
                className="pointer-events-none absolute inset-y-0 rounded-lg bg-[var(--box)]/10"
                style={{
                  left: `${(span.min / (MAX_FRET + 1)) * 100}%`,
                  width: `${((span.max - span.min + 1) / (MAX_FRET + 1)) * 100}%`,
                }}
              />
            )}

            {/* clickable cells + note dots */}
            <div
              className="relative grid h-full"
              style={{
                gridTemplateColumns: "repeat(18, 1fr)",
                gridTemplateRows: "repeat(6, 1fr)",
              }}
            >
              {ROWS.map((s) =>
                FRETS.map((f) => {
                  const cellKey = `${s}:${f}`;
                  const note = mapByCell.get(cellKey);
                  const isActive = activeSet.has(cellKey);
                  const midi = TUNING[s] + f;
                  const ghost = note ? null : chromaticLabel(theKey, midi % 12);

                  // Pick a colour family (root vs box) and intensity per cell.
                  let tone: "root" | "box" = "box";
                  let level: "bright" | "context" | "dim" = "dim";
                  if (note) {
                    if (overlayOn) {
                      if (litKeys.has(cellKey)) {
                        level = "bright";
                        tone = anchorKeys?.has(cellKey) ? "root" : "box";
                      } else if (isActive) {
                        level = "context"; // box shape, de-emphasised behind the overlay
                      } else {
                        tone = note.isRoot ? "root" : "box";
                      }
                    } else {
                      level = isActive ? "bright" : "dim";
                      tone = note.isRoot ? "root" : "box";
                    }
                  }
                  return (
                    <button
                      key={cellKey}
                      onClick={() => onPlay(midi)}
                      aria-label={`${STRING_LABELS[s]} string, fret ${f}, ${
                        note ? note.name : ghost!.name
                      }`}
                      className="group flex cursor-pointer items-center justify-center"
                    >
                      {note ? (
                        <Dot
                          label={labelMode === "name" ? note.name : note.label}
                          tone={tone}
                          level={level}
                          isPlaying={playingKey === cellKey}
                        />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-foreground/5">
                          <span className="text-[11px] font-medium tabular-nums text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-60">
                            {labelMode === "name" ? ghost!.name : ghost!.degree}
                          </span>
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        {/* fret numbers */}
        <div className="flex">
          <div className="w-6 shrink-0" />
          <div className="grid flex-1" style={{ gridTemplateColumns: "repeat(18, 1fr)" }}>
            {FRETS.map((f) => (
              <div
                key={f}
                className={cn(
                  "pt-1 text-center text-xs",
                  INLAYS.includes(f) || f === DOUBLE_INLAY
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const Dot = memo(function Dot({
  label,
  tone,
  level,
  isPlaying,
}: {
  label: string;
  tone: "root" | "box";
  level: "bright" | "context" | "dim";
  isPlaying: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-transform duration-150 group-hover:scale-[1.18] group-hover:shadow-md",
        level === "bright" &&
          (tone === "root"
            ? "bg-[var(--root)] text-[var(--root-fg)] shadow-sm ring-2 ring-[var(--root-ring)]"
            : "bg-[var(--box)] text-[var(--box-fg)] shadow-sm"),
        // Box shape behind an overlay: dim fill + a faint box-coloured ring.
        level === "context" &&
          "bg-[var(--box-dim)] text-[var(--box-dim-fg)] ring-1 ring-inset ring-[var(--box)]/40",
        level === "dim" &&
          (tone === "root"
            ? "bg-[var(--root-dim)] text-[var(--root-dim-fg)]"
            : "bg-[var(--box-dim)] text-[var(--box-dim-fg)]"),
        isPlaying && "z-10 scale-125 shadow-lg ring-2 ring-foreground/70",
      )}
    >
      {label}
    </span>
  );
});
