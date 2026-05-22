import { cn } from "@/lib/utils"

type Exercise = { id: string; label: string }

// The full practice curriculum. Only "boxes" is live in Phase 1, pinned on top.
const EXERCISES: Exercise[] = [
  { id: "boxes", label: "Box in all keys" },
  { id: "251", label: "II–V–I in all keys" },
  { id: "intervals", label: "Intervals in the box (6ths)" },
  { id: "pentatonics", label: "Pentatonics" },
  { id: "autumn-leaves", label: "Autumn Leaves" },
  { id: "bebop", label: "Bebop scale (dominant)" },
  { id: "alterations", label: "Dominant alterations" },
  { id: "voice-leading", label: "Voice leading" },
  { id: "chromatic", label: "Chromatic targeting" },
  { id: "251-one-note", label: "One note of II–V–I per key" },
  { id: "harmonic-minor", label: "Harmonic minor" },
  { id: "diminished", label: "Diminished + arpeggio" },
  { id: "pentachord", label: "Pentachord" },
  { id: "pyramid", label: "Pyramid exercise" },
  { id: "modes", label: "Modes on one string" },
  { id: "box-intervals", label: "Box with intervals (6ths)" },
]

const LIVE = "boxes"

export function ExerciseList({ active }: { active: string }) {
  return (
    <nav className="space-y-1">
      <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Curriculum
      </div>
      {EXERCISES.map((ex) => {
        const live = ex.id === LIVE
        const isActive = ex.id === active
        return (
          <div
            key={ex.id}
            aria-disabled={!live}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm",
              isActive && "bg-accent font-medium text-accent-foreground",
              live
                ? "cursor-pointer hover:bg-accent/60"
                : "cursor-not-allowed text-muted-foreground/50",
            )}
          >
            <span>{ex.label}</span>
            {!live && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground/70">
                soon
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
