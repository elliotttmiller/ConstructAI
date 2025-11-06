"use client";

import { ReactNode } from "react";
import MainNavigation from "./MainNavigation";
import TopHeader from "./TopHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar Navigation */}
      <MainNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Header */}
        <TopHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
