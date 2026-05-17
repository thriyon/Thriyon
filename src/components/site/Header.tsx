"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/talent", label: "Talent" },
  { href: "/projects", label: "Projects" },
  { href: "/how-it-works", label: "Method" },
  { href: "/pricing", label: "Pricing" },
  { href: "/journal", label: "Journal" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-6 w-6">
            <div className="absolute inset-0 rounded-full bg-accent/60 blur-md transition group-hover:bg-accent" />
            <div className="absolute inset-[3px] rounded-full border border-white/40 bg-background" />
            <div className="absolute inset-[7px] rounded-full bg-white/90" />
          </div>
          <span className="font-display text-[15px] font-medium tracking-[0.22em] text-foreground">
            THRIYON
          </span>
        </Link>

        <nav
          className={`hidden items-center gap-1 rounded-full px-2 py-1.5 text-[13px] md:flex ${
            scrolled ? "glass" : ""
          }`}
        >
          {nav.map((n) => {
            const isActive = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={
                  isActive
                    ? "rounded-full px-3.5 py-1.5 bg-white/8 text-foreground"
                    : "rounded-full px-3.5 py-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                }
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/contact"
            className="rounded-full px-4 py-2 text-[13px] text-muted-foreground transition hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/contact"
            className="group relative overflow-hidden rounded-full bg-white px-4 py-2 text-[13px] font-medium text-black transition hover:bg-white/90"
          >
            Request access →
          </Link>
        </div>

        <button
          aria-label="Menu"
          className="md:hidden glass rounded-full px-4 py-2 text-xs"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="md:hidden mx-6 mt-3 glass rounded-2xl p-4">
          <div className="grid gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-white px-3 py-2 text-center text-sm font-medium text-black"
            >
              Request access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
