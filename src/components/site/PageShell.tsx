"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative pt-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.7_0.18_295/0.18),transparent_70%)]" />
      <section className="mx-auto max-w-[1400px] px-6">
        {eyebrow && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-accent" /> {eyebrow}
          </div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-balance text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.04em]"
        >
          {title}
        </motion.h1>
        {intro && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-2xl text-balance text-lg text-muted-foreground"
          >
            {intro}
          </motion.p>
        )}
        {children}
      </section>
    </div>
  );
}
