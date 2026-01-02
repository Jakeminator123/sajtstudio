"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_ID_KEY = "sajtstudio_visitor_id";

function getOrCreateVisitorId(): string {
  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const newId = `visitor_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  localStorage.setItem(VISITOR_ID_KEY, newId);
  return newId;
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (pathname.startsWith("/api")) return;

    let visitorId: string;
    try {
      visitorId = getOrCreateVisitorId();
    } catch {
      // Ignore localStorage errors (e.g., blocked storage)
      return;
    }

    const payload = {
      // Avoid useSearchParams() here to prevent missing-suspense build errors
      // on Next.js not-found routes during prerender.
      path: pathname,
      visitorId,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    };

    try {
      const url = "/api/analytics/pageview";
      const body = JSON.stringify(payload);

      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
          cache: "no-store",
        }).catch(() => {});
      }
    } catch {
      // Ignore tracking failures
    }
  }, [pathname]);

  return null;
}

