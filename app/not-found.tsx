import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Out of orbit — THRIYON",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-xl text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Signal lost · 404</div>
        <h1 className="mt-6 font-display text-[clamp(4rem,12vw,9rem)] leading-none tracking-[-0.05em]">Out of orbit.</h1>
        <p className="mt-6 text-muted-foreground">The page you tried to reach is no longer in this constellation.</p>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black">Return to surface →</Link>
      </div>
    </div>
  );
}
