"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-6 overflow-hidden bg-[#080808]">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">THRIYON</span>
            </Link>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Email envoyé !</h2>
              <p className="text-sm text-white/50">
                Si un compte existe pour <span className="text-white/80">{email}</span>, vous
                recevrez un lien de réinitialisation dans quelques instants.
              </p>
              <button
                onClick={() => router.push("/auth/login")}
                className="mt-4 w-full py-3 rounded-full bg-violet-600 hover:bg-violet-500 transition text-sm font-medium text-white"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-white text-center mb-2">
                Mot de passe oublié
              </h1>
              <p className="text-sm text-white/50 text-center mb-8">
                Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition"
                  />
                </div>

                {error && <p className="text-xs text-red-400 text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-white"
                >
                  {loading ? "Envoi..." : "Envoyer le lien"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-white/40">
                <Link
                  href="/auth/login"
                  className="text-violet-400 hover:text-violet-300 transition"
                >
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
