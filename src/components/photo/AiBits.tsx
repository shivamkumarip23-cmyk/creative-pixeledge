import { useRef, useState } from "react";
import { Download, Share2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DropZone({
  label,
  preview,
  onFile,
  className,
}: {
  label: string;
  preview: string | null;
  onFile: (file: File) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cn(
        "relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] border border-dashed border-primary/30 bg-secondary/40 p-3 text-center text-[11px] text-muted-foreground transition-all hover:border-primary/70",
        over && "border-primary bg-primary/10 shadow-[0_0_0_1px_oklch(0.61_0.22_292/0.6)]",
        className,
      )}
    >
      {preview ? (
        <img src={preview} alt={label} className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-neon-pink/40 to-neon-blue/40">
            <Upload className="size-4 text-foreground" />
          </span>
          <span className="font-semibold text-foreground">{label}</span>
          <span>Tap or drop a photo</span>
        </>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onFile(f);
        }}
      />
    </button>
  );
}

/** Draggable before/after comparison. */
export function BeforeAfter({
  before,
  after,
  checkered,
}: {
  before: string;
  after: string;
  checkered?: boolean;
}) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-border",
          checkered && "checkerboard",
        )}
      >
        <img src={before} alt="Before" className="block w-full" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img
            src={after}
            alt="After"
            className="absolute inset-y-0 left-0 h-full max-w-none"
            style={{ width: `${(100 / pos) * 100}%` }}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-gradient-to-b from-neon-pink to-neon-blue"
          style={{ left: `${pos}%` }}
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold">
          After
        </span>
        <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold">
          Before
        </span>
      </div>
      <input
        type="range"
        min={2}
        max={98}
        value={pos}
        aria-label="Compare before and after"
        onChange={(e) => setPos(Number(e.target.value))}
        className="mt-3 w-full accent-[oklch(0.61_0.22_292)]"
      />
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass-card mt-5 p-4">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span>{label}</span>
        <span className="brand-text">{Math.round(value)}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-pink via-primary to-neon-blue transition-[width] duration-300"
          style={{ width: `${Math.max(3, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function ResultActions({ url, name }: { url: string; name: string }) {
  const share = async () => {
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], name, { type: blob.type || "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "Made with PhotoPro" });
      } else {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        toast.success("Copied to your clipboard");
      }
    } catch {
      toast.error("Sharing isn't available here — try downloading instead");
    }
  };

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <a
        href={url}
        download={name}
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-3 text-xs font-semibold"
      >
        <Download className="size-4" /> Download
      </a>
      <button
        type="button"
        onClick={share}
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-3 text-xs font-semibold"
      >
        <Share2 className="size-4" /> Share
      </button>
    </div>
  );
}
