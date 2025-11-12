import { useEffect, useMemo, useState } from "react";

type BreakpointState = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
};

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
} as const;

const DEFAULT_STATE: BreakpointState = {
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  width: 0,
  height: 0,
};

const getWindowSize = () => {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
  };
};

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => getWindowSize());

  useEffect(() => {
    const handleResize = () => {
      setState(getWindowSize());
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return useMemo(() => state, [state]);
}
