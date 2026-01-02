"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const fullPath = search ? `${pathname}?${search}` : pathname;

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
      path: fullPath,
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
  }, [pathname, fullPath]);

  return null;
}

