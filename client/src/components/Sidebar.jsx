import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  GitBranch,
  Calendar,
  CheckSquare,
  Bookmark,
  User,
  Compass,
  Sparkles
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { savedCount, totalCount } = useTracker();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Jobs & Internships', path: '/jobs', icon: Briefcase },
    { name: 'Open Source', path: '/open-source', icon: GitBranch },
    { name: 'Events & Hackathons', path: '/events', icon: Calendar },
    {
      name: 'My Applications',
      path: '/tracker',
      icon: CheckSquare,
      badge: totalCount > 0 ? totalCount : null,
    },
    {
      name: 'Saved',
      path: '/saved',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null,
    },
    { name: 'Profile & Skills', path: '/profile', icon: User },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 w-64 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">
            Launchpad
          </span>
          <span className="text-[10px] font-medium text-indigo-600 tracking-wider uppercase">
            Student Discovery
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Discovery Pillars
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => onCloseMobile && onCloseMobile()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                        isActive
                          ? 'bg-indigo-200/80 text-indigo-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Philosophy Card in Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-50/40 border border-indigo-100/80 rounded-xl p-3.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Core Philosophy</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Discover → Prepare → Apply → Track → Grow
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-xs h-full bg-white shadow-xl flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
