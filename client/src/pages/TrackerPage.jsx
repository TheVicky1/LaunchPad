import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Bookmark,
  ExternalLink,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  FileEdit,
  ArrowUpRight
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';

export const TrackerPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const { trackedItems, updateStatus, removeItem } = useTracker();
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  const statuses = ['All', 'Saved', 'Preparing', 'Applied', 'Interviewing', 'Completed', 'Rejected'];

  const statusColors = {
    Saved: 'primary',
    Preparing: 'warning',
    Applied: 'cyan',
    Interviewing: 'purple',
    Completed: 'success',
    Rejected: 'danger',
  };

  const filteredItems = trackedItems.filter((item) => {
    if (selectedStatus === 'All') return true;
    return item.applicationStatus === selectedStatus;
  });

  const getStatusCount = (st) => {
    if (st === 'All') return trackedItems.length;
    return trackedItems.filter((i) => i.applicationStatus === st).length;
  };

  const handleStartEditNotes = (item) => {
    setEditingNotesId(item.opportunityId || item.id);
    setTempNotes(item.notes || '');
  };

  const handleSaveNotes = (id, currentStatus) => {
    updateStatus(id, currentStatus, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Personal Opportunity Tracker</h1>
          <Badge variant="primary" size="xs">
            {trackedItems.length} Saved & Applied
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your career applications pipeline. Change stages as you prepare, submit, and interview.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statuses.slice(1).map((st) => {
          const count = getStatusCount(st);
          const isCurrent = selectedStatus === st;
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(isCurrent ? 'All' : st)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isCurrent
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-50 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500 font-medium">{st}</span>
                <Badge variant={statusColors[st]} size="xs">
                  {count}
                </Badge>
              </div>
              <span className="text-xl font-bold text-slate-900">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              selectedStatus === st
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {st} ({getStatusCount(st)})
          </button>
        ))}
      </div>

      {/* Tracked Items List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title={`No opportunities marked as "${selectedStatus}"`}
          description="Browse opportunities across Jobs, Open Source, and Events, then click the Save bookmark to start tracking your progress."
          onReset={() => setSelectedStatus('All')}
        />
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const itemId = item.opportunityId || item.id;
            const isEditing = editingNotesId === itemId;

            return (
              <div
                key={itemId}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all hover:border-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side: Details */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-indigo-600 uppercase tracking-wider">
                      {item.company}
                    </span>
                    <Badge variant={item.category?.includes('Hackathon') ? 'purple' : 'primary'} size="xs">
                      {item.category || 'Opportunity'}
                    </Badge>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location || 'Remote'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  {/* Notes / Reminders */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Add notes (e.g. Interview on Thursday, portfolio submitted)..."
                        className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleSaveNotes(itemId, item.applicationStatus)}
                        className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                      <span className="italic">
                        {item.notes ? `"${item.notes}"` : 'No custom notes added.'}
                      </span>
                      <button
                        onClick={() => handleStartEditNotes(item)}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium"
                      >
                        <FileEdit className="w-3 h-3 inline mr-0.5" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Right side: Interactive Status Selector + Actions */}
                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-right">
                    <label className="block text-[10px] text-slate-400 font-medium mb-1">
                      Status Stage
                    </label>
                    <select
                      value={item.applicationStatus}
                      onChange={(e) => updateStatus(itemId, e.target.value)}
                      className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Saved">Saved</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {item.applicationUrl && (
                    <a
                      href={item.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Open application portal"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => removeItem(itemId)}
                    className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove from tracking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
