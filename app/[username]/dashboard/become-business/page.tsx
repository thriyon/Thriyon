"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const INDUSTRIES = [
  "Tech & Software",
  "Design & Creative",
  "Marketing & Media",
  "Finance & FinTech",
  "E-commerce & Retail",
  "Music & Sound",
  "Film & Video",
  "Fashion & Lifestyle",
  "Architecture & Interior",
  "Health & Wellness",
  "Legal & Compliance",
  "Education & EdTech",
  "Other",
];

const COMPANY_SIZES = [
  { label: "Solo founder", value: "1" },
  { label: "Small team (2–10)", value: "2-10" },
  { label: "Growing studio (11–50)", value: "11-50" },
  { label: "Mid-size company (51–200)", value: "51-200" },
  { label: "Large enterprise (200+)", value: "200+" },
];

const BUDGET_RANGES = [
  { label: "Moins de $1K / projet", value: "<1k" },
  { label: "$1K – $5K / projet", value: "1k-5k" },
  { label: "$5K – $20K / projet", value: "5k-20k" },
  { label: "$20K – $50K / projet", value: "20k-50k" },
  { label: "$50K+ / projet", value: "50k+" },
];

export default function BecomeBusinessPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [companyBio, setCompanyBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!companyName) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const { error: updateErr } = await supabase.from("profiles").upsert({
        id: user.id,
        company_name: companyName,
        industry: industry || null,
        company_size: companySize || null,
        website: website || null,
        budget_range: budgetRange || null,
        bio: companyBio || null,
        updated_at: new Date().toISOString(),
      });
      if (updateErr) throw updateErr;

      await refreshProfile();
      setDone(true);
      setTimeout(() => {
        const uname = profile?.username;
        router.push(`/${uname}/dashboard/client`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-6 py-24 overflow-hidden">
      {/* Backdrop */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[140px] opacity-80" />
      <div className="pointer-events-none absolute top-0 left-0 h-[300px] w-[500px] rounded-full bg-violet-900/15 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[600px]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent mb-3">
            Business Setup · Studio Profile
          </div>
          <h1 className="font-display text-[clamp(2rem,6vw,3rem)] leading-tight tracking-[-0.04em] text-gradient">
            Votre Profil Business
          </h1>
          <p className="mt-3 text-[13px] text-muted-foreground/75 leading-relaxed">
            Renseignez vos informations d'entreprise pour attirer les meilleurs talents créatifs.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/60 to-background p-8 md:p-10 grain glow">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 text-center space-y-4"
              >
                <div className="text-4xl">⬡</div>
                <div className="font-display text-2xl text-gradient">Profil Business Activé</div>
                <p className="text-sm text-muted-foreground/70">Redirection vers votre espace...</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Company Name + Website */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                      Nom de l'Entreprise <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ex: Axiom Studio"
                      className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 focus:bg-white/8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                      Site Web
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://axiom.studio"
                      className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 focus:bg-white/8"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Industrie
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => setIndustry(industry === ind ? "" : ind)}
                        className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                          industry === ind
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company Size + Budget Range */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                      Taille de l'Équipe
                    </label>
                    <div className="space-y-2">
                      {COMPANY_SIZES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setCompanySize(companySize === s.value ? "" : s.value)}
                          className={`w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all cursor-pointer ${
                            companySize === s.value
                              ? "border-accent/40 bg-accent/5 text-foreground"
                              : "border-white/8 bg-white/2 text-muted-foreground hover:border-white/15"
                          }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full flex-shrink-0 ${companySize === s.value ? "bg-accent" : "bg-white/20"}`}
                          />
                          <span className="text-xs">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                      Budget Projet Habituel
                    </label>
                    <div className="space-y-2">
                      {BUDGET_RANGES.map((b) => (
                        <button
                          key={b.value}
                          type="button"
                          onClick={() => setBudgetRange(budgetRange === b.value ? "" : b.value)}
                          className={`w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all cursor-pointer ${
                            budgetRange === b.value
                              ? "border-accent/40 bg-accent/5 text-foreground"
                              : "border-white/8 bg-white/2 text-muted-foreground hover:border-white/15"
                          }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full flex-shrink-0 ${budgetRange === b.value ? "bg-accent" : "bg-white/20"}`}
                          />
                          <span className="text-xs">{b.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Présentation de l'Entreprise
                  </label>
                  <textarea
                    value={companyBio}
                    onChange={(e) => setCompanyBio(e.target.value)}
                    placeholder="Décrivez votre activité, votre vision, et le type de créatifs que vous recherchez..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 resize-none"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-mono text-[11px] text-destructive border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3.5 text-center"
                    >
                      ⚡ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-2 rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Sauvegarde en cours..." : "Activer le Profil Business →"}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50 hover:text-muted-foreground transition"
                >
                  ← Retour au dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
