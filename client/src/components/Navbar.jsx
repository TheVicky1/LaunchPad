import React, { useState, useEffect } from 'react';
import { Menu, MapPin, CheckCircle2, Database, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState({ connectedToMongo: false, mode: 'loading' });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await api.getHealth();
        if (data && data.database) {
          setDbStatus(data.database);
        }
      } catch {
        setDbStatus({ connectedToMongo: false, mode: 'offline' });
      }
    };
    checkHealth();
  }, []);

  const cities = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Remote'];

  const handleCitySelect = (e) => {
    const city = e.target.value;
    navigate(`/events?city=${city}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span className="text-slate-500 font-medium">Explore City:</span>
          <select
            defaultValue="Bengaluru"
            onChange={handleCitySelect}
            className="font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side: Database Mode status badge & Profile */}
      <div className="flex items-center gap-3">
        {/* Backend / Database Connection Status Badge */}
        <div
          title={
            dbStatus.connectedToMongo
              ? 'Connected to MongoDB Database'
              : 'Operating in in-memory seed dataset fallback'
          }
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">
            {dbStatus.connectedToMongo ? 'MongoDB Connected' : 'Seed Data Live'}
          </span>
          <span className="sm:hidden">Live</span>
        </div>

        {/* User Profile Shortcut */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
              : 'AS'}
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-semibold text-slate-800 leading-tight">
              {user?.name || 'Alex Sharma'}
            </span>
            <span className="block text-[10px] text-slate-400">Class of 2027</span>
          </div>
        </Link>
      </div>
    </header>
  );
};
