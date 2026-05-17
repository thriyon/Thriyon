"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [rate, setRate] = useState<number>(85);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === "client") {
        router.push("/user/dashboard/client");
      } else {
        router.push("/user/dashboard/freelancer");
      }
    }
  }, [user, profile, router]);


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up the user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Account creation failed. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Parse skills
      const skillsArray = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // 3. Upsert the profile record
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        bio: bio || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        role: role,
        rate: role === "freelancer" ? rate : null,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      // Redirect to the appropriate dashboard
      if (role === "client") {
        router.push("/user/dashboard/client");
      } else {
        router.push("/user/dashboard/freelancer");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
      {/* Background radial violet glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[130px] opacity-70" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/60 to-background p-8 md:p-10 grain glow"
      >
        <div className="text-center mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-2">
            Gateway · Application ({step}/2)
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] text-gradient">
            {step === 1 ? "Nexus Registry" : "Studio Profile"}
          </h2>
          <p className="mt-2.5 text-[13px] text-muted-foreground/80 leading-relaxed">
            {step === 1
              ? "Join the private ecosystem of sovereign builders and clients."
              : "Let's configure your showcase studio details."}
          </p>
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSignup} className="space-y-5">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Role selection */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Select Your Call
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("freelancer")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 text-center cursor-pointer ${
                        role === "freelancer"
                          ? "border-accent bg-accent/5 shadow-[0_0_20px_-5px_oklch(0.7_0.18_295/0.2)]"
                          : "border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15"
                      }`}
                    >
                      <span className="font-display text-sm font-medium">Freelancer</span>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground mt-1">Sovereign Studio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("client")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 text-center cursor-pointer ${
                        role === "client"
                          ? "border-accent bg-accent/5 shadow-[0_0_20px_-5px_oklch(0.7_0.18_295/0.2)]"
                          : "border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15"
                      }`}
                    >
                      <span className="font-display text-sm font-medium">Client / Studio</span>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground mt-1">Initiate Briefs</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Full Name / Studio Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Alex Rivers"
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Email Identifier
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., designer@thriyon.co"
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Sovereign Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01]"
                >
                  Continue Build →
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Sovereign Bio / Manifesto
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={
                      role === "freelancer"
                        ? "Introduce your signature style and deep creative craft..."
                        : "Describe your VC, brand, or project agency style..."
                    }
                    rows={3}
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Primary Creative Disciplines (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="3D & Motion, React, Brand, Sound Design"
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
                  />
                </div>

                {role === "freelancer" && (
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                      Min. Escrow / Hourly Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      required
                      value={rate}
                      onChange={(e) => setRate(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
                    />
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="font-mono text-[11px] text-destructive leading-normal border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3.5 text-center mt-2"
                    >
                      ⚡ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-full border border-white/15 px-4 py-3.5 text-sm text-foreground/90 transition hover:bg-white/5 cursor-pointer text-center"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer text-center"
                  >
                    {loading ? "Registering..." : "Launch Space →"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="mt-8 pt-6 border-t border-white/6 text-center">
          <p className="text-[12px] text-muted-foreground/75">
            Already applied?{" "}
            <Link
              href="/auth/login"
              className="text-foreground hover:text-accent font-medium underline underline-offset-4 decoration-white/20 transition-all"
            >
              Sign in to studio
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
