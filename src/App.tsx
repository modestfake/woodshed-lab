import { useState, type CSSProperties } from "react";
import { Menu, PanelLeftOpen } from "lucide-react";
import { ExerciseList } from "@/components/ExerciseList";
import { ModeToggle } from "@/components/ModeToggle";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import { ShortcutsHelp } from "@/components/ShortcutsHelp";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { EXERCISES } from "@/exercises";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "woodshed-sidebar-collapsed";

function App() {
  const [selectedId, setSelectedId] = useState("boxes");
  const [navOpen, setNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === "1");
  const exercise = EXERCISES.find((e) => e.id === selectedId) ?? EXERCISES[0];
  const Body = exercise.component;

  // Selecting closes the mobile drawer; on desktop the drawer is never open.
  const select = (id: string) => {
    setSelectedId(id);
    setNavOpen(false);
  };

  const toggleCollapsed = () =>
    setNavCollapsed((c) => {
      localStorage.setItem(SIDEBAR_KEY, c ? "0" : "1");
      return !c;
    });

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <h1 className="text-lg font-semibold">Woodshed Lab</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="hidden md:block">
              <ShortcutsHelp />
            </div>
            <div className="md:hidden">
              <PaletteSwitcher variant="compact" />
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <div
        className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 md:flex-row"
        style={{ "--play-pad-left": navCollapsed ? "6rem" : "19.5rem" } as CSSProperties}
      >
        {/* Desktop: full sidebar, animating to a thin icon rail. Mobile: a drawer.
            Width transitions on one element; the list is kept mounted at full
            width (clipped + faded) so the collapse reads as a smooth slide. */}
        <aside
          className={cn(
            "relative hidden shrink-0 overflow-hidden transition-[width] duration-200 ease-linear md:block",
            navCollapsed ? "md:w-10" : "md:w-64",
          )}
        >
          <div
            className={cn(
              "absolute top-1 left-0 flex w-10 justify-center transition-opacity duration-200",
              navCollapsed ? "opacity-100 delay-150" : "pointer-events-none opacity-0",
            )}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleCollapsed}
              aria-label="Expand curriculum"
              title="Expand curriculum"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          </div>
          <div
            className={cn(
              "w-64 transition-opacity duration-200",
              navCollapsed ? "pointer-events-none opacity-0" : "opacity-100",
            )}
          >
            <ExerciseList selected={selectedId} onSelect={select} onCollapse={toggleCollapsed} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Mobile-only: shows the selected exercise; opens the curriculum drawer. */}
          <Drawer direction="left" open={navOpen} onOpenChange={setNavOpen}>
            <DrawerTrigger asChild>
              <button className="mb-4 flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm md:hidden">
                <span className="flex items-center gap-2">
                  <Menu className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{exercise.label}</span>
                </span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Curriculum
                </span>
              </button>
            </DrawerTrigger>
            <DrawerContent aria-describedby={undefined}>
              <DrawerTitle className="sr-only">Curriculum</DrawerTitle>
              <div className="flex-1 overflow-y-auto p-3 pt-5">
                <ExerciseList selected={selectedId} onSelect={select} />
              </div>
            </DrawerContent>
          </Drawer>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">{exercise.label}</h2>
            {exercise.description && (
              <p className="mt-1 text-sm text-muted-foreground">{exercise.description}</p>
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

      <PaletteSwitcher variant="floating" />
    </div>
  );
}

export default App;
