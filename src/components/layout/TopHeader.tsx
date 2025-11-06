"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Command,
  Shield,
} from "lucide-react";

interface TopHeaderProps {
  className?: string;
}

interface DirectUser {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  permissions: string[];
}

export default function TopHeader({ className }: TopHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [directUser, setDirectUser] = useState<DirectUser | null>(null);
  const [authMethod, setAuthMethod] = useState<'nextauth' | 'direct' | null>(null);

  // Check for direct authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        const storedAuthMethod = localStorage.getItem('authMethod');

        if (storedUser && storedAuthMethod === 'direct') {
          const user = JSON.parse(storedUser);
          setDirectUser(user);
          setAuthMethod('direct');
        } else if (session) {
          setAuthMethod('nextauth');
        }
      } catch (error) {
        console.error('Error reading direct auth from localStorage:', error);
      }
    }
  }, [session]);

  // Get current user info (either from session or direct auth)
  const currentUser = session?.user || directUser;
  const userInitials = currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleSignOut = async () => {
    if (authMethod === 'direct') {
      // Handle direct auth logout
      try {
        await fetch('/api/auth/direct-logout', {
          method: 'POST',
        });

        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('authMethod');

        // Redirect to sign-in
        router.push('/auth/signin');
      } catch (error) {
        console.error('Direct logout error:', error);
        // Force logout by clearing storage and redirecting
        localStorage.removeItem('user');
        localStorage.removeItem('authMethod');
        router.push('/auth/signin');
      }
    } else {
      // Handle NextAuth logout
      signOut({ callbackUrl: '/auth/signin' });
    }
  };

  return (
    <header className={`bg-background border-b ${className}`}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, documents, agents..."
              className="pl-10 pr-4"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start p-4">
                <div className="flex items-center space-x-2 w-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Clash Detection Complete</span>
                  <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Found 3 clashes in Project Alpha BIM model
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-4">
                <div className="flex items-center space-x-2 w-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Document Processed</span>
                  <span className="text-xs text-muted-foreground ml-auto">5m ago</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  CAD drawings successfully converted to 3D
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-4">
                <div className="flex items-center space-x-2 w-full">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">PM Bot Update</span>
                  <span className="text-xs text-muted-foreground ml-auto">10m ago</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Task assignment completed for Foundation Phase
                </p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help */}
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-muted-foreground">Role: {currentUser?.role}</p>
                  <p className="text-xs text-muted-foreground">Dept: {currentUser?.department}</p>
                  {authMethod && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3" />
                      <p className="text-xs text-muted-foreground">
                        Auth: {authMethod === 'nextauth' ? 'NextAuth.js' : 'Direct'}
                      </p>
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
