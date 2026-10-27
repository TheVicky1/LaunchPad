import React, { useState, useEffect, useRef } from 'react';
import { Menu, MapPin, Database, User as UserIcon, LogOut, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState({ connectedToMongo: false, mode: 'loading' });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

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

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cities = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Remote'];

  const handleCitySelect = (e) => {
    const city = e.target.value;
    navigate(`/events?city=${city}`);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
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

      {/* Right side: Database Mode status badge & Auth Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase PostgreSQL Status Badge */}
        <div
          title={
            dbStatus.status === 'connected'
              ? 'Connected to Supabase PostgreSQL Database'
              : (dbStatus.message || 'Supabase PostgreSQL Connection Status')
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-2xs ${
            dbStatus.status === 'connected'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : 'bg-amber-50 text-amber-700 border-amber-200/80'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${dbStatus.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="hidden sm:inline">
            {dbStatus.status === 'connected' ? 'Supabase Connected' : 'Supabase (Config Required)'}
          </span>
          <span className="sm:hidden">
            {dbStatus.status === 'connected' ? 'Supabase' : 'Config'}
          </span>
        </div>

        {/* Authenticated User Menu vs Anonymous Guest Actions */}
        {isAuthenticated && user ? (
          <div className="relative pl-2 sm:pl-3 border-l border-slate-200" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
              aria-label="User account menu"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.name
                  ? user.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'ST'}
              </div>
              <div className="hidden lg:block text-left">
                <span className="block text-xs font-semibold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span className="block text-[10px] text-slate-400">
                  Class of {user.graduationYear || 2027}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Profile & Skills</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Guest Mode
            </span>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
