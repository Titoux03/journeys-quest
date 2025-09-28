import React from 'react';
import { BottomNavigation } from './BottomNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  currentTab,
  onTabChange
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradient premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-secondary opacity-50" />
      
      {/* Status bar safe area */}
      <div className="safe-area-top" />
      
      {/* Main content */}
      <main className="flex-1 relative z-10 pb-20 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation currentTab={currentTab} onTabChange={onTabChange} />
      
      {/* Bottom safe area */}
      <div className="safe-area-bottom" />
    </div>
  );
};