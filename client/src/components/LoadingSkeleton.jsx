import React from 'react';

export const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm animate-pulse flex flex-col justify-between h-64"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="w-24 h-4 bg-slate-200 rounded" />
                  <div className="w-16 h-3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-16 h-5 bg-slate-200 rounded-md" />
            </div>
            <div className="w-3/4 h-5 bg-slate-200 rounded mb-2.5" />
            <div className="space-y-2 mb-4">
              <div className="w-full h-3 bg-slate-100 rounded" />
              <div className="w-5/6 h-3 bg-slate-100 rounded" />
            </div>
          </div>
          <div>
            <div className="flex gap-2 mb-4">
              <div className="w-14 h-4 bg-slate-100 rounded" />
              <div className="w-16 h-4 bg-slate-100 rounded" />
              <div className="w-12 h-4 bg-slate-100 rounded" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <div className="w-20 h-4 bg-slate-100 rounded" />
              <div className="w-24 h-8 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
