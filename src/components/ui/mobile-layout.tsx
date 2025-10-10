import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function MobileLayout({ children, header, footer }: MobileLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col min-h-screen ${isMobile ? 'max-w-full' : 'max-w-md mx-auto border-x'}`}>
      {header && (
        <div className="sticky top-0 z-10 bg-background border-b">
          {header}
        </div>
      )}
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      {footer && (
        <div className="sticky bottom-0 z-10 bg-background border-t">
          {footer}
        </div>
      )}
    </div>
  );
}

export function MobileHeader({ 
  title, 
  leftAction, 
  rightAction 
}: { 
  title: string; 
  leftAction?: React.ReactNode; 
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 h-14">
      <div className="w-10">
        {leftAction}
      </div>
      <h1 className="font-semibold text-lg">{title}</h1>
      <div className="w-10 flex justify-end">
        {rightAction}
      </div>
    </div>
  );
}

export function MobileFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-around p-2 h-16">
      {children}
    </div>
  );
}

export function MobileNavItem({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
}) {
  return (
    <button 
      className={`flex flex-col items-center justify-center p-1 ${active ? 'text-primary' : 'text-muted-foreground'}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4">
      {children}
    </div>
  );
}

export function MobileCard({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`bg-card rounded-xl p-4 shadow-sm border border-border ${className || ''}`}>
      {children}
    </div>
  );
}