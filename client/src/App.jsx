import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TrackerProvider } from './context/TrackerContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { JobsPage } from './pages/JobsPage';
import { OpenSourcePage } from './pages/OpenSourcePage';
import { EventsPage } from './pages/EventsPage';
import { TrackerPage } from './pages/TrackerPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <TrackerProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <Sidebar
              isMobileOpen={mobileMenuOpen}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/open-source" element={<OpenSourcePage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/tracker" element={<TrackerPage />} />
                  <Route path="/saved" element={<Navigate to="/tracker?status=Saved" replace />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </TrackerProvider>
    </AuthProvider>
  );
};

export default App;
