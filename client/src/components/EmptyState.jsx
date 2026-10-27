import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

export const EmptyState = ({
  title = 'No opportunities found',
  description = 'Try adjusting your search criteria or resetting the active filters.',
  onReset
}) => {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );
};
