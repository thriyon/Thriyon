"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  loading?: boolean;
}

export function StatCard({ label, value, trend, trendValue, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  const renderTrend = () => {
    if (!trend) return null;
    const isUp = trend === "up";
    const isDown = trend === "down";
    
    return (
      <div className={`flex items-center gap-1 text-sm font-medium mt-2 ${isUp ? 'text-emerald-600' : isDown ? 'text-red-600' : 'text-slate-500'}`}>
        {isUp && <TrendingUp className="h-4 w-4" />}
        {isDown && <TrendingDown className="h-4 w-4" />}
        {!isUp && !isDown && <Minus className="h-4 w-4" />}
        <span>{trendValue}</span>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default"
    >
      <h3 className="text-sm font-medium text-slate-500 mb-2">{label}</h3>
      <div className="text-3xl font-display font-bold text-slate-900">{value}</div>
      {renderTrend()}
    </motion.div>
  );
}
