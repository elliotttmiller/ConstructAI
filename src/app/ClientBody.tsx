"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import AppLayout from "@/components/layout/AppLayout";
// import AuthGuard from "@/components/auth/AuthGuard"; // COMMENTED OUT FOR EASIER TESTING/DEVELOPMENT
import { Toaster } from "@/components/ui/sonner";
import CopilotContextProvider from "@/components/providers/CopilotContextProvider";
import LoadingBar from "@/components/transitions/LoadingBar";

// Lazy load AI components to reduce initial bundle size
const AICopilotSidepanel = dynamic(
  () => import("@/components/ai/AICopilotSidepanel"),
  { ssr: false }
);

const FloatingAIButton = dynamic(
  () => import("@/components/ai/FloatingAIButton"),
  { ssr: false }
);

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize production environment only once - with delay to not block rendering
  useEffect(() => {
    if (!isInitialized) {
      // Use requestIdleCallback to avoid blocking main thread
      const initProd = () => {
        import("@/lib/production-config")
          .then(({ initializeProduction }) => {
            initializeProduction();
            setIsInitialized(true);
          })
          .catch((err) => {
            console.warn("Production config failed to initialize:", err);
            setIsInitialized(true); // Mark as initialized even on error
          });
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(initProd, { timeout: 2000 });
      } else {
        setTimeout(initProd, 100);
      }
    }
  }, [isInitialized]);

  // Check if current route is a public auth route
  const isAuthRoute = pathname?.startsWith('/auth/');

  return (
    <CopilotContextProvider>
      <LoadingBar />
      <div className="antialiased">
        {/* AuthGuard COMMENTED OUT FOR EASIER TESTING/DEVELOPMENT */}
        {/* To re-enable authentication, uncomment the AuthGuard wrapper below */}
        {/* <AuthGuard> */}
          {isAuthRoute ? (
            // Don't wrap auth pages with AppLayout - no transition wrapper for instant load
            children
          ) : (
            // Wrap main app with AppLayout - no transition wrapper for instant navigation
            <AppLayout>
              {children}
            </AppLayout>
          )}
        {/* </AuthGuard> */}
        <Toaster />
        {/* AI Copilot Components - Available on all non-auth pages */}
        {!isAuthRoute && (
          <>
            <AICopilotSidepanel />
            <FloatingAIButton />
          </>
        )}
      </div>
    </CopilotContextProvider>
  );
}
