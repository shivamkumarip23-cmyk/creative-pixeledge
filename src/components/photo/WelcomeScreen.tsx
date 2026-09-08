import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/welcome-hero.jpg";
import { Doodle, HandText } from "@/components/shell/Doodles";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative h-full w-full overflow-hidden bg-surface-1">
      <img
        src={heroImg}
        alt="Portrait lit with pink and purple neon light"
        width={1024}
        height={1536}
        className="absolute inset-0 size-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/90" />

      <Doodle kind="crown" className="top-16 right-10 size-7 rotate-12" />
      <Doodle kind="heart" className="top-40 left-8 size-5 -rotate-12" />
      <Doodle kind="sparkle" className="top-28 left-24 size-4" />

      <div className="relative flex h-full flex-col justify-between px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-6"
        >
          <HandText className="block text-4xl text-white/95">Edit</HandText>
          <HandText className="block pl-6 text-4xl text-white/95">Create</HandText>
          <HandText className="block pl-12 text-4xl text-white/95">Express ♡</HandText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="text-foreground">Photo</span>
            <span className="brand-text">Pro</span>
          </h1>
          <p className="mt-2 text-sm tracking-[0.2em] text-muted-foreground">
            YOUR VISION • OUR TOOLS
          </p>

          <button
            type="button"
            onClick={onStart}
            className="gradient-pill mt-10 inline-flex w-full items-center justify-center gap-2 px-8 py-4 text-base font-semibold"
          >
            Get Started
            <ArrowRight className="size-5" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-primary" />
            <span className="size-1.5 rounded-full bg-muted-foreground/60" />
            <span className="size-1.5 rounded-full bg-muted-foreground/60" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
