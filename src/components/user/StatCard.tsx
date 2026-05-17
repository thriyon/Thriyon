"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Trend = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: Trend;
  trendLabel?: string;
  loading?: boolean;
  accent?: boolean;
}

const TrendIcon = ({ trend }: { trend: Trend }) => {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground/40" />;
};

const trendColor: Record<Trend, string> = {
  up: "text-emerald-400",
  down: "text-destructive",
  neutral: "text-muted-foreground/40",
};

export function StatCard({ label, value, sublabel, trend, trendLabel, loading, accent }: StatCardProps) {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
        <Skeleton className="h-2 w-20 bg-white/6 rounded mb-4" />
        <Skeleton className="h-8 w-24 bg-white/6 rounded mb-2" />
        <Skeleton className="h-2 w-28 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`glass rounded-2xl p-6 hairline border bg-white/1 cursor-default ${
        accent ? "border-accent/20 bg-accent/3" : "border-white/6"
      }`}
    >
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className={`font-display text-3xl font-semibold mt-2 ${accent ? "text-accent" : "text-foreground"}`}>
        {value}
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        {trend && <TrendIcon trend={trend} />}
        {trendLabel && (
          <span className={`font-mono text-[8px] uppercase tracking-wider ${trend ? trendColor[trend] : "text-muted-foreground/50"}`}>
            {trendLabel}
          </span>
        )}
        {!trendLabel && sublabel && (
          <span className="font-mono text-[8px] uppercase text-muted-foreground/50">{sublabel}</span>
        )}
      </div>
    </motion.div>
  );
}
