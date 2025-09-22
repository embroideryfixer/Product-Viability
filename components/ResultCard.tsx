import React from 'react';

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-base-200 p-6 rounded-xl border border-base-300 h-full shadow-lg transition-all hover:border-brand-primary hover:-translate-y-1 duration-300 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-brand-primary">{icon}</div>
        <h3 className="text-lg font-semibold text-neutral-200">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
};