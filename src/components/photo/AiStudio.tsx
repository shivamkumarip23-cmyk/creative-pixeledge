import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Scissors,
  Smile,
  Sparkles,
  Wand2,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { BeforeAfter, DropZone, ProgressBar, ResultActions } from "@/components/photo/AiBits";
import { HandText } from "@/components/shell/Doodles";
import { removeBackground } from "@/lib/photo/ai/bgRemoval";
import { detectFace, swapFaces, type FaceBox } from "@/lib/photo/ai/faceSwap";
import { generateImage, stylizeWithAi } from "@/lib/photo/ai/generate";
import { applyArtStyle, upscaleEnhance } from "@/lib/photo/ai/ops";
import { loadImageFromFile } from "@/lib/photo/render";
import { cn } from "@/lib/utils";

type ToolId = "generate" | "removebg" | "faceswap" | "enhance" | "style" | "cartoon";

type Tool = { id: ToolId; title: string; sub: string; icon: typeof Sparkles; blurb: string };

const TOOLS: Tool[] = [
  {
    id: "generate",
    title: "AI Image Generator",
    sub: "Text to image",
    icon: ImagePlus,
    blurb: "Describe anything and a real AI model paints it for you.",
  },
  {
    id: "removebg",
    title: "Remove BG",
    sub: "One tap",
    icon: Scissors,
    blurb: "A real cut-out model erases the background right in your browser.",
  },
  {
    id: "faceswap",
    title: "Face Swap",
    sub: "Fun & creative",
    icon: Smile,
    blurb: "Faces are detected automatically, then blended with skin-tone matching.",
  },
  {
    id: "enhance",
    title: "Enhance Quality",
    sub: "HD upscale",
    icon: Sparkles,
    blurb: "Rebuild detail and sharpness at 2x or 4x the size.",
  },
  {
    id: "style",
    title: "Style Transfer",
    sub: "Turn into art",
    icon: Wand2,
    blurb: "Repaint your photo as a famous art style.",
  },
  {
    id: "cartoon",
    title: "Cartoonize",
    sub: "Cartoon magic",
    icon: WandSparkles,
    blurb: "Turn your photo into a bold, inked cartoon.",
  },
];

const ART_STYLES = [
  { id: "vangogh", name: "Van Gogh", local: "oil", prompt: "in the style of Vincent van Gogh, swirling thick oil brush strokes" },
  { id: "picasso", name: "Picasso", local: "popart", prompt: "in the cubist style of Pablo Picasso, bold geometric shapes" },
  { id: "monet", name: "Monet", local: "watercolor", prompt: "in the impressionist style of Claude Monet, soft dappled light" },
  { id: "cyberpunk", name: "Cyberpunk", local: "neon", prompt: "cyberpunk neon art, glowing pink and blue lights, futuristic" },
  { id: "oil", name: "Oil Painting", local: "oil", prompt: "classical oil painting, rich textured brush strokes" },
  { id: "sketch", name: "Sketch", local: "sketch", prompt: "detailed pencil sketch, graphite shading on paper" },
];

const BG_COLORS = [
  { id: "none", name: "None", value: null },
  { id: "white", name: "White", value: "#ffffff" },
  { id: "black", name: "Black", value: "#0a0a14" },
  { id: "pink", name: "Pink", value: "#ff6ec7" },
  { id: "purple", name: "Purple", value: "#8b5cf6" },
  { id: "blue", name: "Blue", value: "#3b82f6" },
];

const MAX_MP = 40; // megapixels safety limit

const canvasUrl = (c: HTMLCanvasElement) => c.toDataURL("image/png");

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

type Slot = { img: HTMLImageElement; url: string; face?: FaceBox | null };

