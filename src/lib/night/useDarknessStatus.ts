"use client";

import { useEffect, useMemo, useState } from "react";

export type DarknessPhase = "daylight" | "dusk" | "night";

type UseDarknessStatusOptions = {
  developerOverride?: boolean;
};

type DarknessStatus = {
  phase: DarknessPhase;
  canEnter: boolean;
  developerOverride: boolean;
  localTimeLabel: string;
};

export function resolveDarknessPhase(date: Date): DarknessPhase {
  const hour = date.getHours() + date.getMinutes() / 60;

  if (hour >= 6 && hour < 18) {
    return "daylight";
  }

  if (hour >= 18 && hour < 20) {
    return "dusk";
  }

  return "night";
}

export function useDarknessStatus({ developerOverride = false }: UseDarknessStatusOptions = {}): DarknessStatus {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const formatNow = new Date();
    setNow(formatNow);

    const update = () => {
      setNow(new Date());
    };

    const intervalId = window.setInterval(update, 30_000);
    document.addEventListener("visibilitychange", update);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return useMemo(() => {
    const phase = developerOverride ? "night" : now ? resolveDarknessPhase(now) : "daylight";

    return {
      phase,
      canEnter: developerOverride || (now !== null && phase === "night"),
      developerOverride,
      localTimeLabel:
        now === null
          ? "--:--"
          : new Intl.DateTimeFormat(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            }).format(now),
    };
  }, [developerOverride, now]);
}
