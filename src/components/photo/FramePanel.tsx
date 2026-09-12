import { AdjustSlider } from "./AdjustSlider";
import { ColorRow } from "./TextPanel";
import { frames, type FrameSettings } from "@/lib/photo/frames";
import { cn } from "@/lib/utils";

const GROUPS = ["Basic", "Soft", "Modern", "Retro"];

export function FramePanel({
  frame,
  onChange,
  onBegin,
}: {
  frame: FrameSettings;
  onChange: (patch: Partial<FrameSettings>) => void;
  onBegin: () => void;
}) {
  return (
    <div className="space-y-3">
      {GROUPS.map((group) => (
        <div key={group}>
          <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground">
            {group.toUpperCase()}
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {frames
              .filter((f) => f.group === group || (group === "Basic" && f.id === "none"))
              .map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    onBegin();
                    onChange({ id: f.id });
                  }}
                  className={cn(
                    "shrink-0 rounded-xl border px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors",
                    frame.id === f.id
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-secondary hover:bg-muted",
                  )}
                >
                  {f.name}
                </button>
              ))}
          </div>
        </div>
      ))}

      <ColorRow
        label="FRAME COLOUR"
        value={frame.color}
        onChange={(color) => onChange({ color })}
        onBegin={onBegin}
      />

      <AdjustSlider
        label="Thickness"
        value={frame.width}
        min={10}
        max={140}
        onChange={(v) => onChange({ width: v })}
        onReset={() => onChange({ width: 50 })}
      />
    </div>
  );
}
