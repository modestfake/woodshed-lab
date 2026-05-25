import { AudioLines, PanelLeftClose } from "lucide-react";
import { EXERCISES } from "@/exercises";
import { cn } from "@/lib/utils";

export function ExerciseList({
  selected,
  onSelect,
  onCollapse,
}: {
  selected: string;
  onSelect: (id: string) => void;
  // When provided, renders a collapse control in the Curriculum header (desktop).
  onCollapse?: () => void;
}) {
  const live = EXERCISES.filter((ex) => ex.status === "live");
  const soon = EXERCISES.filter((ex) => ex.status === "soon");

  return (
    <nav className="space-y-1">
      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Curriculum
        </span>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Collapse curriculum"
            title="Collapse"
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {live.map((ex) => {
        const isActive = ex.id === selected;
        return (
          <button
            key={ex.id}
            type="button"
            onClick={() => onSelect(ex.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
              isActive ? "border bg-card font-medium shadow-sm" : "hover:bg-accent/60",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--box)]" />
              {ex.label}
            </span>
            {isActive && <AudioLines className="h-4 w-4 text-[var(--box)]" />}
          </button>
        );
      })}

      <div className="flex items-center justify-between px-3 pt-5 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Coming soon
        </span>
        <span className="text-xs tabular-nums text-muted-foreground/60">{soon.length}</span>
      </div>

      {soon.map((ex) => (
        <div
          key={ex.id}
          className="flex w-full cursor-not-allowed items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground/50"
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
            {ex.label}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground/70">
            soon
          </span>
        </div>
      ))}
    </nav>
  );
}
