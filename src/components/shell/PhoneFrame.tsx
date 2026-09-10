import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const FRAME_W = 424; // 404px screen + 2×10px bezel padding
const FRAME_H = 860;

/**
 * Shows the app inside an iPhone 15 Pro style frame on desktop.
 * On phones/tablets the frame disappears and the app fills the screen.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const maxH = window.innerHeight * 0.9;
      const maxW = window.innerWidth;
      setScale(Math.min(1, maxH / FRAME_H, maxW / FRAME_W));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (isMobile) {
    return <div className="h-[100dvh] w-full overflow-hidden">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-canvas-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="relative"
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
          {/* titanium body */}
          <div
            className="relative rounded-[3.2rem] p-[10px]"
            style={{
              background:
                "linear-gradient(150deg, oklch(0.55 0.01 250), oklch(0.32 0.008 250) 40%, oklch(0.62 0.012 250) 70%, oklch(0.34 0.008 250))",
              boxShadow:
                "0 50px 120px -30px oklch(0 0 0 / 0.85), 0 0 0 1px oklch(0.7 0.01 250 / 0.25) inset",
            }}
          >
            {/* side buttons */}
            <span className="absolute top-32 -left-[3px] h-16 w-[3px] rounded-l bg-muted-foreground/50" />
            <span className="absolute top-52 -left-[3px] h-10 w-[3px] rounded-l bg-muted-foreground/50" />
            <span className="absolute top-44 -right-[3px] h-24 w-[3px] rounded-r bg-muted-foreground/50" />

            <div className="relative h-[860px] w-[404px] overflow-hidden rounded-[2.7rem] bg-background">
              {/* dynamic island */}
              <div className="pointer-events-none absolute top-2.5 left-1/2 z-40 h-8 w-28 -translate-x-1/2 rounded-full bg-black" />
              <div className="h-full w-full pt-0">{children}</div>
              {/* home indicator */}
              <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-40 h-1 w-32 -translate-x-1/2 rounded-full bg-foreground/40" />
            </div>
          </div>
          <p className="mt-4 text-center text-xs tracking-widest text-muted-foreground">
            PHOTOPRO EDITOR — MOBILE PREVIEW
          </p>
        </div>
      </motion.div>
    </div>
  );
}
