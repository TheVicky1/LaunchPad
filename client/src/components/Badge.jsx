import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1 text-sm font-medium',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/60',
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/60',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200/60',
    outline: 'bg-transparent text-slate-600 border border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md transition-colors ${sizeClasses[size] || sizeClasses.sm} ${
        variantClasses[variant] || variantClasses.default
      } ${className}`}
    >
      {children}
    </span>
  );
};
