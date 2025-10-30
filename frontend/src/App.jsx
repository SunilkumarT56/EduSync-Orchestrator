import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CourseSummaries from './pages/CourseSummaries';
import JobQueueLogs from './pages/JobQueueLogs';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { apiGet } from './lib/api';

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/summaries', label: 'Course Summaries' },
  { to: '/jobs', label: 'Job Queue & Logs' },
  { to: '/settings', label: 'Settings' },
];

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    apiGet('/data/me')
      .then(() => { setIsAuthed(true); setAuthChecked(true); })
      .catch(() => { setIsAuthed(false); setAuthChecked(true); });
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="sticky top-0 z-30 backdrop-blur bg-slate-900/80 border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="flex items-center justify-between py-4">
              <div className="font-semibold tracking-tight text-lg bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">AUTOMATED SUMMARIZER</div>
              <div className="flex items-center gap-2">
                {nav.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow'
                          : 'hover:bg-slate-800/70 text-slate-300'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 animate-fade-in">
          {!authChecked ? (
            <div className="text-slate-400">Checking session…</div>
          ) : !isAuthed ? (
            <Login />
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/summaries" element={<CourseSummaries />} />
              <Route path="/jobs" element={<JobQueueLogs />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
