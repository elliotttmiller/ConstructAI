"use client";

import { useState, useEffect } from "react";

/**
 * Responsive breakpoints as per frontend_plan.md
 */
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  hd: 1440,
} as const;

/**
 * Hook to detect current breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<
    "mobile" | "tablet" | "desktop" | "hd" | "uhd"
  >("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) {
        setBreakpoint("mobile");
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint("tablet");
      } else if (width < BREAKPOINTS.desktop) {
        setBreakpoint("desktop");
      } else if (width < BREAKPOINTS.hd) {
        setBreakpoint("hd");
      } else {
        setBreakpoint("uhd");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to detect if device is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

/**
 * Hook for sidebar collapse state with responsive behavior
 */
export function useSidebarState() {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < BREAKPOINTS.mobile;
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isCollapsed]);

  return {
    isCollapsed,
    setIsCollapsed,
    isMobile,
  };
}
