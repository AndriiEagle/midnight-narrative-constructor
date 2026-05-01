"use client";

import { motion } from "framer-motion";

type EmpathyCameraOverlayProps = {
  active?: boolean;
};

export function EmpathyCameraOverlay({ active = false }: EmpathyCameraOverlayProps) {
  // This component stays in the codebase as a dormant visual shell.
  // Only re-enable it together with a real interaction/sensing mechanic.
  if (!active) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-6 rounded-[2.4rem] border border-white/10" />
      <div className="absolute left-[14%] top-[18%] h-[18%] w-[18%] rounded-[2rem] border border-white/8" />
      <div className="absolute right-[12%] top-[22%] h-[22%] w-[21%] rounded-[2rem] border border-white/7" />
      <div className="absolute inset-x-[22%] top-[23%] h-[48%] rounded-[2.5rem] border border-rose-500/12 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)]" />

      <div className="absolute left-7 top-7 flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/78 backdrop-blur-md">
        <motion.span
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.95, 1.08, 0.95] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.25, ease: "easeInOut" }}
          className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.65)]"
        />
        <span>REC // Empathy Verification Active. Read aloud.</span>
      </div>

      <div className="absolute bottom-7 right-7 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-white/60 backdrop-blur-md">
        Facial Sentiment Sampling
      </div>
    </div>
  );
}
