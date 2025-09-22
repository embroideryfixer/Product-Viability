import React from 'react';
import { ThumbsUpIcon, ThumbsDownIcon } from './Icons';

interface VerdictCardProps {
  decision: 'Recommended' | 'Not Recommended';
  reasoning: string;
  productName: string;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({ decision, reasoning, productName }) => {
  const isRecommended = decision === 'Recommended';
  const bgColor = isRecommended ? 'bg-success/10' : 'bg-error/10';
  const borderColor = isRecommended ? 'border-success/30' : 'border-error/30';
  const textColor = isRecommended ? 'text-success' : 'text-error';

  return (
    <div className={`p-6 md:p-8 rounded-2xl border ${bgColor} ${borderColor} shadow-lg`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className={`flex-shrink-0 w-24 h-24 rounded-full flex items-center justify-center ${isRecommended ? 'bg-success' : 'bg-error'}`}>
          {isRecommended ? <ThumbsUpIcon className="w-12 h-12 text-white" /> : <ThumbsDownIcon className="w-12 h-12 text-white" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-neutral-400">AI Verdict for "{productName}"</p>
          <h2 className={`text-4xl font-bold mt-1 ${textColor}`}>{decision}</h2>
          <p className="mt-3 text-neutral-300">{reasoning}</p>
        </div>
      </div>
    </div>
  );
};