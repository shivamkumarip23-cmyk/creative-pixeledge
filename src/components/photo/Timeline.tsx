import { useRef, useState } from "react";
import { Music4, Pause, Play, Plus, Trash2 } from "lucide-react";
import { CDN_MUSIC } from "@/lib/photo/music/video";
import { cn } from "@/lib/utils";

export type TimelinePhoto = { id: string; name: string; src: string };
export type TimelineMusic = { name: string; src: string };

export function Timeline({
  photos,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  onReorder,
  music,
  onRemoveMusic,
  onPickMusic,
  max = 4,
}: {
  photos: TimelinePhoto[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  music: TimelineMusic | null;
  onRemoveMusic: () => void;
  onPickMusic: () => void;
  max?: number;
}) {
  const dragIndex = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-border bg-[#0f0f0f] px-3 py-2">
      {/* Track 1 — photos */}
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-[10px] font-semibold tracking-widest text-muted-foreground">
          PHOTOS
        </span>
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {photos.length === 0 && (
            <span className="text-[11px] text-muted-foreground">No photos yet — tap Add</span>
          )}
          {photos.map((p, i) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null && dragIndex.current !== i) {
                  onReorder(dragIndex.current, i);
                }
                dragIndex.current = null;
              }}
              className={cn(
                "relative size-14 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                activeId === p.id ? "border-primary" : "border-border",
              )}
            >
              <button type="button" onClick={() => onSelect(p.id)} className="size-full">
                <img src={p.src} alt={p.name} className="size-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                aria-label={`Remove ${p.name}`}
                className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-black/70 text-white"
              >
                <Trash2 className="size-2.5" />
              </button>
            </div>
          ))}
          {photos.length < max && (
            <button
              type="button"
              onClick={onAdd}
              className="grid size-14 shrink-0 place-items-center rounded-xl border border-dashed border-primary/50 text-primary"
              aria-label="Add photo"
            >
              <Plus className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* Track 2 — music */}
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-[10px] font-semibold tracking-widest text-primary">
          MUSIC
        </span>
        {music ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-2 py-1.5">
            <button type="button" onClick={toggle} className="shrink-0 text-primary" aria-label="Play music">
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <Music4 className="size-3.5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{music.name}</span>
            <audio
              ref={audioRef}
              src={music.src}
              loop
              onEnded={() => setPlaying(false)}
              onError={(e) => {
                if (e.currentTarget.src !== CDN_MUSIC) e.currentTarget.src = CDN_MUSIC;
              }}
            />
            <button
              type="button"
              onClick={() => {
                audioRef.current?.pause();
                setPlaying(false);
                onRemoveMusic();
              }}
              aria-label="Remove music"
              className="shrink-0 text-muted-foreground"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onPickMusic}
            className="flex flex-1 items-center gap-2 rounded-xl border border-dashed border-primary/40 px-3 py-1.5 text-[11px] font-medium text-primary"
          >
            <Music4 className="size-3.5" /> Add music
          </button>
        )}
      </div>
    </div>
  );
}
