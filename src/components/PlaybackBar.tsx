import { ArrowDown, ArrowUp, Gauge, Play, Repeat, Shuffle, Square } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { PlayMode } from "@/hooks/usePlayback";

type Feel = "straight" | "swing";

interface PlaybackBarProps {
  isPlaying: boolean;
  onToggle: () => void;
  playMode: PlayMode;
  onPlayModeChange: (m: PlayMode) => void;
  feel: Feel;
  onFeelChange: (f: Feel) => void;
  bpm: number;
  onBpmChange: (b: number) => void;
}

// The playback transport. A centered floating island on desktop; a docked bar
// pinned to the bottom of the viewport on mobile. Holds everything that drives
// note-by-note playback (tempo, play/stop, direction, feel); the box and overlay
// pickers stay up top.
export function PlaybackBar({
  isPlaying,
  onToggle,
  playMode,
  onPlayModeChange,
  feel,
  onFeelChange,
  bpm,
  onBpmChange,
}: PlaybackBarProps) {
  // The island is centered over the main column (not the viewport): the wrapper's
  // left pad tracks the sidebar width via --play-pad-left so the pill clears the nav.
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:bottom-6">
      <div className="mx-auto max-w-6xl md:flex md:justify-center md:pr-6 md:pl-[var(--play-pad-left,19.5rem)] md:transition-[padding] md:duration-200 md:ease-linear">
        <div className="pointer-events-auto flex flex-col gap-3 border-t bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:flex-row md:items-center md:gap-3 md:rounded-full md:border md:px-5 md:py-2 md:shadow-xl">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              value={[bpm]}
              onValueChange={(v) => onBpmChange(v[0] ?? bpm)}
              min={40}
              max={240}
              step={5}
              className="min-w-0 flex-1 [&_[data-slot=slider-range]]:bg-[var(--box)] [&_[data-slot=slider-thumb]]:border-[var(--box)] [&_[data-slot=slider-thumb]]:bg-white md:w-28 md:flex-none"
            />
            <span className="w-16 shrink-0 text-right text-sm whitespace-nowrap tabular-nums text-muted-foreground md:text-left">
              {bpm} BPM
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3 md:justify-start md:gap-3">
            <ToggleGroup
              type="single"
              size="sm"
              value={playMode}
              onValueChange={(v) => v && onPlayModeChange(v as PlayMode)}
            >
              <ToggleGroupItem
                value="asc"
                aria-label="Ascending"
                title="Ascending"
                className="px-2"
              >
                <ArrowUp className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="desc"
                aria-label="Descending"
                title="Descending"
                className="px-2"
              >
                <ArrowDown className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="loop"
                aria-label="Loop back and forth"
                title="Loop (back & forth)"
                className="px-2"
              >
                <Repeat className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="random"
                aria-label="Shuffle (random order)"
                title="Shuffle (random order)"
                className="px-2"
              >
                <Shuffle className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Separator />

            <button
              onClick={(e) => {
                onToggle();
                e.currentTarget.blur();
              }}
              aria-label={isPlaying ? "Stop" : "Play"}
              title={isPlaying ? "Stop" : "Play"}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-transform hover:scale-105"
            >
              {isPlaying ? (
                <Square className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 translate-x-px fill-current" />
              )}
            </button>

            <Separator />

            <ToggleGroup
              type="single"
              size="sm"
              value={feel}
              onValueChange={(v) => v && onFeelChange(v as Feel)}
              variant="outline"
            >
              <ToggleGroupItem value="straight" className="px-2">
                Straight
              </ToggleGroupItem>
              <ToggleGroupItem value="swing" className="px-2">
                Swing
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

// Vertical divider between the bar's zones — desktop only (the bar stacks on mobile).
function Separator() {
  return <span aria-hidden className="hidden h-7 w-px shrink-0 bg-border md:block" />;
}
