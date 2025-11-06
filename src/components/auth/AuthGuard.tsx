"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { Loader2, Zap } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

interface DirectUser {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  permissions: string[];
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [directUser, setDirectUser] = useState<DirectUser | null>(null);
  const [isCheckingDirectAuth, setIsCheckingDirectAuth] = useState(true);

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/signup', '/auth/error'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check for direct authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        const authMethod = localStorage.getItem('authMethod');

        if (storedUser && authMethod === 'direct') {
          const user = JSON.parse(storedUser);
          setDirectUser(user);
          console.log('🔐 Direct auth user found:', user.email);
        }
      } catch (error) {
        console.error('Error reading direct auth from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('authMethod');
      }
    }
    setIsCheckingDirectAuth(false);
  }, []);

  // Determine if user is authenticated (either NextAuth or direct)
  const isAuthenticated = session || directUser;
  const isLoading = status === 'loading' || isCheckingDirectAuth;

  useEffect(() => {
    if (isLoading) return; // Still loading

    if (!isAuthenticated && !isPublicRoute) {
      // Redirect to sign-in page if not authenticated
      console.log('🔒 Not authenticated, redirecting to sign-in');
      router.push('/auth/signin');
    } else if (isAuthenticated && isPublicRoute) {
      // Redirect to dashboard if already authenticated and on public route
      console.log('✅ Already authenticated, redirecting to dashboard');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router, pathname, isPublicRoute]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center animate-pulse">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading ConstructAI...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen while redirecting
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