function ToolView({ tool, onBack }: { tool: Tool; onBack: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("vangogh");
  const [factor, setFactor] = useState<2 | 4>(2);
  const [bgColor, setBgColor] = useState("none");
  const [a, setA] = useState<Slot | null>(null);
  const [b, setB] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [cutout, setCutout] = useState<HTMLCanvasElement | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const creep = (to: number, step = 2) => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setPct((p) => (p >= to ? p : Math.min(to, p + step))), 160);
  };
  const stopCreep = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const needs = tool.id === "generate" ? 0 : tool.id === "faceswap" ? 2 : 1;

  const pick = async (file: File, slot: "a" | "b") => {
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't a photo");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("That photo is too large — max 25 MB");
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      if ((img.width * img.height) / 1e6 > MAX_MP) {
        toast.error("That photo is too big to process — try a smaller one");
        return;
      }
      const next: Slot = { img, url: img.src };
      if (tool.id === "faceswap") {
        next.face = await detectFace(img);
        if (!next.face) toast.error("No face detected, try another photo");
      }
      (slot === "a" ? setA : setB)(next);
      setResult(null);
      setCutout(null);
    } catch {
      toast.error("That photo couldn't be opened");
    }
  };

  const ready =
    needs === 0 ? prompt.trim().length > 2 : needs === 1 ? !!a : !!a?.face && !!b?.face;

  const composeBg = (cut: HTMLCanvasElement, color: string | null) => {
    if (!color) return canvasUrl(cut);
    const c = document.createElement("canvas");
    c.width = cut.width;
    c.height = cut.height;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(cut, 0, 0);
    return canvasUrl(c);
  };

  const run = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setResult(null);
    setPct(3);
    try {
      switch (tool.id) {
        case "generate": {
          setStatus("Painting your idea with AI…");
          creep(92, 2);
          setResult(await generateImage(prompt.trim()));
          break;
        }
        case "removebg": {
          setStatus("Removing background with AI…");
          const cut = await removeBackground(a!.img, (r) => setPct(Math.round(r * 100)));
          setCutout(cut);
          setResult(composeBg(cut, BG_COLORS.find((x) => x.id === bgColor)?.value ?? null));
          break;
        }
        case "faceswap": {
          setStatus("Swapping faces with AI…");
          creep(90, 6);
          await new Promise((r) => setTimeout(r, 500));
          setResult(canvasUrl(swapFaces(a!.img, a!.face!, b!.img, b!.face!)));
          break;
        }
        case "enhance": {
          setStatus(`Enhancing to ${factor === 4 ? "4K" : "HD"}…`);
          creep(85, 5);
          await new Promise((r) => setTimeout(r, 250));
          setResult(canvasUrl(upscaleEnhance(a!.img, factor)));
          break;
        }
        case "style": {
          const s = ART_STYLES.find((x) => x.id === style)!;
          setStatus(`Applying ${s.name} magic…`);
          creep(88, 3);
          try {
            setResult(await stylizeWithAi(a!.url, `${s.prompt}, highly detailed artwork`));
          } catch {
            setResult(canvasUrl(applyArtStyle(a!.img, s.local, 1)));
            toast.message("Used the offline art engine (AI service unavailable)");
          }
          break;
        }
        default: {
          setStatus("Cartoonizing…");
          creep(88, 6);
          await new Promise((r) => setTimeout(r, 250));
          setResult(canvasUrl(applyArtStyle(a!.img, "cartoon", 1)));
        }
      }
      setPct(100);
      toast.success("Done — your result is ready");
    } catch {
      toast.error("That didn't work. Try again or use another photo.");
    } finally {
      stopCreep();
      setBusy(false);
      setStatus("");
    }
  };

  const applyBg = (id: string) => {
    setBgColor(id);
    if (cutout) setResult(composeBg(cutout, BG_COLORS.find((x) => x.id === id)?.value ?? null));
  };

  const quality = a ? Math.min(99, Math.round((Math.min(a.img.width, a.img.height) / 1080) * 100)) : 0;

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

      {needs === 0 ? (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="A dreamy pastel sunset over neon mountains…"
          className="mt-4 w-full resize-none rounded-[20px] border border-border bg-secondary/60 p-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />
      ) : (
        <div className={cn("mt-4 grid gap-3", needs === 2 ? "grid-cols-2" : "grid-cols-1")}>
          <FaceSlot
            label={needs === 2 ? "Target photo" : "Upload a photo"}
            slot={a}
            showFace={tool.id === "faceswap"}
            onFile={(f) => void pick(f, "a")}
          />
          {needs === 2 && (
            <FaceSlot label="Source face" slot={b} showFace onFile={(f) => void pick(f, "b")} />
          )}
        </div>
      )}

      {tool.id === "enhance" && a && (
        <div className="glass-card mt-4 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Current quality</span>
            <span className="brand-text font-bold">{quality}%</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {a.img.width} × {a.img.height} → {a.img.width * factor} × {a.img.height * factor}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {([2, 4] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFactor(f)}
                className={cn(
                  "rounded-2xl border px-2 py-2.5 text-[11px] font-semibold transition-colors",
                  factor === f
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary/60 text-muted-foreground",
                )}
              >
                {f}× {f === 4 ? "4K" : "HD"}
              </button>
            ))}
          </div>
        </div>
      )}

      {tool.id === "style" && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {ART_STYLES.map((s) => (
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
        {busy ? status : `Run ${tool.title}`}
      </button>

      {busy && <ProgressBar value={pct} label={status} />}

      {result && (
        <div className="glass-card mt-5 p-4">
          <p className="text-xs font-semibold">Result</p>

          {tool.id === "removebg" && (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {BG_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`Background ${c.name}`}
                  onClick={() => applyBg(c.id)}
                  className={cn(
                    "aspect-square rounded-full border-2 transition-all",
                    bgColor === c.id ? "border-primary" : "border-border",
                    !c.value && "checkerboard",
                  )}
                  style={c.value ? { background: c.value } : undefined}
                />
              ))}
            </div>
          )}

          <div className="mt-3">
            {a ? (
              <BeforeAfter before={a.url} after={result} checkered={tool.id === "removebg"} />
            ) : (
              <img
                src={result}
                alt={`${tool.title} result`}
                className="w-full rounded-2xl border border-border"
              />
            )}
          </div>

          <ResultActions url={result} name={`${tool.id}-result.png`} />
        </div>
      )}
    </main>
  );
}

function FaceSlot({
  label,
  slot,
  showFace,
  onFile,
}: {
  label: string;
  slot: Slot | null;
  showFace?: boolean;
  onFile: (f: File) => void;
}) {
  return (
    <div className="relative">
      <DropZone label={label} preview={slot?.url ?? null} onFile={onFile} />
      {showFace && slot && (
        <>
          {slot.face && (
            <span
              className="pointer-events-none absolute rounded-lg border-2 border-neon-pink"
              style={{
                left: `${(slot.face.x / slot.img.width) * 100}%`,
                top: `${(slot.face.y / slot.img.height) * 100}%`,
                width: `${(slot.face.w / slot.img.width) * 100}%`,
                height: `${(slot.face.h / slot.img.height) * 100}%`,
              }}
            />
          )}
          <span
            className={cn(
              "absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              slot.face ? "bg-primary/80" : "bg-destructive/80",
            )}
          >
            {slot.face ? "Face detected" : "No face detected"}
          </span>
        </>
      )}
    </div>
  );
}
