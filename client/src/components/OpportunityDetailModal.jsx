import React, { useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  Clock,
  Briefcase,
  DollarSign,
  GraduationCap,
  Globe
} from 'lucide-react';
import { Badge } from './Badge';
import { useTracker } from '../context/TrackerContext';

export const OpportunityDetailModal = ({ item, onClose }) => {
  const { isSaved, toggleSave, getStatus, updateStatus } = useTracker();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const itemId = item.id || item._id;
  const saved = isSaved(itemId);
  const currentStatus = getStatus(itemId) || 'Not Tracked';

  const title = item.title || item.name;
  const company = item.company || item.organizer || item.organization;
  const location = item.location || item.city || 'Remote';
  const mode = item.mode || 'Online';
  const category = item.category || (item.difficulty ? `${item.difficulty} OSS` : 'Opportunity');
  const deadline = item.deadline || item.registrationDeadline || item.applicationDeadline;
  const targetUrl = item.applicationUrl || item.registrationUrl || item.officialUrl;

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    updateStatus(itemId, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Opportunity Details
            </span>
            <Badge variant="primary" size="xs">
              {category}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Organization & Title */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-1">
              <Building2 className="w-4 h-4" />
              <span>{company}</span>
              {item.lastVerifiedAt && (
                <span title="Verified" className="text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h2>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Location & Mode</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {location} ({mode})
              </span>
            </div>

            {deadline && (
              <div>
                <span className="text-slate-400 block mb-0.5">Deadline / Date</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {new Date(deadline).toLocaleDateString()}
                </span>
              </div>
            )}

            {item.stipend && (
              <div>
                <span className="text-slate-400 block mb-0.5">Compensation</span>
                <span className="font-semibold text-emerald-700">{item.stipend}</span>
              </div>
            )}

            {item.experienceLevel && (
              <div>
                <span className="text-slate-400 block mb-0.5">Experience Level</span>
                <span className="font-semibold text-slate-700">{item.experienceLevel}</span>
              </div>
            )}

            {item.sourceName && (
              <div>
                <span className="text-slate-400 block mb-0.5">Source Platform</span>
                <span className="font-semibold text-slate-700">{item.sourceName}</span>
              </div>
            )}

            {item.venue && (
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Venue</span>
                <span className="font-semibold text-slate-700">{item.venue}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Description & Scope</h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Skills / Tech */}
          {(item.skills || item.technologies || item.tags) && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Skills & Technologies</h4>
              <div className="flex flex-wrap gap-1.5">
                {(item.skills || item.technologies || item.tags).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility if Open Source */}
          {item.eligibility && (
            <div className="mb-6 p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Eligibility Requirements
              </h4>
              <p className="text-xs text-emerald-900">{item.eligibility}</p>
            </div>
          )}

          {/* Application Tracking Control Inside Modal */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">Personal Opportunity Tracker</span>
              <span className="text-[11px] text-slate-500">Track your progress for this opportunity.</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={currentStatus === 'Not Tracked' ? 'Saved' : currentStatus}
                onChange={handleStatusChange}
                className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Saved">Saved</option>
                <option value="Preparing">Preparing</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                onClick={() => toggleSave(item)}
                className={`p-2 rounded-lg border transition-colors ${
                  saved
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
                title={saved ? 'Remove from Saved' : 'Save opportunity'}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>

          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            Open Official Application Page
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
