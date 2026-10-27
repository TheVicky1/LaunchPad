import React from 'react';
import { Bookmark, ExternalLink, MapPin, Building2, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';
import { useTracker } from '../context/TrackerContext';

export const OpportunityCard = ({ opportunity, onOpenDetail }) => {
  const { isSaved, toggleSave, getStatus } = useTracker();
  const saved = isSaved(opportunity.id || opportunity._id);
  const status = getStatus(opportunity.id || opportunity._id);

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return 'LP';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Helper for deadline urgency
  const getDeadlineText = (deadline) => {
    if (!deadline) return null;
    const diffDays = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Expired', variant: 'danger' };
    if (diffDays <= 3) return { label: 'Closing in ' + diffDays + 'd', variant: 'danger' };
    if (diffDays <= 12) return { label: 'Closing in ' + diffDays + 'd', variant: 'warning' };
    return { label: `In ${diffDays} days`, variant: 'default' };
  };

  const deadlineInfo = getDeadlineText(opportunity.deadline);

  // Status badge colors
  const statusColors = {
    Saved: 'primary',
    Preparing: 'warning',
    Applied: 'cyan',
    Interviewing: 'purple',
    Completed: 'success',
    Rejected: 'danger',
  };

  return (
    <div className="group relative bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top bar: Company + Logo fallback + Save bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {opportunity.companyLogo ? (
              <img
                src={opportunity.companyLogo}
                alt={opportunity.company}
                className="w-10 h-10 rounded-lg object-contain p-1 border border-slate-200 bg-slate-50"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-semibold text-sm flex items-center justify-center shadow-xs ${
                opportunity.companyLogo ? 'hidden' : 'flex'
              }`}
            >
              {getInitials(opportunity.company)}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-800">{opportunity.company}</span>
                {opportunity.lastVerifiedAt && (
                  <span title="Verified Listing" className="text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {opportunity.location || 'Remote'}
                </span>
                <span>•</span>
                <span className="font-medium text-slate-600">{opportunity.mode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {status && (
              <Badge variant={statusColors[status] || 'primary'} size="xs">
                {status}
              </Badge>
            )}
            <button
              onClick={() => toggleSave(opportunity)}
              title={saved ? 'Remove from Saved' : 'Save opportunity'}
              className={`p-2 rounded-lg border transition-colors ${
                saved
                  ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Opportunity Title */}
        <h3
          onClick={() => onOpenDetail && onOpenDetail(opportunity)}
          className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer mb-2 line-clamp-1"
        >
          {opportunity.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3.5 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Skills Pills */}
        {opportunity.skills && opportunity.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {opportunity.skills.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors"
              >
                {skill}
              </span>
            ))}
            {opportunity.skills.length > 4 && (
              <span className="text-xs text-slate-400 self-center">
                +{opportunity.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata and Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-2">
          {deadlineInfo ? (
            <Badge variant={deadlineInfo.variant} size="xs">
              <Clock className="w-3 h-3 mr-1" />
              {deadlineInfo.label}
            </Badge>
          ) : (
            <Badge variant="default" size="xs">
              <Calendar className="w-3 h-3 mr-1" />
              Ongoing
            </Badge>
          )}
          {opportunity.stipend && (
            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">
              {opportunity.stipend}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetail && onOpenDetail(opportunity)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Details
          </button>
          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-xs"
          >
            Apply
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
