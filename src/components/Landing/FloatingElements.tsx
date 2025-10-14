import React from 'react';

export const FloatingElements: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 gradient-mesh" />
  );
};

export const Floating3DCard: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const AnimatedGradientOrb: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute ${className} pointer-events-none opacity-40`}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" />
      </div>
    </div>
  );
};
