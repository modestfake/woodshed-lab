import { type ReactNode } from "react";
import { ArrowDown, ArrowUp, Play, Repeat, Shuffle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Fixed transport docked to the bottom of the viewport. Holds everything that
// drives note-by-note playback (tempo, play/stop, direction, feel); the box and
// overlay pickers stay up top.
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
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur">
      {/* Left pad on md+ clears the sidebar (w-64) + the layout's gap-8, so the
          controls line up with the <main> column rather than the page edge. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pl-[calc(16rem+2rem+1.5rem)]">
        <Control label="Tempo">
          <div className="flex h-9 items-center gap-3">
            <Slider
              value={[bpm]}
              onValueChange={(v) => onBpmChange(v[0] ?? bpm)}
              min={40}
              max={240}
              step={5}
              className="w-32"
            />
            <span className="w-16 text-sm tabular-nums text-muted-foreground">{bpm} BPM</span>
          </div>
        </Control>

        <Button
          size="icon"
          onClick={(e) => {
            onToggle();
            e.currentTarget.blur();
          }}
          aria-label={isPlaying ? "Stop" : "Play"}
          title={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            <Square className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </Button>

        <Control label="Direction">
          <ToggleGroup
            type="single"
            size="sm"
            value={playMode}
            onValueChange={(v) => v && onPlayModeChange(v as PlayMode)}
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
        </Control>

        <Control label="Feel">
          <ToggleGroup
            type="single"
            size="sm"
            value={feel}
            onValueChange={(v) => v && onFeelChange(v as Feel)}
            variant="outline"
          >
            <ToggleGroupItem value="straight" className="px-3">
              Straight
            </ToggleGroupItem>
            <ToggleGroupItem value="swing" className="px-3">
              Swing
            </ToggleGroupItem>
          </ToggleGroup>
        </Control>
      </div>
    </div>
  );
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
        {label}
      </span>
      {children}
    </div>
  );
}
