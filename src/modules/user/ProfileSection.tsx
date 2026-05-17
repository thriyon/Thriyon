import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  loading?: boolean;
}

export function ProfileSection({ title, description, children, loading }: ProfileSectionProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <Skeleton className="h-6 w-1/4" />
        {description && <Skeleton className="h-4 w-1/3" />}
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}
