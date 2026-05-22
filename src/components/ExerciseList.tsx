import { EXERCISES } from "@/exercises"
import { cn } from "@/lib/utils"

export function ExerciseList({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="space-y-1">
      <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Curriculum
      </div>
      {EXERCISES.map((ex) => {
        const live = ex.status === "live"
        const isActive = ex.id === selected
        return (
          <button
            key={ex.id}
            type="button"
            disabled={!live}
            onClick={() => onSelect(ex.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm",
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
          </button>
        )
      })}
    </nav>
  )
}
