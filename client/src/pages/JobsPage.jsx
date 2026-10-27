import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, Briefcase, MapPin, Laptop, Tag } from 'lucide-react';
import { api } from '../services/api';
import { OpportunityCard } from '../components/OpportunityCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { Badge } from '../components/Badge';

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [mode, setMode] = useState(searchParams.get('mode') || 'All');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skills') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ total: 0, totalPages: 1, data: [] });
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);

  const popularSkills = ['React', 'Python', 'Java', 'Node.js', 'Go', 'AWS', 'Docker', 'Distributed Systems'];

  useEffect(() => {
    // Sync url params if changed from outside
    const querySearch = searchParams.get('search');
    if (querySearch !== null && querySearch !== search) {
      setSearch(querySearch);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const res = await api.getOpportunities({
          search,
          category,
          location,
          mode,
          skills: selectedSkill,
          sort,
          page,
          limit: 12,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [search, category, location, mode, selectedSkill, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('All');
    setMode('All');
    setSelectedSkill('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Briefcase className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs & Internships</h1>
          <Badge variant="primary" size="xs">
            {data.total} listings
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Discover verified software, product, and engineering opportunities from top companies and innovative tech startups.
        </p>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by role title, company (Google, Amazon...), skills, or keywords..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract / Grant</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Locations</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Work Mode</label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="deadline">Approaching Deadline</option>
              <option value="company">Company Name</option>
            </select>
          </div>
        </div>

        {/* Popular Skills Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Quick Filter:</span>
          {popularSkills.map((sk) => {
            const isSelected = selectedSkill.toLowerCase() === sk.toLowerCase();
            return (
              <button
                key={sk}
                onClick={() => {
                  setSelectedSkill(isSelected ? '' : sk);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sk}
              </button>
            );
          })}
          {(search || category !== 'All' || location !== 'All' || mode !== 'All' || selectedSkill) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 ml-auto font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : data.data.length === 0 ? (
        <EmptyState
          title="No opportunities found matching your filters"
          description="Try broadening your search term or clearing location and skill filters to explore all available listings."
          onReset={handleResetFilters}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.data.map((opp) => (
              <OpportunityCard
                key={opp.id || opp._id}
                opportunity={opp}
                onOpenDetail={(item) => setModalItem(item)}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">
                Page {page} of {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
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
