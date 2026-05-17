"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Settings,
  MessageSquare,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { href: "/user/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/user/profile", icon: User, label: "Profile" },
  { href: "/user/settings", icon: Settings, label: "Settings" },
  { href: "/user/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { href: "/talent", icon: Briefcase, label: "Talent" },
];

export function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex min-h-screen bg-background">
        {/* ── Sidebar ── */}
        <motion.aside
          animate={{ width: collapsed ? 72 : 220 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed left-0 top-0 z-40 flex h-full flex-col glass hairline border-r border-white/6 bg-graphite/30 overflow-hidden"
        >
          {/* Brand */}
          <div className="flex h-16 items-center gap-3 px-4 border-b border-white/6">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="font-display text-sm font-semibold tracking-tight text-foreground whitespace-nowrap"
                >
                  THRIYON
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              const item = (
                <Link
                  href={href}
                  key={href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-accent" : ""}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className="font-mono text-[11px] uppercase tracking-wider whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
              if (collapsed) {
                return (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>{item}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                );
              }
              return item;
            })}
          </nav>

          {/* User + collapse */}
          <div className="border-t border-white/6 px-2 py-3 space-y-1">
            {/* User row */}
            <div className={`flex items-center gap-3 rounded-xl px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
              <Avatar className="h-7 w-7 shrink-0 border border-white/10">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-graphite text-muted-foreground text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-w-0 flex-1"
                  >
                    <p className="text-[11px] font-medium text-foreground truncate">{profile?.full_name || "Practitioner"}</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 truncate">{profile?.role ?? "member"}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Sign out */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut()}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition cursor-pointer ${collapsed ? "justify-center" : ""}`}
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-[10px] uppercase tracking-wider">
                        Sign out
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Sign out</TooltipContent>}
            </Tooltip>
            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed((p) => !p)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/5 transition cursor-pointer"
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5 mx-auto" /> : <><ChevronLeft className="h-3.5 w-3.5" /><span className="font-mono text-[10px] uppercase tracking-wider">Collapse</span></>}
            </button>
          </div>
        </motion.aside>

        {/* ── Content area ── */}
        <motion.div
          animate={{ marginLeft: collapsed ? 72 : 220 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 flex flex-col min-h-screen"
        >
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/6 glass px-6">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
                {navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.label ?? "User Space"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/3 hover:bg-white/6 transition cursor-pointer">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <Avatar className="h-7 w-7 border border-white/10 cursor-pointer">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-graphite text-muted-foreground text-[10px]">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
