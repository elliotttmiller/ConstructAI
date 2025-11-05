"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
// import AuthGuard from "@/components/auth/AuthGuard"; // COMMENTED OUT FOR EASIER TESTING/DEVELOPMENT
import { Toaster } from "@/components/ui/sonner";
import { initializeProduction } from "@/lib/production-config";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Initialize production environment and remove extension classes
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";

    // Initialize production configuration and monitoring
    initializeProduction();
  }, []);

  // Check if current route is a public auth route
  const isAuthRoute = pathname?.startsWith('/auth/');

  return (
    <div className="antialiased">
      {/* AuthGuard COMMENTED OUT FOR EASIER TESTING/DEVELOPMENT */}
      {/* To re-enable authentication, uncomment the AuthGuard wrapper below */}
      {/* <AuthGuard> */}
        {isAuthRoute ? (
          // Don't wrap auth pages with AppLayout
          children
        ) : (
          // Wrap main app with AppLayout
          <AppLayout>
            {children}
          </AppLayout>
        )}
      {/* </AuthGuard> */}
      <Toaster />
    </div>
  );
}
