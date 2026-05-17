"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  { value: "Brand", label: "Brand Identity", icon: "◆", desc: "Logo, système visuel, stratégie" },
  { value: "Product", label: "Product Design", icon: "⬡", desc: "UI/UX, prototypage, design system" },
  { value: "Campaign", label: "3D & Motion", icon: "◎", desc: "Animation, effets visuels, 3D" },
  { value: "Engineering", label: "Ingénierie", icon: "⟡", desc: "Web app, mobile, backend, cloud" },
  { value: "Editorial", label: "Éditorial & Type", icon: "◈", desc: "Publication, typographie, contenu" },
  { value: "Sound", label: "Son & Musique", icon: "◉", desc: "Composition, sound design, mixage" },
];

const ONBOARDING_TIPS: Record<string, { title: string; body: string }> = {
  title: {
    title: "Un titre qui vend",
    body: "Soyez précis et orienté résultat. Ex: « Landing Page WebGL immersive » plutôt que « Design de site ».",
  },
  price: {
    title: "Fixez un prix juste et compétitif",
    body: "Sur Thriyon, les clients cherchent de l'excellence. Un prix trop bas peut signaler un manque de confiance. Valorisez votre expertise.",
  },
  delivery: {
    title: "Délai réaliste = client satisfait",
    body: "Incluez un temps de révision dans votre délai. Il vaut mieux livrer en avance que d'être en retard.",
  },
  description: {
    title: "Décrivez ce que vous livrez exactement",
    body: "Listez les fichiers finaux, le nombre de révisions inclus, et ce qui est hors périmètre. La clarté attire les bons clients.",
  },
  tags: {
    title: "Les tags = votre visibilité",
    body: "Utilisez les noms des outils et techniques que vous maîtrisez. Ex: Figma, React, After Effects, Framer.",
  },
};

function NewServiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromOnboarding = searchParams.get("onboarding") === "true";
  const { user, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Brand");
  const [price, setPrice] = useState<number>(500);
  const [deliveryDays, setDeliveryDays] = useState<number>(7);
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeTip, setActiveTip] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Vous devez être connecté en tant que freelance pour proposer un service.");
      return;
    }
    if (profile?.role !== "freelancer") {
      setError("Seuls les profils Freelance peuvent publier des services.");
      return;
    }
    if (!title || !price || !deliveryDays || !description) {
      setError("Veuillez remplir toutes les informations nécessaires.");
      return;
    }

    setLoading(true);
    setError("");

    const tagsArray = tagInput
      ? tagInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

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

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/user/dashboard/freelancer");
        }, 2200);
      }
    } catch (err) {
      console.error("Error creating service:", err);
      setError("Une erreur inattendue est survenue lors de l'enregistrement du service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-28 pb-24 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px] opacity-80" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[600px] rounded-full bg-violet-900/10 blur-[100px]" />
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
              {["Compte créé", "Studio configuré", "Premier service"].map((label, i) => (
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
              onClick={() => router.push("/user/dashboard/freelancer")}
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
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-transparent border-0"
            >
              ← Retour au workspace
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
                Service Publié !
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {isFromOnboarding
                  ? "Votre premier service est en ligne. Les clients peuvent déjà vous découvrir sur le Nexus !"
                  : "Votre service souverain est maintenant disponible sur le ledger Thriyon."}
              </p>
              {isFromOnboarding && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-5 py-2.5 font-mono text-[10px] text-accent uppercase tracking-widest"
                >
                  ✦ Votre studio est maintenant actif
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
                    ◆
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent mb-1">
                      Bienvenue sur Thriyon · Étape finale
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Publiez votre <strong className="text-foreground">premier service</strong> pour être visible dans le Nexus. Décrivez précisément ce que vous livrez — les meilleurs clients cherchent de la clarté.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Form card */}
              <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/40 to-background p-8 md:p-10 grain">
                <div className="mb-8">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent">
                    {isFromOnboarding ? "Nouveau Service · Premier Forfait" : "Sovereign Service Listing"}
                  </span>
                  <h1 className="font-display text-3xl font-medium text-gradient mt-1.5">
                    {isFromOnboarding ? "Créez votre offre" : "Publier un Service"}
                  </h1>
                  <p className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">
                    {isFromOnboarding
                      ? "Présentez votre expertise sous forme de forfait clair avec un tarif fixe et un délai défini. Les clients adorent la transparence."
                      : "Mettez votre expertise en ligne sous forme de forfait clair avec tarif et délai définis."}
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
                        Titre du Service / Forfait
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
                      placeholder={isFromOnboarding ? "ex: Design d'une landing page immersive en WebGL — livraison 10 jours" : "ex: Design d'une Landing Page immersive en WebGL"}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Catégorie
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
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

                  {/* Price & Delivery */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Price */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          Tarif Fixe ($)
                        </label>
                        {isFromOnboarding && (
                          <button
                            type="button"
                            onClick={() => setActiveTip(activeTip === "price" ? null : "price")}
                            className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                          >
                            {activeTip === "price" ? "×" : "Conseil ✦"}
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {isFromOnboarding && activeTip === "price" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                          >
                            <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                              {ONBOARDING_TIPS.price.title}
                            </div>
                            <p className="text-xs text-muted-foreground/80 leading-relaxed">
                              {ONBOARDING_TIPS.price.body}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm font-mono">$</span>
                        <input
                          type="number"
                          required
                          min={1}
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value) || 0)}
                          onFocus={() => isFromOnboarding && setActiveTip("price")}
                          placeholder="500"
                          className="w-full bg-white/3 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Delivery */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          Délai (Jours)
                        </label>
                        {isFromOnboarding && (
                          <button
                            type="button"
                            onClick={() => setActiveTip(activeTip === "delivery" ? null : "delivery")}
                            className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                          >
                            {activeTip === "delivery" ? "×" : "Conseil ✦"}
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {isFromOnboarding && activeTip === "delivery" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                          >
                            <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                              {ONBOARDING_TIPS.delivery.title}
                            </div>
                            <p className="text-xs text-muted-foreground/80 leading-relaxed">
                              {ONBOARDING_TIPS.delivery.body}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {isFromOnboarding && (
                        <div className="flex gap-1.5 mb-2 flex-wrap">
                          {[3, 5, 7, 14, 21, 30].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setDeliveryDays(d)}
                              className={`rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-wider transition-all cursor-pointer ${
                                deliveryDays === d
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-white/10 text-muted-foreground hover:border-white/20"
                              }`}
                            >
                              {d}j
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min={1}
                          value={deliveryDays}
                          onChange={(e) => setDeliveryDays(Number(e.target.value) || 0)}
                          onFocus={() => isFromOnboarding && setActiveTip("delivery")}
                          placeholder="7"
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-xs font-mono">jours</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Détail & Livrables
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
                          ? "Décrivez ce que vous livrez exactement :\n— Fichiers finaux fournis\n— Nombre de révisions incluses\n— Ce qui est hors périmètre\n— Processus de travail"
                          : "Décrivez avec précision ce que comprend ce service : étapes de travail, fichiers finaux livrés, et éventuels allers-retours inclus..."
                      }
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300 resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Tags Clés
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
                      placeholder={isFromOnboarding ? "ex: Figma, React, WebGL, Branding, After Effects" : "ex: WebGL, Figma, React, Landing Page"}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-white py-4 text-sm font-semibold text-black transition hover:scale-[1.01] hover:bg-white/90 active:scale-[0.99] disabled:opacity-50 cursor-pointer border-0"
                  >
                    {loading
                      ? "Publication en cours..."
                      : isFromOnboarding
                      ? "Publier mon premier service → Activer mon studio"
                      : "Créer et Publier le Service →"}
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

export default function NewServicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-muted-foreground font-mono text-xs uppercase tracking-widest">
          Initialisation du Studio...
        </div>
      }
    >
      <NewServiceForm />
    </Suspense>
  );
}
