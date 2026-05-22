import { memo, useMemo } from "react"
import { MAX_FRET, STRING_LABELS, TUNING, type Note } from "@/lib/theory"
import { cn } from "@/lib/utils"

const FRETS = Array.from({ length: MAX_FRET + 1 }, (_, i) => i)
const INLAYS = [3, 5, 7, 9, 15]
const DOUBLE_INLAY = 12
// Display order is top -> bottom: high e ... low E.
const ROWS = [5, 4, 3, 2, 1, 0]

export type LabelMode = "name" | "degree"

type Props = {
  map: Note[]
  active: Note[]
  labelMode: LabelMode
  onPlay: (midi: number) => void
  playingKey?: string | null
}

export function Fretboard({
  map,
  active,
  labelMode,
  onPlay,
  playingKey,
}: Props) {
  const mapByCell = useMemo(() => {
    const m = new Map<string, Note>()
    for (const n of map) m.set(`${n.string}:${n.fret}`, n)
    return m
  }, [map])

  const activeSet = useMemo(
    () => new Set(active.map((n) => `${n.string}:${n.fret}`)),
    [active],
  )

  return (
    <div className="overflow-x-auto pb-1">
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
          <div className="relative flex-1" style={{ height: 264 }}>
            {/* strings + fret wires */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 18 6"
              preserveAspectRatio="none"
            >
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
                      : "text-zinc-300 dark:text-zinc-700"
                  }
                  strokeWidth={f === 1 ? 4 : 1.5}
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
                  const cellKey = `${s}:${f}`
                  const note = mapByCell.get(cellKey)
                  const isActive = activeSet.has(cellKey)
                  const midi = TUNING[s] + f
                  return (
                    <button
                      key={cellKey}
                      onClick={() => onPlay(midi)}
                      className="group flex cursor-pointer items-center justify-center"
                    >
                      {note ? (
                        <Dot
                          label={
                            labelMode === "name" ? note.name : note.label
                          }
                          isRoot={note.isRoot}
                          isActive={isActive}
                          isPlaying={playingKey === cellKey}
                        />
                      ) : (
                        <span className="h-7 w-7 rounded-full transition-colors group-hover:bg-foreground/5" />
                      )}
                    </button>
                  )
                }),
              )}
            </div>
          </div>
        </div>

        {/* fret numbers */}
        <div className="flex">
          <div className="w-6 shrink-0" />
          <div
            className="grid flex-1"
            style={{ gridTemplateColumns: "repeat(18, 1fr)" }}
          >
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
  )
}

const Dot = memo(function Dot({
  label,
  isRoot,
  isActive,
  isPlaying,
}: {
  label: string
  isRoot: boolean
  isActive: boolean
  isPlaying: boolean
}) {
  return (
    <span
      className={cn(
        "relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-transform duration-150 group-hover:scale-[1.18] group-hover:shadow-md",
        isActive
          ? isRoot
            ? "bg-[var(--root)] text-[var(--root-fg)] shadow-sm ring-2 ring-[var(--root-ring)]"
            : "bg-[var(--box)] text-[var(--box-fg)] shadow-sm"
          : isRoot
            ? "bg-[var(--root-dim)] text-[var(--root-dim-fg)]"
            : "bg-[var(--box-dim)] text-[var(--box-dim-fg)]",
        isPlaying && "z-10 scale-125 shadow-lg ring-2 ring-foreground/70",
      )}
    >
      {label}
    </span>
  )
})
