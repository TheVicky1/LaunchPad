import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Calendar, MapPin, RotateCcw, Filter, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { EventCard } from '../components/EventCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { Badge } from '../components/Badge';

export const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [city, setCity] = useState(searchParams.get('city') || 'Bengaluru');
  const [category, setCategory] = useState('All');
  const [mode, setMode] = useState('All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('date');

  const [data, setData] = useState({ total: 0, totalPages: 1, data: [] });
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);

  const majorCities = [
    { name: 'Bengaluru', count: 'Hotspot' },
    { name: 'Hyderabad', count: 'Tech Hub' },
    { name: 'Mumbai', count: 'Fintech' },
    { name: 'Delhi', count: 'Capital' },
    { name: 'Pune', count: 'Open Source' },
    { name: 'Remote', count: 'Online' },
    { name: 'All', count: 'All Cities' }
  ];

  useEffect(() => {
    const urlCity = searchParams.get('city');
    if (urlCity && urlCity !== city) {
      setCity(urlCity);
    }
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null && urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.getEvents({
          city: city === 'All' ? undefined : city,
          category,
          mode,
          search,
          sort,
          limit: 12,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [city, category, mode, search, sort]);

  const handleCityChange = (newCity) => {
    setCity(newCity);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newCity === 'All') next.delete('city');
      else next.set('city', newCity);
      return next;
    });
  };

  const handleReset = () => {
    setCity('Bengaluru');
    setCategory('All');
    setMode('All');
    setSearch('');
    setSort('date');
    setSearchParams({ city: 'Bengaluru' });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Events & Hackathons</h1>
          <Badge variant="purple" size="xs">
            {data.total} in {city}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Discover college hackathons, technical workshops, GDG DevFests, and meetups happening in your city or online.
        </p>
      </div>

      {/* Prominent City Selector Tabs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            Select Your Target City
          </span>
          <span className="text-[11px] text-slate-400">Filters real event database records</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {majorCities.map((item) => {
            const isSelected = city.toLowerCase() === item.name.toLowerCase();
            return (
              <button
                key={item.name}
                onClick={() => handleCityChange(item.name)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{item.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isSelected ? 'bg-purple-700 text-purple-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by name, organizer (GDG, AWS...), or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Event Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="All">All Categories</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Conference">Conference</option>
              <option value="Workshop">Hands-on Workshop</option>
              <option value="Meetup">Community Meetup</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="All">All Modes</option>
              <option value="Offline">In-Person (Offline)</option>
              <option value="Online">Virtual (Online)</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Sort Order</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="date">Upcoming Date (Earliest First)</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {(search || category !== 'All' || mode !== 'All' || city !== 'Bengaluru') && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Bengaluru
            </button>
          </div>
        )}
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : data.data.length === 0 ? (
        <EmptyState
          title={`No upcoming events found in ${city}`}
          description="Try switching cities to Bengaluru, Hyderabad, or Remote, or clearing the category filter."
          onReset={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.data.map((evt) => (
            <EventCard
              key={evt.id || evt._id}
              event={evt}
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
