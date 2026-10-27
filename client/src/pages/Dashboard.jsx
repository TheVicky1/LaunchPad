import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  GitBranch,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Flame,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OpportunityCard } from '../components/OpportunityCard';
import { EventCard } from '../components/EventCard';
import { OpenSourceCard } from '../components/OpenSourceCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { Badge } from '../components/Badge';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('All');
  const [dashboardCity, setDashboardCity] = useState('Bengaluru');

  const [opportunities, setOpportunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [openSourceList, setOpenSourceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [oppsRes, eventsRes, ossRes] = await Promise.all([
          api.getOpportunities({ limit: 8, sort: 'newest' }),
          api.getEvents({ city: dashboardCity, limit: 4 }),
          api.getOpenSource({ limit: 4, beginnerFriendly: true })
        ]);

        setOpportunities(oppsRes.data || []);
        setEvents(eventsRes.data || []);
        setOpenSourceList(ossRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dashboardCity]);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (selectedPillar === 'Jobs') {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    } else if (selectedPillar === 'Events') {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
    } else if (selectedPillar === 'OpenSource') {
      navigate(`/open-source?search=${encodeURIComponent(searchQuery)}`);
    } else {
      // Default to jobs with query
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Recommended opportunities based on student's skills
  const recommendedOpportunities = opportunities.filter((opp) => {
    if (!user?.skills || user.skills.length === 0) return true;
    return opp.skills?.some((s) =>
      user.skills.some((us) => us.toLowerCase() === s.toLowerCase())
    );
  }).slice(0, 3);

  // Closing soon opportunities
  const closingSoonOpportunities = opportunities
    .filter((opp) => opp.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. WELCOME HERO SECTION */}
      <section className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launchpad Opportunity Discovery</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome back, {user?.name || 'Alex'}!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
            Your next opportunity starts here. Discover high-impact tech internships, beginner-friendly open-source programs, and student hackathons in one unified space.
          </p>

          {/* Global Search Bar */}
          <form onSubmit={handleGlobalSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across internships, open source, hackathons, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedPillar}
                onChange={(e) => setSelectedPillar(e.target.value)}
                className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Jobs">Jobs & Internships</option>
                <option value="OpenSource">Open Source</option>
                <option value="Events">Events & Hackathons</option>
              </select>

              <button
                type="submit"
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. QUICK NAVIGATION - THREE PILLARS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/jobs"
          className="group bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                Jobs & Internships
              </h3>
              <Badge variant="primary" size="xs">
                {opportunities.length}+ Active
              </Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Explore curated software engineering, frontend, backend, and product internships at top tech companies and startups.
            </p>
          </div>
          <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1 pt-3 border-t border-slate-100">
            <span>Browse opportunities</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/open-source"
          className="group bg-white border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GitBranch className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                Open Source Programs
              </h3>
              <Badge variant="success" size="xs">
                {openSourceList.length}+ Programs
              </Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Structured initiatives like GSoC, LFX, Outreachy, plus interactive roadmaps for making your first pull request.
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 pt-3 border-t border-slate-100">
            <span>Explore open source</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/events"
          className="group bg-white border border-slate-200/90 hover:border-purple-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                Events & Hackathons
              </h3>
              <Badge variant="purple" size="xs">
                Citywide
              </Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Discover student hackathons, developer meetups, and cloud tech workshops in Bengaluru, Mumbai, Delhi, and Hyderabad.
            </p>
          </div>
          <div className="text-xs font-semibold text-purple-600 flex items-center gap-1 pt-3 border-t border-slate-100">
            <span>Find local events</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* 3. RECOMMENDED FOR YOU (SKILL MATCHING) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Recommended for Your Skill Profile
            </h2>
            <p className="text-xs text-slate-500">
              Matched based on your skills: {user?.skills?.slice(0, 4).join(', ')}
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id || opp._id}
                opportunity={opp}
                onOpenDetail={(item) => setModalItem(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. TWO-COLUMN SPLIT: CLOSING DEADLINES + UPCOMING EVENTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Closing Soon */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Approaching Deadlines</h3>
                <p className="text-[11px] text-slate-500">Opportunities closing soon</p>
              </div>
            </div>
            <Link
              to="/jobs?sort=deadline"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              See all
            </Link>
          </div>

          <div className="space-y-3">
            {closingSoonOpportunities.map((opp) => (
              <div
                key={opp.id || opp._id}
                onClick={() => setModalItem(opp)}
                className="p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/20 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-0.5 line-clamp-1">
                    {opp.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{opp.company}</span>
                    <span>•</span>
                    <span>{opp.location}</span>
                  </div>
                </div>

                <Badge variant="warning" size="xs">
                  {Math.ceil((new Date(opp.deadline) - new Date()) / 86400000)}d left
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events (City Filterable) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Events in {dashboardCity}</h3>
                <p className="text-[11px] text-slate-500">Hackathons, workshops & meetups</p>
              </div>
            </div>

            <select
              value={dashboardCity}
              onChange={(e) => setDashboardCity(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          <div className="space-y-3">
            {events.slice(0, 3).map((evt) => (
              <div
                key={evt.id || evt._id}
                onClick={() => setModalItem(evt)}
                className="p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-0.5 line-clamp-1">
                    {evt.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{evt.organizer}</span>
                    <span>•</span>
                    <Badge variant="cyan" size="xs">{evt.category}</Badge>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-purple-700 block">
                    {new Date(evt.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="text-[10px] text-slate-400">{evt.mode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RECENTLY ADDED OPPORTUNITIES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recently Added Opportunities</h2>
            <p className="text-xs text-slate-500">Real-time records verified on company portals</p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Explore all {opportunities.length}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.slice(0, 6).map((opp) => (
              <OpportunityCard
                key={opp.id || opp._id}
                opportunity={opp}
                onOpenDetail={(item) => setModalItem(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal View */}
      {modalItem && (
        <OpportunityDetailModal
          item={modalItem}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
};
