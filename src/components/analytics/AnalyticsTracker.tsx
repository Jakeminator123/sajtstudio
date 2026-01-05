"use client";

import { useEffect } from "react";

/**
 * Client-side tracker that records a page view and visitor id to the stats API.
 * Uses localStorage to persist a visitor identifier across sessions.
 */
export default function AnalyticsTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const visitorKey = "sajtstudio_visitor_id";
    let visitorId = localStorage.getItem(visitorKey);

    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(visitorKey, visitorId);
    }

    const controller = new AbortController();

    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
      signal: controller.signal,
    }).catch(() => {
      // Swallow errors – analytics should never block rendering
    });

    return () => controller.abort();
  }, []);

  return null;
}

