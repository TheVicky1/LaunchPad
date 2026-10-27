import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, GitBranch, CheckCircle2, RotateCcw, BookOpen, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { OpenSourceCard } from '../components/OpenSourceCard';
import { OpenSourceGuide } from '../components/OpenSourceGuide';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { Badge } from '../components/Badge';

export const OpenSourcePage = () => {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [technology, setTechnology] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [programStatus, setProgramStatus] = useState('All');
  const [beginnerFriendly, setBeginnerFriendly] = useState(false);

  const [data, setData] = useState({ total: 0, totalPages: 1, data: [] });
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);

  const techOptions = ['Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'React', 'Docker'];

  useEffect(() => {
    const fetchOSS = async () => {
      setLoading(true);
      try {
        const res = await api.getOpenSource({
          search,
          technology,
          difficulty,
          programStatus,
          beginnerFriendly: beginnerFriendly ? 'true' : undefined,
          limit: 12,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load open source programs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOSS();
  }, [search, technology, difficulty, programStatus, beginnerFriendly]);

  const handleReset = () => {
    setSearch('');
    setTechnology('All');
    setDifficulty('All');
    setProgramStatus('All');
    setBeginnerFriendly(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GitBranch className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Open Source & Mentorship</h1>
          <Badge variant="success" size="xs">
            {data.total} Programs & Repos
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Discover structured open-source programs like GSoC, LFX, and Outreachy, find beginner-friendly codebases, and start building your public GitHub portfolio.
        </p>
      </div>

      {/* Interactive 6-step Getting Started Guide */}
      <OpenSourceGuide />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs (GSoC, LFX, Hacktoberfest) or tech (Python, React)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs items-center">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Technology</label>
            <select
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Technologies</option>
              {techOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Status</label>
            <select
              value={programStatus}
              onChange={(e) => setProgramStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Currently Open</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>

          <div className="pt-4 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={beginnerFriendly}
                onChange={(e) => setBeginnerFriendly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700">Beginner Friendly Only</span>
            </label>
          </div>
        </div>

        {(search || technology !== 'All' || difficulty !== 'All' || programStatus !== 'All' || beginnerFriendly) && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid of Programs */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : data.data.length === 0 ? (
        <EmptyState
          title="No open source programs found"
          description="Try selecting different difficulty levels or clearing the technology search filter."
          onReset={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.data.map((program) => (
            <OpenSourceCard
              key={program.id || program._id}
              program={program}
              onOpenDetail={(item) => setModalItem(item)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalItem && (
        <OpportunityDetailModal
          item={modalItem}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
};
