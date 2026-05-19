"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  { value: "Brand", label: "Brand Identity", icon: "◆", desc: "Logo, visual system, brand strategy" },
  { value: "Product", label: "Product Design", icon: "⬡", desc: "UI/UX, prototyping, design system" },
  { value: "Campaign", label: "3D & Motion", icon: "◎", desc: "Animation, visual effects, 3D renders" },
  { value: "Engineering", label: "Engineering", icon: "⟡", desc: "Web app, mobile, backend, cloud" },
  { value: "Editorial", label: "Editorial & Type", icon: "◈", desc: "Publication, typography, content" },
  { value: "Sound", label: "Sound & Music", icon: "◉", desc: "Composition, sound design, mixing" },
];

const BUDGET_SUGGESTIONS = ["< $1K", "$1K – $5K", "$5K – $20K", "$20K – $50K", "$50K+", "Open to discuss"];

const ONBOARDING_TIPS: Record<string, { title: string; body: string }> = {
  title: {
    title: "Définissez un titre clair",
    body: "Les meilleures offres attirent les meilleurs talents. Soyez précis : décrivez le type de travail, votre secteur d'activité et le résultat attendu.",
  },
  category: {
    title: "Choisissez la bonne discipline",
    body: "Cela détermine quels freelances verront votre offre. Choisissez le domaine de compétence principal — vous pourrez ajouter des détails dans la description.",
  },
  budget: {
    title: "Budget builds trust",
    body: "Freelancers on Thriyon are experienced professionals. A clear budget range attracts serious proposals and avoids wasted time.",
  },
  description: {
    title: "Write like you're briefing your creative director",
    body: "Cover: what you need, what you don't want, your timeline, target audience, and what success looks like.",
  },
  tags: {
    title: "Les tags rendent votre offre visible auprès des bons talents",
    body: "Use skill names and tools. e.g. Figma, React, After Effects, Branding, WebGL",
  },
};

function NewBriefForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetTalent = searchParams?.get("talent") || "";
  const { user, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Brand");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeTip, setActiveTip] = useState<string | null>(null);

  useEffect(() => {
    if (targetTalent) {
      setDescription(
        `Initiating a sovereign contract offer specifically for practitioner: @${targetTalent}.\n\n[Outline your project scope, constraints, and delivery timelines here...]`
      );
    }
  }, [targetTalent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Vous devez être connecté en tant que client pour publier une offre.");
      return;
    }
    if (!title || !budget || !description) {
      setError("Veuillez remplir toutes les informations nécessaires pour l'offre.");
      return;
    }

    setLoading(true);
    setError("");

    const tagsArray = tagInput
      ? tagInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    try {
      const { error: insertError } = await supabase.from("freelance_jobs").insert({
        title,
        category,
        budget,
        description,
        tags: tagsArray,
        user_id: user.id,
        status: "Ouvert",
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${profile?.username}/dashboard/client`);
        }, 2200);
      }
    } catch (err) {
      console.error("Error creating job offer:", err);
      setError("An unexpected error occurred during database transmission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Violet glow backdrop */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/12 blur-[140px] opacity-80" />
      <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[500px] rounded-full bg-violet-900/20 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[640px]"
      >
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent mb-3"
          >
            Nouvelle Offre
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[0.9] tracking-[-0.04em] text-gradient pb-2"
          >
            Créer une <br />
            Offre
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-[13px] text-muted-foreground/75 leading-relaxed max-w-[400px] mx-auto"
          >
            Lancez une nouvelle offre sur le Nexus.
          </motion.p>
        </div>

        <div className="mb-10 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-transparent border-0"
          >
            ← Retour
          </button>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/50 to-background p-12 text-center py-20 grain"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-2xl mb-6">
                ✓
              </div>
              <h2 className="font-display text-3xl font-medium text-gradient mb-3">
                Offre Transmise !
              </h2>
              <p className="text-muted-foreground/80">
                Votre offre souveraine est maintenant disponible sur le ledger Thriyon.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/40 to-background p-8 md:p-10 grain">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Titre du Projet
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTip(activeTip === "title" ? null : "title")}
                        className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                      >
                        {activeTip === "title" ? "Masquer" : "Conseil ✦"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {activeTip === "title" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">{ONBOARDING_TIPS.title.title}</div>
                          <p className="text-xs text-muted-foreground/80">{ONBOARDING_TIPS.title.body}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onFocus={() => setActiveTip("title")}
                      placeholder="e.g. Rebrand for a sovereign AI lab"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Catégorie
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTip(activeTip === "category" ? null : "category")}
                        className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                      >
                        {activeTip === "category" ? "Masquer" : "Conseil ✦"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {activeTip === "category" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">{ONBOARDING_TIPS.category.title}</div>
                          <p className="text-xs text-muted-foreground/80">{ONBOARDING_TIPS.category.body}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all ${
                            category === cat.value
                              ? "border-accent bg-accent/8 shadow-[0_0_15px_-5px_oklch(0.7_0.18_295/0.3)]"
                              : "border-white/8 bg-white/2 hover:border-white/15"
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <div className={`font-mono text-[9px] uppercase tracking-wider ${category === cat.value ? "text-accent" : "text-foreground/80"}`}>
                            {cat.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Budget Alloué
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTip(activeTip === "budget" ? null : "budget")}
                        className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                      >
                        {activeTip === "budget" ? "Masquer" : "Conseil ✦"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {activeTip === "budget" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">{ONBOARDING_TIPS.budget.title}</div>
                          <p className="text-xs text-muted-foreground/80">{ONBOARDING_TIPS.budget.body}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      onFocus={() => setActiveTip("budget")}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                    >
                      <option value="" disabled>Sélectionner...</option>
                      {BUDGET_SUGGESTIONS.map(b => <option key={b} value={b} className="bg-background">{b}</option>)}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Scope & Spécifications
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTip(activeTip === "description" ? null : "description")}
                        className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent"
                      >
                        Conseil ✦
                      </button>
                    </div>
                    <AnimatePresence>
                      {activeTip === "description" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">{ONBOARDING_TIPS.description.title}</div>
                          <p className="text-xs text-muted-foreground/80">{ONBOARDING_TIPS.description.body}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <textarea
                      required
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onFocus={() => setActiveTip("description")}
                      placeholder="Outline deliverables, technical stack requirements, and general creative goals..."
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40 resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Tags · Compétences Recherchées
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTip(activeTip === "tags" ? null : "tags")}
                        className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent"
                      >
                        Conseil ✦
                      </button>
                    </div>
                    <AnimatePresence>
                      {activeTip === "tags" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">{ONBOARDING_TIPS.tags.title}</div>
                          <p className="text-xs text-muted-foreground/80">{ONBOARDING_TIPS.tags.body}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onFocus={() => setActiveTip("tags")}
                      placeholder="e.g. Identity, Systems, Web, Motion"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  {error && (
                    <div className="font-mono text-[11px] text-destructive border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3.5 text-center">
                      ⚡ {error}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full bg-white py-4 text-sm font-semibold text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {loading ? "Création..." : "Publier l'Offre"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function NewOfferPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-muted-foreground font-mono text-xs uppercase tracking-widest">
          Initialisation de l'Espace Offres...
        </div>
      }
    >
      <NewBriefForm />
    </Suspense>
  );
}
