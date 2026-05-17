"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  { value: "Brand", label: "Brand Identity", icon: "◆", desc: "Logo, visual system, strategy" },
  { value: "Product", label: "Product Design", icon: "⬡", desc: "UI/UX, prototyping, design system" },
  { value: "Campaign", label: "3D & Motion", icon: "◎", desc: "Animation, VFX, 3D" },
  { value: "Engineering", label: "Engineering", icon: "⟡", desc: "Web app, mobile, backend" },
  { value: "Editorial", label: "Editorial & Type", icon: "◈", desc: "Publication, typography" },
  { value: "Sound", label: "Sound & Music", icon: "◉", desc: "Composition, sound design" },
];

const ONBOARDING_TIPS: Record<string, { title: string; body: string }> = {
  title: {
    title: "Un titre qui accroche",
    body: "Soyez précis. Ex: « Landing Page WebGL immersive » plutôt que « Design de site ».",
  },
  price: {
    title: "Fixez un prix juste",
    body: "Un prix trop bas peut signaler un manque de confiance. Valorisez votre expertise.",
  },
  delivery: {
    title: "Délai réaliste = satisfaction",
    body: "Incluez un temps de révision. Il vaut mieux livrer en avance qu'en retard.",
  },
  description: {
    title: "Soyez exhaustif et clair",
    body: "Livrables, révisions incluses, hors périmètre. La clarté attire les meilleurs collaborateurs.",
  },
};

export default function NewServicePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Brand");
  const [price, setPrice] = useState<number>(500);
  const [deliveryDays, setDeliveryDays] = useState<number>(7);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const [activeTip, setActiveTip] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);

    const tagsArray = tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);

    try {
      const { error: insertError } = await supabase.from("freelancer_services").insert({
        freelancer_id: user.id,
        title,
        category,
        price: Number(price),
        delivery_days: Number(deliveryDays),
        description,
        tags: tagsArray,
        status: "Actif",
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/user/dashboard/freelancer");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du service.");
    } finally {
      setSaving(false);
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
            Nouveau Service
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[0.9] tracking-[-0.04em] text-gradient pb-2"
          >
            Créer un <br />
            Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-[13px] text-muted-foreground/75 leading-relaxed max-w-[400px] mx-auto"
          >
            Publiez une nouvelle offre de service sur le Nexus.
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
                Service Publié !
              </h2>
              <p className="text-muted-foreground/80">
                Votre service souverain est maintenant disponible sur le ledger Thriyon.
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
                        Titre du Service
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
                      placeholder="ex: Landing Page WebGL immersive"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-3">
                      Catégorie
                    </label>
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

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Price */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          Tarif Fixe ($)
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTip(activeTip === "price" ? null : "price")}
                          className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent"
                        >
                          {activeTip === "price" ? "×" : "Conseil ✦"}
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm">$</span>
                        <input
                          type="number"
                          required
                          min={1}
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value) || 0)}
                          onFocus={() => setActiveTip("price")}
                          className="w-full bg-white/3 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                        />
                      </div>
                    </div>

                    {/* Delivery Days */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          Délai (Jours)
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min={1}
                          value={deliveryDays}
                          onChange={(e) => setDeliveryDays(Number(e.target.value) || 0)}
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-xs font-mono">jours</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Description & Détails
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTip(activeTip === "description" ? null : "description")}
                        className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent"
                      >
                        Conseil ✦
                      </button>
                    </div>
                    <textarea
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onFocus={() => setActiveTip("description")}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40 resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                      Tags (séparés par virgule)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Figma, React, 3D..."
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
                      disabled={saving}
                      className="w-full rounded-full bg-white py-4 text-sm font-semibold text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {saving ? "Création..." : "Publier le Service"}
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
