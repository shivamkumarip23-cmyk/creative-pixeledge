import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  COLLAGE_CATEGORIES,
  COLLAGE_TEMPLATES,
  renderCollage,
  type CollageTemplate,
} from "@/lib/photo/collage";
import { cn } from "@/lib/utils";

function TemplatePreview({ template }: { template: CollageTemplate }) {
  return (
    <div className="relative size-full">
      {template.rects.map((r, i) => (
        <span
          key={i}
          className={cn(
            "absolute bg-primary/25",
            r.shape === "circle" && "rounded-full",
            r.shape === "heart" && "rounded-[40%_40%_50%_50%/60%_60%_40%_40%]",
            r.shape === "diamond" && "rotate-45",
            !r.shape && "rounded-[3px]",
          )}
          style={{
            left: `${r.x * 100 + 1}%`,
            top: `${r.y * 100 + 1}%`,
            width: `${r.w * 100 - 2}%`,
            height: `${r.h * 100 - 2}%`,
            transform: r.rotate ? `rotate(${r.rotate}deg)` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function CollagePage({
  photos,
  onApply,
}: {
  photos: { id: string; name: string; img: HTMLImageElement }[];
  onApply: (canvas: HTMLCanvasElement, name: string) => void;
}) {
  const [cat, setCat] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const list = useMemo(
    () =>
      COLLAGE_TEMPLATES.filter(
        (t) =>
          (cat === "All" || t.cat === cat) &&
          (!query.trim() || t.name.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [cat, query],
  );

  const apply = (template: CollageTemplate) => {
    if (!photos.length) {
      toast.info("Add photos first — use the + button");
      return;
    }
    const canvas = document.createElement("canvas");
    renderCollage(canvas, template, photos.map((p) => p.img), 1440);
    onApply(canvas, `${template.name.toLowerCase().replace(/\s+/g, "-")}.jpg`);
    toast.success(`${template.name} applied`);
  };

  return (
    <div className="px-4 pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl">Collage</h1>
          <p className="text-xs text-muted-foreground">
            {photos.length ? `${photos.length} photo${photos.length > 1 ? "s" : ""} ready` : "Add photos to begin"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSearch((s) => !s)}
          aria-label="Search templates"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary"
        >
          <Search className="size-4" />
        </button>
      </div>

      {showSearch && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates…"
          className="mb-3 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
      )}

      <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {COLLAGE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              cat === c
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary hover:bg-muted",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 xl:grid-cols-5">
        {list.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => apply(tpl)}
            className="group overflow-hidden rounded-xl border border-border bg-surface-2 text-left transition-shadow hover:shadow-[var(--shadow-glow)]"
          >
            <div className="relative aspect-[3/4] bg-white p-2">
              <TemplatePreview template={tpl} />
            </div>
            <div className="flex items-center justify-between gap-1 px-2 py-1.5">
              <span className="truncate text-[11px] font-medium">{tpl.name}</span>
              <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-muted-foreground">
                <Sparkles className="size-2.5" />
                {tpl.cells}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
