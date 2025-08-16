import React from 'react';

const LoadingSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-full"></div>
        </div>
      ))}
    </div>
  );
};

// Card skeleton for loading states
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg ${className}`}>
    <div className="animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

// Table skeleton for loading states
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden ${className}`}>
    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
    </div>
    <div className="p-6">
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4 animate-pulse" style={{ animationDelay: `${rowIndex * 0.1}s` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`h-4 bg-slate-200 dark:bg-slate-700 rounded ${
                  colIndex === 0 ? 'w-1/3' : colIndex === columns - 1 ? 'w-1/4' : 'w-1/2'
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Stats card skeleton
export const StatsCardSkeleton = ({ className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg ${className}`}>
    <div className="animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </div>
    </div>
  </div>
);

// Map skeleton
export const MapSkeleton = ({ className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden ${className}`}>
    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse mb-2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
    </div>
    <div className="h-96 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto animate-pulse"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-32 animate-pulse"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton = ({ fields = 4, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg ${className}`}>
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
      
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2 animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      ))}
      
      <div className="flex space-x-4 pt-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-24 animate-pulse"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-24 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;