"use client";

import { useId } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type InfoTooltipProps = {
  content: ReactNode;
  label?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
};

const sideClasses = {
  top: "bottom-full left-1/2 mb-3 -translate-x-1/2 translate-y-1 group-hover/info:translate-y-0 group-focus-within/info:translate-y-0",
  right: "left-full top-1/2 ml-3 -translate-y-1/2 translate-x-1 group-hover/info:translate-x-0 group-focus-within/info:translate-x-0",
  bottom: "top-full left-1/2 mt-3 -translate-x-1/2 -translate-y-1 group-hover/info:translate-y-0 group-focus-within/info:translate-y-0",
  left: "right-full top-1/2 mr-3 -translate-y-1/2 -translate-x-1 group-hover/info:translate-x-0 group-focus-within/info:translate-x-0",
} as const;

export function InfoTooltip({
  content,
  label = "More information",
  side = "top",
  className,
  triggerClassName,
  panelClassName,
}: InfoTooltipProps) {
  const tooltipId = useId();

  return (
    <span className={cn("group/info relative inline-flex shrink-0 align-middle", className)}>
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-label={label}
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/80 bg-black/20 text-[10px] font-semibold text-accent/90 shadow-bleed transition-all duration-200 hover:border-accent hover:text-accent focus:outline-none focus:ring-1 focus:ring-accent",
          triggerClassName,
        )}
      >
        ?
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none invisible absolute z-50 w-72 max-w-[calc(100vw-2rem)] rounded-[1.25rem] border border-border bg-panel/95 px-4 py-3 text-[11px] normal-case leading-6 tracking-[0.01em] text-foreground opacity-0 shadow-bleed backdrop-blur-md transition-all duration-200 group-hover/info:visible group-hover/info:pointer-events-auto group-hover/info:opacity-100 group-focus-within/info:visible group-focus-within/info:pointer-events-auto group-focus-within/info:opacity-100",
          sideClasses[side],
          panelClassName,
        )}
      >
        {content}
      </span>
    </span>
  );
}
