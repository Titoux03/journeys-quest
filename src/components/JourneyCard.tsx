import React from 'react';

interface JourneyCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
  title,
  subtitle,
  icon,
  color,
  onClick,
  badge,
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`journey-card hover:journey-card-glow transition-all duration-300 p-3 sm:p-4 text-left group relative w-full ${className}`}
    >
      {badge && (
        <div className="absolute top-2 right-2 z-10">
          {badge}
        </div>
      )}
      
      <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
        <div className={`p-2 sm:p-3 rounded-xl bg-secondary/30 transition-colors group-hover:bg-secondary/50 ${color}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-tight">
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">
            {subtitle}
          </p>
        </div>
      </div>
    </button>
  );
};