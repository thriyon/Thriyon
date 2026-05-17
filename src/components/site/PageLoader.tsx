"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface PageLoaderProps {
  isReady: boolean;
}

const LETTERS = "THRIYON".split("");

export function PageLoader({ isReady }: PageLoaderProps) {
  const [visible, setVisible] = useState(true);
  const [minTimeDone, setMinTimeDone] = useState(false);

  // Minimum display time — animation must play fully (2.5s) regardless of WebGL speed
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeDone(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Only dismiss when BOTH WebGL is ready AND minimum time has elapsed
  useEffect(() => {
    if (isReady && minTimeDone) {
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isReady, minTimeDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[oklch(0.06_0.008_270)]"
        >
          {/* Background radial glow that pulses */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.7_0.18_295)] blur-[140px]"
          />

          {/* Rotating ring 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.7_0.18_295/0.12)]"
            style={{ borderStyle: "dashed" }}
          />
          {/* Rotating ring 2 (opposite) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.7_0.18_295/0.07)]"
          />

          {/* Orbiting dot on ring 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[oklch(0.7_0.18_295)] shadow-[0_0_10px_4px_oklch(0.7_0.18_295/0.5)]" />
          </motion.div>

          {/* Orbiting dot on ring 2 */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/40 shadow-[0_0_8px_2px_rgba(255,255,255,0.2)]" />
          </motion.div>

          {/* Logo letters — stagger in one by one */}
          <div className="relative flex items-end gap-0">
            {LETTERS.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-display text-[clamp(3rem,10vw,6.5rem)] tracking-[-0.055em] text-white"
              >
                {ch}
              </motion.span>
            ))}
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.45em] text-white"
          >
            Sovereign Build
          </motion.div>

          {/* Timed progress bar — fills over 2.5s then completes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-12 relative h-px w-40 rounded-full bg-white/8"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isReady && minTimeDone ? 1 : 0.85 }}
              transition={
                isReady && minTimeDone
                  ? { duration: 0.3, ease: "easeOut" }
                  : { duration: 2.3, delay: 0.2, ease: [0.4, 0, 0.2, 1] }
              }
              style={{ originX: 0 }}
              className="absolute inset-y-0 left-0 w-full rounded-full bg-[oklch(0.7_0.18_295/0.8)]"
            />
          </motion.div>

          {/* Status text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-white/25"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isReady && minTimeDone ? "ready" : "loading"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {isReady && minTimeDone ? "Ready" : "Initializing…"}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Bottom edge shimmer — reveals as curtain lifts */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.7_0.18_295/0.4)] to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
