"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useAnimationFrame, useMotionTemplate, useMotionValue, animate, motionValue } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { HeroSphere } from "@/components/site/HeroSphere";
import { PageLoader } from "@/components/site/PageLoader";
import { talents } from "@/lib/mock";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const suggestions = ["Brand Strategy", "3D & Motion", "Product Design", "Full-stack Engineering", "Type Design", "Photography", "Sound Design", "Art Direction"];
  const filtered = query.length > 0 ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase())) : [];
  const handleSubmit = useCallback((e: React.FormEvent) => { e.preventDefault(); if (query.trim()) router.push("/talent"); }, [query, router]);
  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <div className={`relative flex items-center rounded-full border transition-all duration-300 ${focused ? "border-accent/50 bg-white/8 shadow-[0_0_30px_-5px_oklch(0.7_0.18_295/0.3)]" : "border-white/12 bg-white/5"}`}>
        <svg className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 200)} placeholder="Search freelancers, skills, services…" className="w-full bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
        {query && (<button type="button" onClick={() => setQuery("")} className="mr-2 rounded-full p-1 text-muted-foreground hover:text-foreground"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>)}
      </div>
      {focused && filtered.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl">
          {filtered.map((s) => (<button key={s} type="button" onMouseDown={() => { setQuery(s); router.push("/talent"); }} className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"><svg className="h-3.5 w-3.5 shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>{s}</button>))}
        </motion.div>
      )}
    </form>
  );
}

function Hero({ onReady }: { onReady: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[720px] w-full overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <HeroSphere onReady={onReady} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_50%,transparent_30%,oklch(0.06_0.008_270/0.9)_85%)]" />
        <div className="pointer-events-none absolute inset-0 scanline opacity-30" />
      </motion.div>
      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" /></span>
          Live · index 01 · sovereign build
        </motion.div>
        <h1 className="font-display text-[clamp(4rem,15vw,14rem)] leading-[0.82] tracking-[-0.055em]">
          {"THRIYON".split("").map((ch, i) => (<motion.span key={i} initial={{ opacity: 0, y: 80, rotateX: -40 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }} className="inline-block">{ch}</motion.span>))}
        </h1>
        <div className="mt-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-6">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }} className="max-w-xl text-balance text-base text-muted-foreground md:text-lg">An operating system for elite freelancers, studios and clients. Cinematic. Sovereign. Quietly powerful.</motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}><SearchBar /></motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.1 }} className="flex flex-wrap items-center gap-3">
            <Link href="/talent" className="group relative overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:scale-[1.02]">Enter the index →</Link>
            <Link href="/how-it-works" className="rounded-full border border-white/15 px-6 py-3 text-sm text-foreground/90 transition hover:border-white/40 hover:bg-white/5">The method</Link>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-6 right-6 z-10 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block">↓ Scroll · cinematic descent</div>
    </section>
  );
}

function Marquee() {
  const items = ["Atlas Research", "Monolith", "Nova Audio", "Obsidian Capital", "Halo Quarterly", "Vector Dynamics", "Iris Studio", "Lumen Works"];
  return (
    <section className="border-y border-white/6 py-8">
      <div className="relative overflow-hidden">
        <div className="marquee flex w-max gap-16 whitespace-nowrap font-display text-2xl tracking-[-0.02em] text-muted-foreground/60">
          {[...items, ...items, ...items].map((it, i) => (<span key={i} className="flex items-center gap-16">{it}<span className="text-accent">✦</span></span>))}
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  const lines = ["We believe the next decade", "of creative work belongs", "to the small, the sovereign,", "and the uncompromising."];
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-40">
      <div className="mb-16 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground"><span>I · Manifesto</span><span className="h-px flex-1 bg-white/8" /></div>
      <div className="font-display text-[clamp(2.2rem,6vw,5rem)] leading-[1.05] tracking-[-0.035em]">
        {lines.map((l, i) => (<motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} className={i === lines.length - 1 ? "text-violet" : "text-gradient"}>{l}</motion.div>))}
      </div>
    </section>
  );
}

