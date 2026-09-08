import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  ImagePlus,
  Loader2,
  Scissors,
  Smile,
  Sparkles,
  Upload,
  Wand2,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { HandText } from "@/components/shell/Doodles";
import { removeBackground } from "@/lib/photo/ai/bgRemoval";
import { applyArtStyle, toCanvas, upscaleEnhance } from "@/lib/photo/ai/ops";
import { loadImageFromFile } from "@/lib/photo/render";
import { cn } from "@/lib/utils";

type ToolId = "generate" | "removebg" | "faceswap" | "enhance" | "style" | "cartoon";

type Tool = {
  id: ToolId;
  title: string;
  sub: string;
  icon: typeof Sparkles;
  /** how many photos the tool needs */
  inputs: 0 | 1 | 2;
  blurb: string;
};

const TOOLS: Tool[] = [
  {
    id: "generate",
    title: "AI Image Generator",
    sub: "Text to image",
    icon: ImagePlus,
    inputs: 0,
    blurb: "Describe anything and get a dreamy generated artwork.",
  },
  {
    id: "removebg",
    title: "Remove BG",
    sub: "One tap",
    icon: Scissors,
    inputs: 1,
    blurb: "Cut out the subject and drop the background instantly.",
  },
  {
    id: "faceswap",
    title: "Face Swap",
    sub: "Fun & creative",
    icon: Smile,
    inputs: 2,
    blurb: "Blend a face from one photo onto another for a playful mix.",
  },
  {
    id: "enhance",
    title: "Enhance Quality",
    sub: "HD upscale",
    icon: Sparkles,
    inputs: 1,
    blurb: "Rebuild detail and sharpness at double the size.",
  },
  {
    id: "style",
    title: "Style Transfer",
    sub: "Turn into art",
    icon: Wand2,
    inputs: 1,
    blurb: "Repaint your photo in a painterly art style.",
  },
  {
    id: "cartoon",
    title: "Cartoonize",
    sub: "Cartoon magic",
    icon: WandSparkles,
    inputs: 1,
    blurb: "Turn your photo into a bold, inked cartoon.",
  },
];

const STYLES = [
  { id: "oil", name: "Oil Paint" },
  { id: "watercolor", name: "Watercolour" },
  { id: "sketch", name: "Sketch" },
  { id: "popart", name: "Pop Art" },
  { id: "neon", name: "Neon" },
  { id: "duotone", name: "Duotone" },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Procedural "generated" artwork used when no image model key is configured. */
function mockGenerate(prompt: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 768;
  const ctx = c.getContext("2d")!;
  let seed = 0;
  for (let i = 0; i < prompt.length; i++) seed = (seed * 31 + prompt.charCodeAt(i)) % 100000;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

  const g = ctx.createLinearGradient(0, 0, c.width, c.height);
  g.addColorStop(0, `hsl(${Math.floor(rnd() * 360)} 90% 62%)`);
  g.addColorStop(0.5, `hsl(${Math.floor(rnd() * 360)} 85% 58%)`);
  g.addColorStop(1, `hsl(${Math.floor(rnd() * 360)} 80% 45%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);

  for (let i = 0; i < 26; i++) {
    ctx.globalAlpha = 0.12 + rnd() * 0.25;
    ctx.beginPath();
    ctx.arc(rnd() * c.width, rnd() * c.height, 40 + rnd() * 220, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${Math.floor(rnd() * 360)} 95% ${40 + rnd() * 45}%)`;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const words = prompt.trim().slice(0, 60) || "dream";
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, c.height - 120, c.width, 120);
  ctx.fillStyle = "#fff";
  ctx.font = "600 30px Poppins, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(words, 32, c.height - 60, c.width - 64);
  return c;
}

/** Playful face blend: soft oval from photo B composited over the centre of A. */
function mockFaceSwap(base: HTMLImageElement, face: HTMLImageElement): HTMLCanvasElement {
  const out = toCanvas(base);
  const ctx = out.getContext("2d")!;
  const w = out.width;
  const h = out.height;
  const rx = w * 0.19;
  const ry = h * 0.24;
  const cx = w / 2;
  const cy = h * 0.38;

  const layer = document.createElement("canvas");
  layer.width = w;
  layer.height = h;
  const lctx = layer.getContext("2d")!;
  const scale = Math.max((rx * 2.4) / face.width, (ry * 2.4) / face.height);
  const dw = face.width * scale;
  const dh = face.height * scale;
  lctx.drawImage(face, cx - dw / 2, cy - dh / 2, dw, dh);
  lctx.globalCompositeOperation = "destination-in";
  const grad = lctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.25, cx, cy, Math.max(rx, ry));
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(0.7, "rgba(0,0,0,0.92)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  lctx.fillStyle = grad;
  lctx.save();
  lctx.translate(cx, cy);
  lctx.scale(1, ry / rx);
  lctx.beginPath();
  lctx.arc(0, 0, rx, 0, Math.PI * 2);
  lctx.restore();
  lctx.fillRect(0, 0, w, h);
  lctx.globalCompositeOperation = "source-over";

  ctx.globalAlpha = 0.92;
  ctx.drawImage(layer, 0, 0);
  ctx.globalAlpha = 1;
  return out;
}

function canvasUrl(c: HTMLCanvasElement) {
  return c.toDataURL("image/png");
}

export function AiStudio() {
  const [active, setActive] = useState<Tool | null>(null);

  if (active) return <ToolView tool={active} onBack={() => setActive(null)} />;

  return (
    <main className="px-5 pt-8 pb-10">
      <h1 className="text-2xl font-extrabold tracking-tight">
        AI <span className="brand-text">Tools</span>
      </h1>
      <HandText className="text-xl text-muted-foreground">
        Let your imagination create magic ✨
      </HandText>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {TOOLS.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setActive(t)}
            className="group relative overflow-hidden rounded-[20px] border border-primary/15 bg-gradient-to-br from-[oklch(0.24_0.07_285)] to-[oklch(0.16_0.05_275)] p-4 text-left transition-all hover:border-primary/60 hover:shadow-[0_0_0_1px_oklch(0.61_0.22_292/0.5),0_18px_40px_-18px_oklch(0.61_0.22_292/0.9)]"
          >
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-neon-pink/40 to-neon-blue/40">
              <t.icon className="size-4 text-foreground" />
            </span>
            <p className="mt-6 text-sm font-bold">{t.title}</p>
            <p className="text-[11px] text-muted-foreground">{t.sub}</p>
          </motion.button>
        ))}
      </div>
    </main>
  );
}

