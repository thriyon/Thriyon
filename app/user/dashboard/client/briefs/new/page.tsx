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
    title: "Craft a clear project statement",
    body: "The best briefs attract top talent. Be specific: include the type of work, your industry, and the outcome you're after.",
  },
  category: {
    title: "Pick the right discipline",
    body: "This determines which freelancers see your brief. Choose the primary skill area — you can add more detail in the description.",
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
    title: "Tags surface your brief to the right talent",
    body: "Use skill names and tools. e.g. Figma, React, After Effects, Branding, WebGL",
  },
};

function NewBriefForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetTalent = searchParams?.get("talent") || "";
  const isFromOnboarding = searchParams?.get("onboarding") === "true";
  const { user } = useAuth();

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
        `Initiating a sovereign contract brief specifically for practitioner: @${targetTalent}.\n\n[Outline your project scope, constraints, and delivery timelines here...]`
      );
    }
  }, [targetTalent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be signed in as a client to post a brief.");
      return;
    }
    if (!title || !budget || !description) {
      setError("Please fill in all necessary brief details.");
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
          router.push("/user/dashboard/client");
        }, 2200);
      }
    } catch (err) {
      console.error("Error creating job brief:", err);
      setError("An unexpected error occurred during database transmission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-28 pb-24 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px] opacity-80" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[600px] rounded-full bg-violet-900/10 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-10" />

      <div className="mx-auto max-w-2xl relative">

        {/* Onboarding progress bar */}
        {isFromOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-3"
          >
            <div className="flex items-center gap-2 flex-1">
              {["Compte créé", "Profil configuré", "Premier brief"].map((label, i) => (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-1.5 ${i < 2 ? "text-accent" : "text-foreground"}`}>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      i < 2 ? "bg-accent text-black" : "bg-accent/20 text-accent border border-accent/40"
                    }`}>
                      {i < 2 ? "✓" : `${i + 1}`}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-widest hidden sm:block">
                      {label}
                    </span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-accent/30 max-w-[40px]" />}
                </React.Fragment>
              ))}
            </div>
            <button
              onClick={() => router.push("/user/dashboard/client")}
              className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-all"
            >
              Passer →
            </button>
          </motion.div>
        )}

        {/* Navigation back (non-onboarding) */}
        {!isFromOnboarding && (
          <div className="mb-10">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              ← Back to workspace
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/50 to-background p-12 text-center py-20 grain"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mx-auto h-16 w-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-2xl mb-6"
              >
                ✓
              </motion.div>
              <h2 className="font-display text-3xl font-medium text-gradient mb-3">
                Brief Transmis !
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {isFromOnboarding
                  ? "Votre premier projet est maintenant visible aux freelances du Nexus. Bienvenue !"
                  : "Sovereign project added to the Thriyon Nexus ledger."}
              </p>
              {isFromOnboarding && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-5 py-2.5 font-mono text-[10px] text-accent uppercase tracking-widest"
                >
                  ✦ Votre espace de travail est prêt
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Onboarding welcome card */}
              {isFromOnboarding && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="mb-8 rounded-2xl border border-accent/25 bg-accent/5 px-6 py-5 flex items-start gap-4"
                >
                  <div className="mt-0.5 h-9 w-9 shrink-0 rounded-xl bg-accent/15 flex items-center justify-center text-accent text-lg">
                    ⬡
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent mb-1">
                      Bienvenue sur Thriyon · Étape finale
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Publiez votre <strong className="text-foreground">premier brief</strong> pour accéder aux meilleurs freelances du Nexus. Soyez précis — les meilleurs talents choisissent leurs projets avec soin.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Form card */}
              <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/40 to-background p-8 md:p-10 grain">
                <div className="mb-8">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent">
                    {isFromOnboarding ? "Nouveau Brief · Premier Projet" : "Sovereign Brief"}
                  </span>
                  <h1 className="font-display text-3xl font-medium text-gradient mt-1.5">
                    {isFromOnboarding ? "Décrivez votre projet" : "Initiate Project Brief"}
                  </h1>
                  <p className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">
                    {isFromOnboarding
                      ? "Votre brief sera visible par les freelances du Nexus. Plus vous êtes précis, plus vous recevrez de propositions qualifiées."
                      : "Describe your requirements, timelines, and budget constraints."}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive font-mono text-[10px] uppercase tracking-wider">
                    ⚡ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-7">

                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Titre du Projet
                      </label>
                      {isFromOnboarding && (
                        <button
                          type="button"
                          onClick={() => setActiveTip(activeTip === "title" ? null : "title")}
                          className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                        >
                          {activeTip === "title" ? "Masquer" : "Conseil ✦"}
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {isFromOnboarding && activeTip === "title" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                            {ONBOARDING_TIPS.title.title}
                          </div>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">
                            {ONBOARDING_TIPS.title.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onFocus={() => isFromOnboarding && setActiveTip("title")}
                      placeholder={isFromOnboarding ? "ex: Refonte de marque pour une startup IA — logo + système visuel complet" : "e.g. Rebrand for a sovereign AI lab"}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Catégorie Principale
                      </label>
                      {isFromOnboarding && (
                        <button
                          type="button"
                          onClick={() => setActiveTip(activeTip === "category" ? null : "category")}
                          className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                        >
                          {activeTip === "category" ? "Masquer" : "Conseil ✦"}
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {isFromOnboarding && activeTip === "category" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                            {ONBOARDING_TIPS.category.title}
                          </div>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">
                            {ONBOARDING_TIPS.category.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => { setCategory(cat.value); setActiveTip("category"); }}
                          className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                            category === cat.value
                              ? "border-accent bg-accent/8 shadow-[0_0_15px_-5px_oklch(0.7_0.18_295/0.3)]"
                              : "border-white/8 bg-white/2 hover:border-white/15"
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <div>
                            <div className={`font-mono text-[9px] uppercase tracking-wider ${category === cat.value ? "text-accent" : "text-foreground/80"}`}>
                              {cat.label}
                            </div>
                            <div className="font-mono text-[8px] text-muted-foreground/50 mt-0.5 leading-tight">
                              {cat.desc}
                            </div>
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
                      {isFromOnboarding && (
                        <button
                          type="button"
                          onClick={() => setActiveTip(activeTip === "budget" ? null : "budget")}
                          className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                        >
                          {activeTip === "budget" ? "Masquer" : "Conseil ✦"}
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {isFromOnboarding && activeTip === "budget" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                            {ONBOARDING_TIPS.budget.title}
                          </div>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">
                            {ONBOARDING_TIPS.budget.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {isFromOnboarding && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {BUDGET_SUGGESTIONS.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBudget(b)}
                            className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                              budget === b
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      onFocus={() => isFromOnboarding && setActiveTip("budget")}
                      placeholder={isFromOnboarding ? "ex: $5K – $20K ou sélectionnez ci-dessus" : "e.g. $40k – $80k"}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Scope & Spécifications
                      </label>
                      {isFromOnboarding && (
                        <button
                          type="button"
                          onClick={() => setActiveTip(activeTip === "description" ? null : "description")}
                          className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                        >
                          {activeTip === "description" ? "Masquer" : "Conseil ✦"}
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {isFromOnboarding && activeTip === "description" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                            {ONBOARDING_TIPS.description.title}
                          </div>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">
                            {ONBOARDING_TIPS.description.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <textarea
                      required
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onFocus={() => isFromOnboarding && setActiveTip("description")}
                      placeholder={
                        isFromOnboarding
                          ? "Décrivez votre besoin en détail :\n— Livrables attendus\n— Audience cible\n— Style ou références\n— Timeline souhaitée\n— Ce que vous ne voulez pas"
                          : "Outline deliverables, technical stack requirements, and general creative goals..."
                      }
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300 resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Tags · Compétences Recherchées
                      </label>
                      {isFromOnboarding && (
                        <button
                          type="button"
                          onClick={() => setActiveTip(activeTip === "tags" ? null : "tags")}
                          className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                        >
                          {activeTip === "tags" ? "Masquer" : "Conseil ✦"}
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {isFromOnboarding && activeTip === "tags" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                            {ONBOARDING_TIPS.tags.title}
                          </div>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">
                            {ONBOARDING_TIPS.tags.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onFocus={() => isFromOnboarding && setActiveTip("tags")}
                      placeholder={isFromOnboarding ? "ex: Figma, React, After Effects, Branding, WebGL" : "e.g. Identity, Systems, Web, Motion"}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-white py-4 text-sm font-semibold text-black transition hover:scale-[1.01] hover:bg-white/90 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading
                      ? "Publication en cours..."
                      : isFromOnboarding
                      ? "Publier mon premier brief → Entrer dans le Nexus"
                      : "Commit Project Brief & Initiate Escrow →"}
                  </button>

                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function NewBriefPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-muted-foreground font-mono text-xs uppercase tracking-widest">
          Initializing Brief Space...
        </div>
      }
    >
      <NewBriefForm />
    </Suspense>
  );
}
