import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Crop,
  Eraser,
  Images,
  LayoutGrid,
  Moon,
  Search,
  Settings,
  Smile,
  Sparkles,
  Sun,
  Type,
  Wand2,
  Brush,
  ImagePlus,
  Scissors,
  WandSparkles,
} from "lucide-react";
import { Doodle, HandText } from "@/components/shell/Doodles";
import { cn } from "@/lib/utils";

type Tab = "Filters" | "AI" | "Crop" | "Text" | "Stickers" | "Draw" | "Light" | "Collage";

const QUICK: { label: string; icon: typeof Crop; tab: Tab; tint: string }[] = [
  { label: "Edit", icon: Crop, tab: "Crop", tint: "bg-pastel-peach" },
  { label: "AI Tools", icon: Sparkles, tab: "AI", tint: "bg-pastel-lavender" },
  { label: "Filters", icon: WandSparkles, tab: "Filters", tint: "bg-pastel-sky" },
  { label: "Collage", icon: LayoutGrid, tab: "Collage", tint: "bg-pastel-mint" },
];

const POPULAR: { label: string; icon: typeof Crop; tab: Tab; tint: string }[] = [
  { label: "Background Changer", icon: Images, tab: "AI", tint: "bg-pastel-sky" },
  { label: "Object Remove", icon: Eraser, tab: "AI", tint: "bg-pastel-mint" },
  { label: "Face Retouch", icon: Smile, tab: "AI", tint: "bg-pastel-peach" },
  { label: "Magic Brush", icon: Brush, tab: "Draw", tint: "bg-pastel-lavender" },
  { label: "Text & Fonts", icon: Type, tab: "Text", tint: "bg-pastel-lavender" },
  { label: "Light & Color", icon: Sun, tab: "Light", tint: "bg-pastel-peach" },
];

const AI_CARDS: { title: string; sub: string; icon: typeof Crop }[] = [
  { title: "AI Image Generator", sub: "Text to image", icon: ImagePlus },
  { title: "Remove BG", sub: "One tap", icon: Scissors },
  { title: "Face Swap", sub: "Fun & creative", icon: Smile },
  { title: "Enhance Quality", sub: "HD upscale", icon: Sparkles },
  { title: "Style Transfer", sub: "Turn into art", icon: Wand2 },
  { title: "Cartoonize", sub: "Cartoon magic", icon: WandSparkles },
];

export function HomeScreen({
  onOpenPicker,
  theme,
  onToggleTheme,
}: {
  onOpenPicker: (tab?: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [query, setQuery] = useState("");

  const popular = useMemo(
    () => POPULAR.filter((t) => t.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );
  const aiCards = useMemo(
    () => AI_CARDS.filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  return (
    <main className="relative min-h-full px-5 pt-8 pb-10">
      <Doodle kind="star" className="top-24 right-8 size-4" />
      <Doodle kind="heart" className="top-72 left-4 size-4 -rotate-12" />

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Photo<span className="brand-text">Pro</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">Good to see you,</p>
          <HandText className="brand-text block text-2xl">Creative Soul! ♡</HandText>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="grid size-10 place-items-center rounded-full border border-border bg-secondary text-secondary-foreground"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <span className="grid size-10 place-items-center rounded-full border border-border bg-secondary">
            <Settings className="size-4 text-muted-foreground" />
          </span>
        </div>
      </header>

      <label className="mt-5 flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-3 backdrop-blur">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools, filters, effects..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      {/* Promo card */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => onOpenPicker("AI")}
        className="glass-card neon-glow relative mt-5 flex w-full items-center gap-3 overflow-hidden p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Turn your imagination</p>
          <p className="text-sm text-muted-foreground">into stunning photos</p>
          <span className="gradient-pill mt-4 inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold">
            Try AI Magic ✨
          </span>
        </div>
        <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-neon-pink/40 via-neon-purple/40 to-neon-blue/40">
          <Sparkles className="size-8 text-foreground" />
        </div>
        <Doodle kind="crown" className="top-3 right-4 size-5" />
      </motion.button>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        {QUICK.map((q) => (
          <motion.button
            key={q.label}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onOpenPicker(q.tab)}
            className="flex flex-col items-center gap-2"
          >
            <span className={cn("grid size-14 place-items-center rounded-2xl", q.tint)}>
              <q.icon className="size-6 text-ink" />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">{q.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Popular tools */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Popular Tools</h2>
        <button
          type="button"
          onClick={() => onOpenPicker()}
          className="text-[11px] font-medium text-primary"
        >
          See All →
        </button>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {popular.map((t) => (
          <motion.button
            key={t.label}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onOpenPicker(t.tab)}
            className="flex flex-col items-center gap-2"
          >
            <span className={cn("grid size-14 place-items-center rounded-2xl", t.tint)}>
              <t.icon className="size-6 text-ink" />
            </span>
            <span className="text-center text-[10px] leading-tight text-muted-foreground">
              {t.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* AI tools grid */}
      <div className="mt-8">
        <h2 className="text-lg font-extrabold">
          AI <span className="brand-text">Tools</span>
        </h2>
        <HandText className="text-lg text-muted-foreground">
          Let your imagination create magic ✨
        </HandText>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {aiCards.map((c) => (
            <motion.button
              key={c.title}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenPicker("AI")}
              className="glass-card relative overflow-hidden p-4 text-left"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-neon-pink/30 to-neon-blue/30">
                <c.icon className="size-4 text-foreground" />
              </span>
              <p className="mt-6 text-sm font-semibold">{c.title}</p>
              <p className="text-[11px] text-muted-foreground">{c.sub}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Collage / templates teaser */}
      <div className="glass-card mt-8 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Collage & Templates</h2>
          <HandText className="brand-text text-xl">Better Together</HandText>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["Layout", "Border", "Sticker", "Background", "Trending", "Aesthetic"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onOpenPicker("Stickers")}
              className="rounded-2xl border border-border bg-secondary/60 px-2 py-4 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenPicker()}
        className="gradient-pill mt-8 flex w-full items-center justify-center gap-2 px-6 py-4 text-sm font-semibold"
      >
        Open a photo to start editing
      </button>
    </main>
  );
}
