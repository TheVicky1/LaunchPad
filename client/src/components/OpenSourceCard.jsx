import React from 'react';
import { GitBranch, ExternalLink, Bookmark, BookOpen, CheckCircle, Code2 } from 'lucide-react';
import { Badge } from './Badge';
import { useTracker } from '../context/TrackerContext';

export const OpenSourceCard = ({ program, onOpenDetail }) => {
  const { isSaved, toggleSave } = useTracker();
  const saved = isSaved(program.id || program._id);

  const difficultyVariants = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger',
  };

  const statusVariants = {
    Open: 'success',
    Upcoming: 'primary',
    Closed: 'default',
  };

  return (
    <div className="group relative bg-white border border-slate-200/90 hover:border-emerald-300 rounded-xl p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top Header: Organization & Difficulty & Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-sm shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  {program.organization}
                </span>
                <Badge variant={statusVariants[program.programStatus] || 'default'} size="xs">
                  {program.programStatus}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={difficultyVariants[program.difficulty] || 'default'} size="xs">
                  {program.difficulty}
                </Badge>
                {program.isBeginnerFriendly && (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    Beginner Friendly
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleSave(program)}
            title={saved ? 'Remove from Saved' : 'Save program'}
            className={`p-2 rounded-lg border transition-colors shrink-0 ${
              saved
                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Program Name */}
        <h3
          onClick={() => onOpenDetail && onOpenDetail(program)}
          className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors cursor-pointer mb-2 line-clamp-1"
        >
          {program.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3.5 leading-relaxed">
          {program.description}
        </p>

        {/* Technologies */}
        {program.technologies && program.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {program.technologies.slice(0, 4).map((tech, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors"
              >
                <Code2 className="w-2.5 h-2.5 text-slate-400" />
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-2">
          {program.contributionGuideUrl && (
            <a
              href={program.contributionGuideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Guide
            </a>
          )}
          {program.repositoryUrl && (
            <a
              href={program.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Repo
            </a>
          )}
        </div>

        <a
          href={program.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-xs"
        >
          Visit Program
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