function ToolView({ tool, onBack }: { tool: Tool; onBack: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("oil");
  const [imgA, setImgA] = useState<HTMLImageElement | null>(null);
  const [imgB, setImgB] = useState<HTMLImageElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const refA = useRef<HTMLInputElement>(null);
  const refB = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined, slot: "a" | "b") => {
    if (!file) return;
    try {
      const img = await loadImageFromFile(file);
      (slot === "a" ? setImgA : setImgB)(img);
      setResult(null);
    } catch {
      toast.error("That file couldn't be opened as a photo");
    }
  };

  const ready =
    tool.inputs === 0 ? prompt.trim().length > 0 : tool.inputs === 1 ? !!imgA : !!imgA && !!imgB;

  const run = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setResult(null);
    setStatus("AI Processing…");
    try {
      await wait(300);
      let out: HTMLCanvasElement;
      switch (tool.id) {
        case "generate":
          await wait(1200);
          out = mockGenerate(prompt);
          break;
        case "removebg":
          setStatus("AI Processing… cutting out the subject");
          out = await removeBackground(imgA!, (r) =>
            setStatus(`AI Processing… ${Math.round(r * 100)}%`),
          );
          break;
        case "faceswap":
          await wait(900);
          out = mockFaceSwap(imgA!, imgB!);
          break;
        case "enhance":
          await wait(400);
          out = upscaleEnhance(imgA!, 2);
          break;
        case "style":
          await wait(400);
          out = applyArtStyle(imgA!, style, 1);
          break;
        default:
          await wait(400);
          out = applyArtStyle(imgA!, "cartoon", 1);
      }
      setResult(canvasUrl(out));
      toast.success("Done — your result is ready");
    } catch {
      toast.error("That didn't work. Try another photo.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  };

  const uploadBox = (slot: "a" | "b", label: string, img: HTMLImageElement | null) => (
    <button
      type="button"
      onClick={() => (slot === "a" ? refA : refB).current?.click()}
      className="relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] border border-dashed border-primary/30 bg-secondary/40 text-xs text-muted-foreground transition-colors hover:border-primary/70"
    >
      {img ? (
        <img src={img.src} alt={label} className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <Upload className="size-5" />
          {label}
        </>
      )}
    </button>
  );

  return (
    <main className="px-5 pt-8 pb-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to AI tools"
          className="grid size-10 place-items-center rounded-full border border-border bg-secondary"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold">{tool.title}</h1>
          <p className="text-[11px] text-muted-foreground">{tool.sub}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{tool.blurb}</p>

      {tool.inputs === 0 ? (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="A dreamy pastel sunset over neon mountains…"
          className="mt-4 w-full resize-none rounded-[20px] border border-border bg-secondary/60 p-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />
      ) : (
        <div className={cn("mt-4 grid gap-3", tool.inputs === 2 ? "grid-cols-2" : "grid-cols-1")}>
          {uploadBox("a", tool.inputs === 2 ? "Base photo" : "Upload a photo", imgA)}
          {tool.inputs === 2 && uploadBox("b", "Face photo", imgB)}
        </div>
      )}

      <input
        ref={refA}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void pick(f, "a");
        }}
      />
      <input
        ref={refB}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void pick(f, "b");
        }}
      />

      {tool.id === "style" && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              className={cn(
                "rounded-2xl border px-2 py-2.5 text-[11px] font-medium transition-colors",
                style === s.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary/60 text-muted-foreground",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={!ready || busy}
        onClick={run}
        className="gradient-pill mt-5 flex w-full items-center justify-center gap-2 px-6 py-4 text-sm font-semibold disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {busy ? status || "AI Processing…" : `Run ${tool.title}`}
      </button>

      {result && (
        <div className="glass-card mt-5 p-4">
          <p className="text-xs font-semibold">Result</p>
          <img
            src={result}
            alt={`${tool.title} result`}
            className="mt-3 w-full rounded-2xl border border-border"
          />
          <a
            href={result}
            download={`${tool.id}-result.png`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-3 text-xs font-semibold"
          >
            <Download className="size-4" /> Download result
          </a>
        </div>
      )}
    </main>
  );
}
