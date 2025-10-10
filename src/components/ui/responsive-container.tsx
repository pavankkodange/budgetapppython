import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  'full': 'max-w-full'
};

export function ResponsiveContainer({ 
  children, 
  className = '', 
  maxWidth = 'lg' 
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`w-full mx-auto ${isMobile ? 'px-4' : 'px-6'} ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveGrid({ 
  children, 
  cols = { 
    mobile: 1, 
    tablet: 2, 
    desktop: 3 
  },
  gap = 'md',
  className = ''
}: { 
  children: React.ReactNode; 
  cols?: { 
    mobile: number; 
    tablet: number; 
    desktop: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  return (
    <div className={`grid grid-cols-${cols.mobile} md:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}