type CategoryNode = { id: string; label: string; icon: string; x: number; y: number; size: "lg" | "md" | "sm"; };
const CATEGORIES: CategoryNode[] = [
  { id: "brand", label: "Brand & Identity", icon: "◆", x: 50, y: 20, size: "lg" },
  { id: "product", label: "Product Design", icon: "⬡", x: 22, y: 35, size: "lg" },
  { id: "motion", label: "3D & Motion", icon: "◎", x: 78, y: 32, size: "lg" },
  { id: "engineering", label: "Engineering", icon: "⟡", x: 15, y: 60, size: "md" },
  { id: "editorial", label: "Editorial", icon: "◇", x: 85, y: 58, size: "md" },
  { id: "type", label: "Typography", icon: "▵", x: 35, y: 72, size: "md" },
  { id: "photo", label: "Photography", icon: "◯", x: 65, y: 75, size: "sm" },
  { id: "sound", label: "Sound Design", icon: "◈", x: 50, y: 50, size: "sm" },
  { id: "strategy", label: "Strategy", icon: "⬢", x: 40, y: 38, size: "sm" },
  { id: "campaign", label: "Campaign", icon: "✦", x: 60, y: 40, size: "sm" },
  { id: "ux", label: "UX Research", icon: "◐", x: 28, y: 50, size: "sm" },
  { id: "code", label: "Creative Code", icon: "⟐", x: 72, y: 52, size: "sm" },
];
const CONNECTIONS: [string, string][] = [
  ["brand", "strategy"], ["brand", "type"], ["brand", "campaign"],
  ["product", "ux"], ["product", "engineering"], ["product", "strategy"],
  ["motion", "campaign"], ["motion", "code"], ["motion", "photo"],
  ["engineering", "code"], ["engineering", "ux"],
  ["editorial", "type"], ["editorial", "photo"],
  ["type", "brand"], ["sound", "motion"], ["sound", "campaign"],
  ["strategy", "campaign"], ["code", "product"],
  ["photo", "editorial"], ["ux", "product"],
  ["brand", "product"], ["motion", "engineering"], ["sound", "code"],
  ["brand", "center"], ["product", "center"], ["motion", "center"],
  ["engineering", "center"], ["editorial", "center"], ["type", "center"],
  ["photo", "center"], ["sound", "center"], ["strategy", "center"],
  ["campaign", "center"], ["ux", "center"], ["code", "center"],
];

function ConnectionLine({ fromNode, toNode }: { fromNode: any; toNode: any }) {
  const x1 = useMotionTemplate`${fromNode.x}%`;
  const y1 = useMotionTemplate`${fromNode.y}%`;
  const x2 = useMotionTemplate`${toNode.x}%`;
  const y2 = useMotionTemplate`${toNode.y}%`;
  return (<motion.line x1={x1 as any} y1={y1 as any} x2={x2 as any} y2={y2 as any} stroke="url(#neural-gradient)" strokeWidth={1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: (((fromNode?.cat?.id?.charCodeAt(0) || 0) + (toNode?.cat?.id?.charCodeAt(0) || 0)) % 15) * 0.1 }} />);
}

