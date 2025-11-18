"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

// Only use ErrorBoundary in production/browser environment
const DynamicErrorBoundary = dynamic(() => import("./ErrorBoundary"), {
  ssr: false,
  loading: ({ children }: any) => <>{children}</>,
});

interface SafeErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function SafeErrorBoundary({
  children,
  fallback,
}: SafeErrorBoundaryProps) {
  // In development or SSR, just render children directly
  if (typeof window === "undefined" || process.env.NODE_ENV === "development") {
    return <>{children}</>;
  }

  // In production browser, use the actual ErrorBoundary
  return (
    <DynamicErrorBoundary fallback={fallback}>{children}</DynamicErrorBoundary>
  );
}
