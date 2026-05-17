"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, Settings, LogOut, LayoutDashboard, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const dashboardLink = profile?.role === "client" ? "/user/dashboard/client" : "/user/dashboard/freelancer";

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
            <div className="flex items-center gap-4">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="transition hover:scale-105" title="Mon Compte">
                    <Avatar className="h-10 w-10 border border-white/20 cursor-pointer">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-white/10 text-foreground text-sm">
                        {profile?.full_name
                          ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                          : user?.email?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass bg-graphite/95 border-white/10 p-1">
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-white/5 text-[10px] text-foreground">
                      {profile?.full_name
                        ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                        : user?.email?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5 text-foreground rounded-md">
                  <Link href={dashboardLink} className="flex items-center w-full">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5 text-foreground rounded-md">
                  <Link href="/user/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5 text-foreground rounded-md">
                  <Link href="/user/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
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
                <Link
                  href="/user/dashboard/messages"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  Messages
                </Link>
                <Link
                  href="/user/dashboard/services"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  Services
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