function NeuralPulse({ fromNode, toNode, delay }: { fromNode: any; toNode: any; delay: number }) {
  const progress = useMotionValue(0);
  useEffect(() => {
    const controls = animate(progress, 1, { duration: 3, delay, repeat: Infinity, repeatDelay: Math.random() * 5 + 3, ease: "easeInOut" });
    return () => controls.stop();
  }, [delay, progress]);
  const cx = useTransform(() => `${fromNode.x.get() + (toNode.x.get() - fromNode.x.get()) * progress.get()}%`);
  const cy = useTransform(() => `${fromNode.y.get() + (toNode.y.get() - fromNode.y.get()) * progress.get()}%`);
  const opacity = useTransform(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return (<motion.circle r={2} fill="oklch(0.7 0.18 295)" filter="url(#glow)" cx={cx as any} cy={cy as any} style={{ opacity }} />);
}

function NetworkNode({ node, containerRef }: { node: any; containerRef: React.RefObject<HTMLDivElement> }) {
  const left = useMotionTemplate`${node.x}%`;
  const top = useMotionTemplate`${node.y}%`;
  const dragOffset = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const router = useRouter();
  const sizeClasses = { lg: "px-5 py-3.5", md: "px-4 py-3", sm: "px-3.5 py-2.5" };
  const textClasses = { lg: "text-[12px]", md: "text-[11px]", sm: "text-[10px]" };
  const iconClasses = { lg: "h-9 w-9 text-[15px]", md: "h-7 w-7 text-[12px]", sm: "h-6 w-6 text-[11px]" };
  return (
    <motion.div style={{ left, top }} initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => { node.isDragging = true; startPos.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); if (!containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); const px = (node.x.get() / 100) * rect.width + rect.left; const py = (node.y.get() / 100) * rect.height + rect.top; dragOffset.current = { x: px - e.clientX, y: py - e.clientY }; }}
      onPointerUp={(e) => { node.isDragging = false; e.currentTarget.releasePointerCapture(e.pointerId); const dist = Math.hypot(e.clientX - startPos.current.x, e.clientY - startPos.current.y); if (dist < 5) router.push("/talent"); }}
      onPointerMove={(e) => { if (!node.isDragging) return; if (!containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); const targetX = e.clientX + dragOffset.current.x; const targetY = e.clientY + dragOffset.current.y; node.x.set(Math.max(5, Math.min(95, ((targetX - rect.left) / rect.width) * 100))); node.y.set(Math.max(5, Math.min(95, ((targetY - rect.top) / rect.height) * 100))); }}
    >
      <div className={`group glass block rounded-2xl text-left hairline transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_20px_-5px_oklch(0.7_0.18_295/0.4)] ${sizeClasses[node.cat.size as keyof typeof sizeClasses]}`}>
        <div className="flex items-center gap-2.5">
          <div className={`grid place-items-center rounded-full bg-gradient-to-br from-accent/30 to-midnight border border-white/10 ${iconClasses[node.cat.size as keyof typeof iconClasses]}`}><span className="text-accent">{node.cat.icon}</span></div>
          <div className="pointer-events-none select-none">
            <div className={`leading-tight font-medium ${textClasses[node.cat.size as keyof typeof textClasses]}`}>{node.cat.label}</div>
            <div className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/70">
              {talents.filter((t) => t.role.toLowerCase().includes(node.cat.label.split(" ")[0].toLowerCase()) || t.skills.some((s) => s.toLowerCase().includes(node.cat.label.split(" ")[0].toLowerCase()))).length || ((node.cat.id.charCodeAt(0) * 3) % 20) + 5} experts
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Orbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<any>(null);
  if (!centerRef.current) { centerRef.current = { x: motionValue(50), y: motionValue(50) }; }
  const nodesRef = useRef<any[]>(null);
  if (!nodesRef.current) {
    nodesRef.current = CATEGORIES.map((c) => ({ cat: c, ox: c.x, oy: c.y, x: motionValue(c.x), y: motionValue(c.y), vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.1, isDragging: false }));
  }
  useAnimationFrame((t) => {
    if (!nodesRef.current) return;
    
    // Heartbeat pulse calculation (simulates a beating heart)
    // t is time in ms. A double beat pattern looks like a real heart.
    const beat = (Math.pow(Math.sin(t * 0.002), 4) + Math.pow(Math.sin(t * 0.002 + 0.3), 4) * 0.5) * 2.5;
    
    const n = nodesRef.current.length;
    
    // Calculate forces and collisions
    for (let i = 0; i < n; i++) {
      const nodeA = nodesRef.current[i];
      let ax = nodeA.x.get(); let ay = nodeA.y.get();
      
      // Direction to center
      const dxC = 50 - nodeA.ox;
      const dyC = 50 - nodeA.oy;
      const distC = Math.sqrt(dxC*dxC + dyC*dyC) || 1;
      
      if (!nodeA.isDragging) {
        // Base spring force towards its original anchor, but oscillating towards center
        const targetX = nodeA.ox + (dxC / distC) * beat;
        const targetY = nodeA.oy + (dyC / distC) * beat;
        
        nodeA.vx += (targetX - ax) * 0.003 + (Math.random() - 0.5) * 0.02;
        nodeA.vy += (targetY - ay) * 0.003 + (Math.random() - 0.5) * 0.02;
      }
      
      // Node-to-Node Collisions
      for (let j = i + 1; j < n; j++) {
        const nodeB = nodesRef.current[j];
        let bx = nodeB.x.get(); let by = nodeB.y.get();
        const dx = bx - ax; const dy = by - ay;
        
        // Nodes are wide rectangles, so we stretch the Y axis distance to create an oval hitbox
        const distSq = (dx * dx) + (dy * dy * 4);
        const minDist = 11; // Much smaller threshold so they only move when touching
        
        if (distSq < minDist * minDist && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (minDist - dist) * 0.2; // Sharper force when they actually touch
          const nx = (dx / dist) * force;
          const ny = (dy / dist) * force;
          
          if (!nodeA.isDragging) { nodeA.vx -= nx; nodeA.vy -= ny; }
          if (!nodeB.isDragging) { nodeB.vx += nx; nodeB.vy += ny; }
        }
      }
      
      // Collision with Central THRIYON Logo
      const dxCenter = 50 - ax; const dyCenter = 50 - ay;
      const distCenterSq = (dxCenter * dxCenter) + (dyCenter * dyCenter * 4);
      const minCenterDist = 16; // Reduced aura around center text
      if (distCenterSq < minCenterDist * minCenterDist && distCenterSq > 0) {
         const distC2 = Math.sqrt(distCenterSq);
         const forceC = (minCenterDist - distC2) * 0.25;
         if (!nodeA.isDragging) {
           nodeA.vx -= (dxCenter / distC2) * forceC;
           nodeA.vy -= (dyCenter / distC2) * forceC;
         }
      }
    }

    // Apply velocities and friction
    nodesRef.current.forEach((node) => {
      if (node.isDragging) return;
      node.vx *= 0.88; // Friction damping
      node.vy *= 0.88;
      
      let cx = node.x.get(); let cy = node.y.get();
      // Bounding box bounce
      if (cx < 5) node.vx += 0.5; if (cx > 95) node.vx -= 0.5;
      if (cy < 5) node.vy += 0.5; if (cy > 95) node.vy -= 0.5;
      
      node.x.set(cx + node.vx); node.y.set(cy + node.vy);
    });
  });
  const nodeMap = Object.fromEntries(nodesRef.current.map((n) => [n.cat.id, n]));
  nodeMap["center"] = centerRef.current as any;
  return (
    <section className="relative mx-auto max-w-[1400px] px-6 py-40">
      <div className="mb-12 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">II · Orbit</div>
          <h2 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[1] tracking-[-0.035em]">A neural network of <span className="text-violet">creative</span> disciplines.</h2>
        </div>
        <Link href="/talent" className="rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5">Explore categories →</Link>
      </div>
      <div ref={containerRef} className="relative aspect-[16/10] min-h-[600px] w-full overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/40 to-background grain">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,oklch(0.7_0.18_295/0.12),transparent_70%)]" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.7 0.18 295 / 0.4)" /><stop offset="50%" stopColor="oklch(0.7 0.18 295 / 0.15)" /><stop offset="100%" stopColor="oklch(0.7 0.18 295 / 0.4)" />
            </linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {CONNECTIONS.map(([a, b]) => { const from = nodeMap[a]; const to = nodeMap[b]; if (!from || !to) return null; return <ConnectionLine key={`conn-${a}-${b}`} fromNode={from} toNode={to} />; })}
          {CONNECTIONS.slice(0, 10).map(([a, b], i) => { const from = nodeMap[a]; const to = nodeMap[b]; if (!from || !to) return null; return <NeuralPulse key={`pulse-${a}-${b}`} fromNode={from} toNode={to} delay={i * 0.6} />; })}
        </svg>
        {nodesRef.current.map((node) => (<NetworkNode key={node.cat.id} node={node} containerRef={containerRef as React.RefObject<HTMLDivElement>} />))}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="pulse-ring relative flex h-14 items-center justify-center rounded-full bg-white px-8 text-black"><span className="font-display text-sm font-medium tracking-[0.2em] uppercase">THRIYON</span></div>
        </div>
      </div>
    </section>
  );
}

