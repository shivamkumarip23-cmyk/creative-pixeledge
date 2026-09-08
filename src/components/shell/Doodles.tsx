import { Crown, Heart, Sparkle, Star, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tiny hand-drawn style sticker doodles scattered over the UI. */
export function Doodle({
  kind,
  className,
}: {
  kind: "crown" | "heart" | "star" | "sun" | "sparkle";
  className?: string;
}) {
  const Icon =
    kind === "crown" ? Crown : kind === "heart" ? Heart : kind === "star" ? Star : kind === "sun" ? Sun : Sparkle;
  return (
    <Icon
      aria-hidden
      className={cn("pointer-events-none absolute text-primary/70 drop-shadow-[0_0_10px_var(--neon-pink)]", className)}
      strokeWidth={1.6}
    />
  );
}

export function HandText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("font-hand leading-tight", className)}>{children}</span>;
}
