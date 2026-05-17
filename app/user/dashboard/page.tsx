"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/modules/user/StatCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ArrowRight,
  FileText,
  MessageSquare,
  User,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

// Types
type Brief = { id: string; title: string; status: string; created_at: string; proposal_count?: number };
type Contract = { id: string; title: string; escrow_status: string; escrow_amount: number; other_party?: string };
type Activity = { id: string; title: string; content: string | null; created_at: string; read: boolean };

// Helpers
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} j`;
}

const statusBadge: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
  "Ouvert":        { className: "bg-amber-100 text-amber-800 border-amber-200", label: "Ouvert",       icon: <AlertCircle className="h-3 w-3" /> },
  "En cours":      { className: "bg-blue-100 text-blue-800 border-blue-200",    label: "En cours",     icon: <Clock className="h-3 w-3" /> },
  "Fonds déposés": { className: "bg-purple-100 text-purple-800 border-purple-200", label: "Fonds",      icon: <Zap className="h-3 w-3" /> },
  "Livré":         { className: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Livré", icon: <CheckCircle className="h-3 w-3" /> },
  "Terminé":       { className: "bg-slate-100 text-slate-800 border-slate-200", label: "Terminé",      icon: <CheckCircle className="h-3 w-3" /> },
};

const quickActions = [
  { href: "/user/dashboard/client/briefs/new", label: "Nouveau Brief", icon: Plus, sub: "Publier une mission" },
  { href: "/user/dashboard/client/briefs",     label: "Mes Briefs",   icon: FileText, sub: "Suivi des missions" },
  { href: "/user/dashboard/messages",           label: "Messagerie",    icon: MessageSquare, sub: "Boîte de réception" },
  { href: "/user/profile",                      label: "Mon Profil",  icon: User, sub: "Aperçu public" },
];

export default function DashboardPage() {
  const { user, profile } = useAuth();

  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isFreelancer = profile?.role === "freelancer";
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 18) return "Bonjour";
    return "Bonsoir";
  })();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      // Mock Data for faster dev since Supabase setup might not be complete
      setTimeout(() => {
        if (cancelled) return;
        setBriefs([
          { id: "1", title: "Refonte UI/UX Dashboard", status: "Ouvert", created_at: new Date().toISOString(), proposal_count: 3 },
          { id: "2", title: "Développement Application Mobile", status: "En cours", created_at: new Date(Date.now() - 86400000).toISOString(), proposal_count: 12 },
        ]);
        setContracts([
          { id: "1", title: "Refonte UI/UX Dashboard", escrow_status: "En cours", escrow_amount: 1500, other_party: "Acme Corp" }
        ]);
        setActivity([
          { id: "1", title: "Nouvelle proposition reçue", content: "Jean a envoyé une proposition pour Refonte UI/UX", created_at: new Date().toISOString(), read: false },
          { id: "2", title: "Fonds déposés", content: "Les fonds pour App Mobile sont sécurisés.", created_at: new Date(Date.now() - 3600000).toISOString(), read: true },
        ]);
        setLoading(false);
      }, 500);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">
          {greeting}, <span className="text-blue-600">{profile?.full_name?.split(" ")[0] || "Créateur"}</span> 👋
        </h1>
        <p className="text-slate-500 mt-2">
          Voici un résumé de votre activité et vos métriques clés.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        <StatCard 
          label="Missions en cours" 
          value={loading ? "—" : contracts.length} 
          trend="up" 
          trendValue="+2 cette semaine" 
          loading={loading} 
        />
        <StatCard 
          label={isFreelancer ? "Revenus (Mois)" : "Dépenses (Mois)"} 
          value={loading ? "—" : "$3,250"} 
          trend="up" 
          trendValue="+12.5%" 
          loading={loading} 
        />
        <StatCard 
          label="Impressions Profil" 
          value={loading ? "—" : "1,432"} 
          trend="up" 
          trendValue="+4.2%" 
          loading={loading} 
        />
        <StatCard 
          label="Temps de réponse" 
          value={loading ? "—" : "< 1h"} 
          trend="neutral" 
          trendValue="Excellent" 
          loading={loading} 
        />
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions Rapides</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="bg-white group rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{action.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Briefs */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">Missions récentes</h2>
              <Link href="/user/dashboard/client/briefs" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-2">
              {loading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : briefs.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucune mission pour le moment</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {briefs.map((b) => {
                    const status = statusBadge[b.status];
                    return (
                      <div key={b.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition cursor-default">
                        <div>
                          <p className="font-medium text-slate-900">{b.title}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {b.proposal_count} propositions • Il y a {timeAgo(b.created_at)}
                          </p>
                        </div>
                        {status && (
                          <Badge variant="outline" className={`ml-4 flex items-center gap-1.5 ${status.className}`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Activity */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[600px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Activité récente</h2>
            {activity.some(a => !a.read) && (
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            )}
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : activity.length === 0 ? (
              <p className="text-center text-slate-500 py-10">Aucune activité récente</p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {activity.map((a) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border ${a.read ? "bg-white border-slate-100" : "bg-blue-50/50 border-blue-100"}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className={`text-sm font-medium ${a.read ? "text-slate-700" : "text-slate-900"}`}>{a.title}</p>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(a.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{a.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}
