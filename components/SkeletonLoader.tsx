import React from 'react';

const SkeletonCard: React.FC = () => (
    <div className="bg-base-200 p-6 rounded-xl border border-base-300 h-full">
        <div className="h-6 w-1/2 bg-neutral-700 rounded mb-4"></div>
        <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-700 rounded w-full"></div>
    </div>
);

export const SkeletonLoader: React.FC = () => {
    return (
        <div className="animate-pulse flex flex-col gap-8">
            <div className="bg-base-200 p-8 rounded-2xl border border-base-300">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-neutral-700"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-4 w-1/4 bg-neutral-700 rounded"></div>
                        <div className="h-8 w-1/2 bg-neutral-700 rounded"></div>
                        <div className="h-4 w-full bg-neutral-700 rounded"></div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
};