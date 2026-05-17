"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

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
      const { error: insertError } = await supabase
        .from("freelancer_services")
        .insert({
          freelancer_id: user.id,
          title,
          category,
          price: Number(price),
          delivery_days: Number(deliveryDays),
          description,
          tags: tagsArray,
          status: "Actif"
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/user/dashboard/freelancer");
        }, 1500);
      }
    } catch (err) {
      console.error("Error creating service:", err);
      setError("Une erreur inattendue est survenue lors de l'enregistrement du service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      {/* Background glowing gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-accent/12 blur-[120px] opacity-75" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <div className="mx-auto max-w-2xl relative">
        {/* Navigation back */}
        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-transparent border-0"
          >
            ← Retour au workspace
          </button>
        </div>

        {/* Onboarding Welcome Banner */}
        {isFromOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 rounded-2xl border border-accent/25 bg-accent/5 px-6 py-5 flex items-start gap-4"
          >
            <div className="mt-0.5 h-8 w-8 shrink-0 rounded-xl bg-accent/15 flex items-center justify-center text-accent text-base">✦</div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent mb-1">Bienvenue sur Thriyon</div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Votre studio est prêt. Publiez maintenant votre <strong className="text-foreground">premier service</strong> pour être visible dans le Nexus et commencer à recevoir des briefs clients.
              </p>
            </div>
          </motion.div>
        )}

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 hairline text-center py-20 border border-white/8 bg-gradient-to-b from-graphite/40 to-background"
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl mb-6">
              ✓
            </div>
            <h2 className="font-display text-2xl font-medium text-gradient mb-2">Service Publié</h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Votre service souverain est maintenant disponible sur le ledger Thriyon. Redirection...
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-8 md:p-10 hairline border border-white/8 bg-gradient-to-b from-graphite/40 to-background grain"
          >
            <div className="mb-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent">
                Sovereign Service Listing
              </span>
              <h1 className="font-display text-3xl font-medium text-gradient mt-1">Publier un Service</h1>
              <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                Mettez votre expertise en ligne sous forme de forfait clair avec tarif et délai définis.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive font-mono text-[10px] uppercase tracking-wider">
                ⚡ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                  Titre du service / Forfait
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Design d'une Landing Page immersive en WebGL"
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                />
              </div>

              {/* Grid: Category, Price, Delivery */}
              <div className="grid gap-6 sm:grid-cols-3">
                {/* Category */}
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                    Catégorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-foreground focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                  >
                    <option value="Brand">Brand Identity</option>
                    <option value="Product">Product Design</option>
                    <option value="Campaign">3D & Motion</option>
                    <option value="Engineering">Software Engineering</option>
                    <option value="Editorial">Typography & Editorial</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                    Tarif Fixe ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    placeholder="ex: 1500"
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                  />
                </div>

                {/* Delivery */}
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                    Délai de Livraison (Jours)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value) || 0)}
                    placeholder="ex: 10"
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                  Détail & Livrables de l'offre
                </label>
                <textarea
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez avec précision ce que comprend ce service : étapes de travail, fichiers finaux livrés, et éventuels allers-retours inclus..."
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                  Tags Clés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="ex: WebGL, Figma, React, Landing Page"
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-white py-3.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50 cursor-pointer border-0"
              >
                {loading ? "Enregistrement..." : "Créer et Publier le Service →"}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function NewServicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-muted-foreground font-mono text-xs uppercase tracking-widest">
        Initialisation du Studio...
      </div>
    }>
      <NewServiceForm />
    </Suspense>
  );
}
