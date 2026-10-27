import React from 'react';
import { Calendar, MapPin, ExternalLink, Bookmark, Users, Sparkles } from 'lucide-react';
import { Badge } from './Badge';
import { useTracker } from '../context/TrackerContext';

export const EventCard = ({ event, onOpenDetail }) => {
  const { isSaved, toggleSave } = useTracker();
  const saved = isSaved(event.id || event._id);

  // Parse start date
  const dateObj = new Date(event.startDate);
  const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();
  const weekday = dateObj.toLocaleString('en-US', { weekday: 'short' });

  const categoryVariants = {
    Hackathon: 'purple',
    Conference: 'primary',
    Workshop: 'cyan',
    Meetup: 'success',
    Competition: 'warning',
  };

  const modeVariants = {
    Offline: 'default',
    Online: 'success',
    Hybrid: 'cyan',
  };

  return (
    <div className="group relative bg-white border border-slate-200/90 hover:border-purple-300 rounded-xl p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top row: Date pill + Category + Mode + Save */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Calendar Block */}
            <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold text-purple-700 tracking-wider leading-none">
                {month}
              </span>
              <span className="text-base font-extrabold text-slate-900 leading-tight">
                {day}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant={categoryVariants[event.category] || 'primary'} size="xs">
                  {event.category}
                </Badge>
                <Badge variant={modeVariants[event.mode] || 'default'} size="xs">
                  {event.mode}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{event.organizer}</p>
            </div>
          </div>

          <button
            onClick={() => toggleSave(event)}
            title={saved ? 'Remove from Saved' : 'Save event'}
            className={`p-2 rounded-lg border transition-colors shrink-0 ${
              saved
                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenDetail && onOpenDetail(event)}
          className="text-base font-semibold text-slate-900 group-hover:text-purple-600 transition-colors cursor-pointer mb-2 line-clamp-2 leading-snug"
        >
          {event.title}
        </h3>

        {/* Venue / City */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800">{event.city}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 truncate">{event.venue || 'Venue to be shared'}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {event.description}
        </p>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{weekday}, {month} {day}</span>
        </div>

        <div className="flex items-center gap-2">
          {event.sourceUrl && (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-800 text-xs px-2 py-1"
            >
              Info
            </a>
          )}
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-xs"
          >
            Register
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