function TalentTeaser() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-40">
      <div className="mb-12 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">III · Method</div>
      <div className="grid gap-8 md:grid-cols-3">
        {[
          { n: "01", t: "Identify", b: "Curated talent across brand, product, motion, sound, type and code. Every profile, hand-reviewed." },
          { n: "02", t: "Initiate", b: "Cinematic briefs replace bid wars. Scoping, contracts, and milestones, in a single floating canvas." },
          { n: "03", t: "Inhabit", b: "Work, message, deliver, get paid. A sovereign workspace tuned for slow, deep, long-arc creative practice." },
        ].map((s, i) => (
          <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} className="glass rounded-2xl p-7 hairline">
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{s.n}</div>
            <div className="mt-6 font-display text-3xl tracking-tight">{s.t}</div>
            <p className="mt-3 text-sm text-muted-foreground">{s.b}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 pt-32 pb-20">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-graphite/60 to-background p-10 md:p-20 grain glow">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-accent/30 blur-[120px]" />
        <div className="relative">
          <div className="mb-8 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">IV · Enter</div>
          <h2 className="max-w-4xl font-display text-[clamp(2.6rem,8vw,7rem)] leading-[0.95] tracking-[-0.045em]">The future of creative work is <span className="text-violet">quietly</span> already here.</h2>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/contact" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black">Request access →</Link>
            <Link href="/talent" className="rounded-full border border-white/15 px-6 py-3 text-sm hover:bg-white/5">Browse talent</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [isReady, setIsReady] = useState(false);
  return (
    <>
      <PageLoader isReady={isReady} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Hero onReady={() => setIsReady(true)} />
        <Marquee />
        <Manifesto />
        <Orbit />
        <TalentTeaser />
        <FinalCTA />
      </motion.div>
    </>
  );
}
