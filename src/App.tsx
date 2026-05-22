import { useState } from "react"
import { ExerciseList } from "@/components/ExerciseList"
import { ModeToggle } from "@/components/ModeToggle"
import { PaletteSwitcher } from "@/components/PaletteSwitcher"
import { ShortcutsHelp } from "@/components/ShortcutsHelp"
import { EXERCISES } from "@/exercises"

function App() {
  const [selectedId, setSelectedId] = useState("boxes")
  const exercise = EXERCISES.find((e) => e.id === selectedId) ?? EXERCISES[0]
  const Body = exercise.component

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--box)] font-bold text-[var(--box-fg)]">
              ♭
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none">Woodshed Lab</h1>
              <p className="text-xs text-muted-foreground">
                Ted Greene box system · 3 notes per string
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ShortcutsHelp />
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-64">
          <ExerciseList selected={selectedId} onSelect={setSelectedId} />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              {exercise.label}
            </h2>
            {exercise.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {exercise.description}
              </p>
            )}
          </div>
          {Body ? (
            <Body />
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
              Coming soon.
            </div>
          )}
        </main>
      </div>

      <PaletteSwitcher />
    </div>
  )
}

export default App
