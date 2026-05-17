"use client";

import React from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  loading?: boolean;
  action?: React.ReactNode;
}

export function ProfileSection({ title, description, children, loading, action }: ProfileSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass rounded-3xl p-8 hairline border border-white/6 bg-white/1"
    >
      <div className="flex items-start justify-between mb-6 pb-5 border-b border-white/5">
        <div>
          <h2 className="font-display text-base font-medium text-foreground">{title}</h2>
          {description && (
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-1">{description}</p>
          )}
        </div>
        {action && <div className="ml-4 shrink-0">{action}</div>}
      </div>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-3 w-full bg-white/6 rounded" />
          <Skeleton className="h-3 w-4/5 bg-white/5 rounded" />
          <Skeleton className="h-3 w-2/3 bg-white/4 rounded" />
        </div>
      ) : (
        children
      )}
    </motion.section>
  );
}
