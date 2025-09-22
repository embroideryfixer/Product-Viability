import React, { useState, useCallback, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ResultCard } from './components/ResultCard';
import { VerdictCard } from './components/VerdictCard';
import { DollarSignIcon, UsersIcon, TargetIcon, ShoppingBagIcon, LightbulbIcon, TrendingUpIcon, GaugeIcon, ZapIcon } from './components/Icons';
import { analyzeProduct } from './services/geminiService';
import type { AnalysisResult } from './types';
import { Faq } from './components/Faq';

// --- Reusable Chart Components ---

const GaugeChart: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const R = 45;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const progress = value / 100;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress * 0.75); // 0.75 for 3/4 circle

  const getColor = () => {
    if (value < 40) return '#22c55e'; // green-500
    if (value < 75) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="flex flex-col items-center justify-center h-full" role="img" aria-label={`${label}: ${value}%`}>
      <svg width="150" height="120" viewBox="0 0 150 120">
        <defs>
            <linearGradient id={`gradient-${getColor()}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getColor()} stopOpacity="0.7" />
                <stop offset="100%" stopColor={getColor()} stopOpacity="1" />
            </linearGradient>
        </defs>
        <path
          d="M 30 95 A 45 45 0 1 1 120 95"
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 30 95 A 45 45 0 1 1 120 95"
          fill="none"
          stroke={`url(#gradient-${getColor()})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
        <text x="75" y="75" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="bold" fill="#e5e5e5">
          {value}%
        </text>
        <text x="75" y="95" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#a3a3a3">
          {label}
        </text>
      </svg>
    </div>
  );
};

const LineChart: React.FC<{ data: number[] }> = ({ data }) => {
  const width = 500;
  const height = 150;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d / 100) * (height - 2 * padding));
    return `${x},${y}`;
  }).join(' ');
  
  const monthLabels = ["12m ago", "11m", "10m", "9m", "8m", "7m", "6m", "5m", "4m", "3m", "2m", "Now"];


  return (
     <div className="w-full h-full flex flex-col items-center justify-center" role="img" aria-label="A line chart showing interest over the last 12 months.">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C4EF17" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#C4EF17" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`M ${points.split(' ')[0]} L ${points} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`} fill="url(#lineGradient)" />
            <polyline points={points} fill="none" stroke="#C4EF17" strokeWidth="2" />
            {data.map((d, i) => (
              <circle key={i} cx={padding + (i / (data.length - 1)) * (width - 2 * padding)} cy={height - padding - ((d / 100) * (height - 2 * padding))} r="3" fill="#0a0a0a" stroke="#C4EF17" strokeWidth="1.5" />
            ))}
             {monthLabels.map((label, i) => (
               <text key={label} x={padding + (i / (monthLabels.length - 1)) * (width - 2 * padding)} y={height - 5} textAnchor="middle" fontSize="10" fill="#a3a3a3">
                   {label}
               </text>
           ))}
        </svg>
    </div>
  );
};

// --- Helper ---
const competitionToValue = (level: 'Low' | 'Medium' | 'High'): number => {
  switch (level) {
    case 'Low': return 25;
    case 'Medium': return 60;
    case 'High': return 90;
    default: return 0;
  }
};

const loadingMessages = [
    'Gathering market intelligence...',
    'Sizing up the competition...',
    'Identifying top suppliers...',
    'Analyzing search trends...',
    'Cross-referencing influencer data...',
    'Formulating the final verdict...',
];


// --- Main App Component ---
const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(loadingMessages[0]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (isLoading) {
      let messageIndex = 0;
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2500);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setQuery(searchQuery);

    try {
      const result = await analyzeProduct(searchQuery);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-brand-primary to-white text-transparent bg-clip-text mb-2">
          Product Viability Analyzer
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
          Get an AI-powered viability report for your next dropshipping product idea.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto mb-12">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      <section aria-live="polite">
        {isLoading && (
            <div>
                <p className="text-center text-lg text-neutral-300 mb-6 animate-pulse">{loadingMessage}</p>
                <SkeletonLoader />
            </div>
        )}
        {error && (
          <div className="text-center p-8 bg-error/10 border border-error/30 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-error mb-2">Analysis Failed</h2>
            <p className="text-neutral-300">{error}</p>
          </div>
        )}
        {analysisResult && (
          <div className="flex flex-col gap-8">
            <VerdictCard
              decision={analysisResult.finalDecision}
              reasoning={analysisResult.decisionReasoning}
              productName={analysisResult.productName}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <ResultCard title="Market Saturation" icon={<GaugeIcon />}>
                 <GaugeChart value={analysisResult.marketSaturation} label="Saturation" />
               </ResultCard>
                <ResultCard title="Competition" icon={<UsersIcon />}>
                  <GaugeChart value={competitionToValue(analysisResult.competitionLevel)} label={analysisResult.competitionLevel} />
                </ResultCard>
               <ResultCard title="Revenue Potential" icon={<DollarSignIcon />} className="lg:col-span-1 md:col-span-2">
                    <div className="text-center h-full flex flex-col justify-center">
                        <p className="text-4xl font-bold text-neutral-100">{analysisResult.averageRevenuePotential}</p>
                        <p className="text-neutral-400">per month (estimated)</p>
                    </div>
                </ResultCard>
               <ResultCard title="Interest Over Time (12 months)" icon={<TrendingUpIcon />} className="md:col-span-2 lg:col-span-3">
                 <LineChart data={analysisResult.interestOverTime} />
               </ResultCard>
              <ResultCard title="Market Overview" icon={<LightbulbIcon />}>
                <p className="text-neutral-400">{analysisResult.marketOverview}</p>
              </ResultCard>
              <ResultCard title="Top Competitors" icon={<TargetIcon />}>
                <ul className="space-y-2">
                  {analysisResult.competitors.map((c) => (
                    <li key={c.name}>
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-brand-primary transition-colors">{c.name}</a>
                    </li>
                  ))}
                </ul>
              </ResultCard>
              <ResultCard title="Potential Vendors" icon={<ShoppingBagIcon />}>
                <ul className="space-y-2">
                  {analysisResult.potentialVendors.map((v) => (
                    <li key={v.name}>
                       <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-brand-primary transition-colors">{v.name}</a>
                    </li>
                  ))}
                </ul>
              </ResultCard>
              {analysisResult.relatedProductIdeas && analysisResult.relatedProductIdeas.length > 0 && (
                <ResultCard title="Related Product Ideas" icon={<ZapIcon />} className="md:col-span-2 lg:col-span-3">
                    <ul className="space-y-4">
                        {analysisResult.relatedProductIdeas.map((idea) => (
                            <li key={idea.name} className="border-b border-base-300 pb-3 last:border-b-0 last:pb-0">
                                <p className="font-semibold text-neutral-200">{idea.name}</p>
                                <p className="text-sm text-neutral-400">{idea.reasoning}</p>
                            </li>
                        ))}
                    </ul>
                </ResultCard>
            )}
            </div>
          </div>
        )}
      </section>

      <Faq />

      <footer className="text-center mt-16 text-neutral-500 text-sm">
        <p>
          Developed by Rex Technologies. Visit our website:{' '}
          <a
            href="https://www.rextechnologies.online"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-neutral-400 hover:text-brand-primary transition-colors"
          >
            www.rextechnologies.online
          </a>
        </p>
      </footer>
    </main>
  );
};

export default App;