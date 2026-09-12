import { useMemo, useRef, useState } from "react";
import { ImagePlus, Link2, Search } from "lucide-react";
import { toast } from "sonner";
import { allStickers, stickerCategories } from "@/lib/photo/overlays";
import { cn } from "@/lib/utils";

export function StickerPanel({
  onAdd,
  onAddImage,
}: {
  onAdd: (char: string) => void;
  onAddImage?: (src: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allStickers.filter(
      (s) =>
        (category === "All" || s.category === category) &&
        (!q || s.category.toLowerCase().includes(q) || s.char.includes(q)),
    );
  }, [query, category]);

  const addUrl = () => {
    const src = url.trim();
    if (!/^https?:\/\//i.test(src)) {
      toast.error("Paste a full image link starting with http");
      return;
    }
    onAddImage?.(src);
    setUrl("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stickers (love, party, food…)"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {onAddImage && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-52 flex-1 items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2">
            <Link2 className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
              placeholder="Add sticker from image URL"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="button"
            onClick={addUrl}
            className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <ImagePlus className="size-4" /> Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => onAddImage(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </div>
      )}


      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {["All", ...stickerCategories.map((c) => c.name)].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              category === c
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary hover:bg-muted",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12">
        {results.map((s, i) => (
          <button
            key={`${s.char}-${i}`}
            type="button"
            onClick={() => onAdd(s.char)}
            className="grid aspect-square place-items-center rounded-xl bg-secondary text-xl transition-transform hover:scale-110 hover:bg-muted"
          >
            {s.char}
          </button>
        ))}
        {!results.length && (
          <p className="col-span-full py-4 text-center text-xs text-muted-foreground">
            No stickers match that search.
          </p>
        )}
      </div>
    </div>
  );
}
