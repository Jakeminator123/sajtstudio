"use client";

import { usePathname } from "next/navigation";
import ProductionBanner from "@/components/effects/ProductionBanner";

/**
 * Route-aware banners (client side).
 * We hide ProductionBanner on preview pages (/demo-*) to avoid confusing users.
 */
export default function RouteAwareBanners() {
  const pathname = usePathname() || "";
  const isPreviewPage = pathname.startsWith("/demo-");

  if (isPreviewPage) return null;
  return <ProductionBanner />;
}


