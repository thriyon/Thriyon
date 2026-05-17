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
  Bell,
  Sparkles,
  Search,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/user/dashboard", icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: "/user/profile", icon: User, label: "Profil public" },
  { href: "/user/dashboard/messages", icon: MessageSquare, label: "Messagerie" },
  { href: "/talent", icon: Briefcase, label: "Missions" },
  { href: "/user/settings", icon: Settings, label: "Paramètres" },
];

export function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40">
        <div className="flex items-center h-16 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 font-display font-bold text-xl tracking-tight">
            <Sparkles className="h-5 w-5" />
            <span>Thriyon</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {profile?.full_name || "Utilisateur"}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">{profile?.role || "Membre"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Rechercher sur Thriyon..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
            </button>
            <Avatar className="h-8 w-8 border border-slate-200 md:hidden cursor-pointer">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">{initials}</AvatarFallback>
            </Avatar>
            <button className="hidden sm:flex bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2 rounded-full transition shadow-sm">
              Créer un projet
            </button>
          </div>
        </header>

        {/* Page Content with Framer Motion transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 p-4 sm:p-8 w-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
                <span className="text-blue-600 font-display font-bold text-xl tracking-tight">Thriyon</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
