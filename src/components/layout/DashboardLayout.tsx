import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-surface min-h-screen text-on-surface">
      <Sidebar isMobile={isMobileMenuOpen} onToggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="lg:pl-sidebar-width flex flex-col min-h-screen">
        <Header onToggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="w-full pt-16 pb-space-2xl lg:pb-space-xl px-space-md lg:px-space-xl flex-1">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}