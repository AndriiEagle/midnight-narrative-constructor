"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StudioEmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
};

export function StudioEmptyState({
  eyebrow = "Тут поки порожньо",
  title,
  description,
  className,
  children,
}: StudioEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[14rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/70 bg-black/10 px-6 py-8 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]",
        className,
      )}
    >
      <div className="text-[10px] uppercase tracking-[0.32em] text-accent opacity-72">{eyebrow}</div>
      <h3 className="mt-3 font-serif text-[clamp(1.5rem,3vw,2.2rem)] leading-tight tracking-[-0.03em] text-foreground">
        {title}
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-foreground opacity-70">{description}</p>
      {children ? <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{children}</div> : null}
    </div>
  );
}
