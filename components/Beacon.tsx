"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Client beacon — POSTs the path to /api/t once per path per session so
 * the rollup can separate "page fetched" from "JS actually ran" (the
 * humans-vs-bots signal). DNT/GPC honored; sendBeacon survives unloads.
 */
export function Beacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    const seen = `sck-beacon:${pathname}`;
    try {
      if (sessionStorage.getItem(seen)) return;
      sessionStorage.setItem(seen, "1");
    } catch {
      /* storage off — beacon still fires */
    }
    const body = JSON.stringify({ path: pathname });
    if (!navigator.sendBeacon?.("/api/t", body)) {
      fetch("/api/t", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
