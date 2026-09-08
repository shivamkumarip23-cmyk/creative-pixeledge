import { motion } from "framer-motion";
import { Home, Images, Plus, LayoutGrid, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavKey = "home" | "library" | "edit" | "ai";

const LEFT: { key: NavKey; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "library", label: "Library", icon: Images },
];

const RIGHT: { key: NavKey; label: string; icon: typeof Home }[] = [
  { key: "edit", label: "Edit", icon: LayoutGrid },
  { key: "ai", label: "AI", icon: Wand2 },
];

export function BottomNav({
  active,
  onSelect,
  onAdd,
}: {
  active: NavKey;
  onSelect: (key: NavKey) => void;
  onAdd: () => void;
}) {
  const item = (entry: (typeof LEFT)[number]) => {
    const isActive = active === entry.key;
    return (
      <motion.button
        key={entry.key}
        type="button"
        whileTap={{ scale: 0.88 }}
        onClick={() => onSelect(entry.key)}
        className={cn(
          "relative flex flex-1 flex-col items-center gap-1 rounded-[18px] px-1 py-2 text-[9px] font-semibold tracking-wide transition-colors",
          isActive ? "text-primary" : "text-muted-foreground",
        )}
      >
        {isActive && (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 rounded-[18px] bg-primary/15"
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}
        <entry.icon className="relative size-5" />
        <span className="relative">{entry.label}</span>
      </motion.button>
    );
  };

  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 px-3 pb-4">
      <div className="mx-auto flex max-w-md items-center gap-1 rounded-full border border-primary/15 bg-surface-1/80 p-1.5 shadow-[var(--shadow-panel)] backdrop-blur-xl">
        {LEFT.map(item)}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onAdd}
          aria-label="Add a photo"
          className="gradient-pill -mt-7 grid size-14 shrink-0 place-items-center border-4 border-surface-1"
        >
          <Plus className="size-6" />
        </motion.button>
        {RIGHT.map(item)}
      </div>
    </nav>
  );
}
