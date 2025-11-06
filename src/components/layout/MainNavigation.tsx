"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OptimizedLink } from "@/components/navigation/OptimizedLink";
import {
  MessageSquare,
  LayoutDashboard,
  FileText,
  Building,
  Users,
  Settings,
  Bot,
  Upload,
  Hammer,
  Zap,
  Menu,
  Search,
  Bell,
  User,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Project overview and metrics",
  },
  {
    name: "Agents",
    href: "/agents",
    icon: Bot,
    description: "Multi-agent dashboard",
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
    description: "Processing center",
    children: [
      { name: "All Documents", href: "/documents" },
      { name: "OCR Processing", href: "/documents?filter=processing" },
      { name: "Completed", href: "/documents?filter=completed" },
    ],
  },
  {
    name: "3D BIM Viewer",
    href: "/bim",
    icon: Building,
    description: "3D visualization",
    badge: "3D",
  },
  {
    name: "Projects",
    href: "/projects",
    icon: Hammer,
    description: "Project management",
  },
  {
    name: "Team",
    href: "/team",
    icon: Users,
    description: "Team directory",
  },
];

interface MainNavigationProps {
  className?: string;
}

export default function MainNavigation({ className }: MainNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Prefetch all main routes on mount for instant navigation
  useEffect(() => {
    const routes = navigation.map(item => item.href).filter(Boolean);
    
    // Prefetch immediately for core routes (no idle callback delay)
    routes.forEach(route => {
      if (route) router.prefetch(route);
    });
  }, [router]);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo and Brand */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ConstructAI</h1>
            <p className="text-xs text-muted-foreground">AI Construction Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.href ? (
              <Link
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ) : (
              <div
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg cursor-default opacity-70",
                  "text-muted-foreground"
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name || item.badge}</span>
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            )}

            {/* Sub-navigation */}
            {item.children && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    prefetch={true}
                    className={cn(
                      "block px-3 py-1.5 text-xs rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === child.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <Link
          href="/settings"
          prefetch={true}
          className={cn(
            "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === "/settings"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground"
          )}
          onClick={() => setIsOpen(false)}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-card lg:border-r", className)}>
        <NavContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
