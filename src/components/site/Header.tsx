"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Search, Settings, LogOut } from "lucide-react";
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
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardLink = profile
    ? profile.role === "client"
      ? `/${profile.username || "user"}/dashboard/client`
      : `/${profile.username || "user"}/dashboard/freelancer`
    : "/auth/login";

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
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-9 w-9 border border-white/10 cursor-pointer hover:border-white/30 transition-colors">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-white/5 text-xs text-foreground">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || profile?.username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0A0A0A] border border-white/10 text-foreground">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || profile?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">@{profile?.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
                    <Link href={`/${profile?.username}/profile`}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
                    <Link href={dashboardLink}>
                      <Search className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
                    <Link href={`/${profile?.username}/dashboard/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => signOut()} className="focus:bg-white/5 text-red-400 focus:text-red-400 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-2 text-[13px] text-muted-foreground transition hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="group relative overflow-hidden rounded-full bg-white px-4 py-2 text-[13px] font-medium text-black transition hover:bg-white/90"
              >
                Request access →
              </Link>
            </>
          )}
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
            {user ? (
              <>
                <Link
                  href={dashboardLink}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="mt-2 rounded-lg bg-white px-3 py-2 text-center text-sm font-medium text-black cursor-pointer"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-lg bg-white px-3 py-2 text-center text-sm font-medium text-black"
                >
                  Request access
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
