import React, { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

const StatCard = ({ label, value, sub, delay = '0ms' }) => (
  <div className={`rounded-2xl p-6 shadow-sm border border-slate-800 bg-gradient-to-br from-indigo-900/40 via-slate-900/40 to-slate-900/20 hover:from-indigo-800/50 hover:via-slate-900/50 hover:to-slate-900/30 transition duration-300 animate-fade-up`} style={{ animationDelay: delay }}>
    <div className="text-xs uppercase tracking-wide text-indigo-300/90">{label}</div>
    <div className="text-3xl font-semibold text-slate-100 mt-1">{value}</div>
    {sub && <div className="text-sm text-indigo-300/80 mt-1">{sub}</div>}
  </div>
);

const Card = ({ title, children, delay = '0ms' }) => (
  <div className="rounded-2xl border border-slate-800 shadow-sm overflow-hidden bg-slate-900/60 backdrop-blur hover:-translate-y-0.5 hover:shadow-lg transition duration-300 animate-fade-up" style={{ animationDelay: delay }}>
    <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-800/40 text-base font-medium text-slate-200">{title}</div>
    <div className="p-6">{children}</div>
  </div>
);

const badgeClassByColor = {
  gray: 'bg-slate-700 text-slate-200',
  blue: 'bg-indigo-700/70 text-indigo-200',
  green: 'bg-emerald-700/70 text-emerald-200',
  red: 'bg-rose-700/70 text-rose-200',
  yellow: 'bg-amber-700/70 text-amber-200',
};

const Badge = ({ color = 'gray', children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClassByColor[color]}`}>{children}</span>
);

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [dataError, setDataError] = useState(null);

  useEffect(() => {
    apiGet('/health').then(setHealth).catch((e) => setHealthError(e.message));

    // Fetch classroom courses (also persists in backend)
    apiGet('/data/google-classroom')
      .then((res) => setCourses(res.courses || []))
      .catch((e) => setDataError(e.message));

    // Fetch calendar events (also persists in backend)
    apiGet('/data/google-calender')
      .then((res) => {
        const list = (res.courseEvents || []).flatMap((c) =>
          (c.events || []).map((ev) => ({
            courseName: c.courseName,
            id: ev.id,
            title: ev.title,
            start: ev.start?.dateTime || ev.start?.date || null,
            link: ev.link,
          }))
        );
        // sort by start descending, take latest 5
        list.sort((a, b) => new Date(b.start || 0) - new Date(a.start || 0));
        setEvents(list.slice(0, 5));
      })
      .catch((e) => setDataError((prev) => prev || e.message));
  }, []);

  return (
    <div className="min-h-screen text-slate-100">
      <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent animate-fade-in">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Courses" value={courses.length} sub="from Classroom" delay="0ms" />
        <StatCard label="Upcoming Events" value={events.length} sub="from Calendar" delay="80ms" />
        <StatCard label="AI Summaries" value="—" sub="run in Summaries tab" delay="160ms" />
        <StatCard label="Queue Pending" value="—" sub={<span className="text-amber-300">N/A</span>} delay="240ms" />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card title="🔄 Recent Course Events" delay="0ms">
          {dataError && <div className="text-rose-300 text-sm mb-2">{dataError}</div>}
          {!dataError && events.length === 0 && <div className="text-slate-400 text-sm">No upcoming events</div>}
          {events.length > 0 && (
            <ul className="text-base text-slate-200 divide-y divide-slate-800/80">
              {events.map((ev) => (
                <li key={ev.id} className="py-3 flex items-center justify-between">
                  <span>{ev.title} <span className="text-slate-400">· {ev.courseName}</span></span>
                  <a className="text-indigo-300 hover:underline" href={ev.link} target="_blank" rel="noreferrer">Open</a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="🤖 AI Summaries Generated Today" delay="80ms">
          <p className="text-base text-slate-300">Generate in the Course Summaries tab.</p>
        </Card>

        <Card title="⚙ System Status" delay="160ms">
          {!health && !healthError && <div className="text-slate-400 text-sm">Loading...</div>}
          {healthError && <div className="text-rose-300 text-sm">{healthError}</div>}
          {health && (
            <ul className="text-base text-slate-200 space-y-3">
              <li>MongoDB: <span className={`ml-1 rounded-full px-2.5 py-1 text-xs ${health.mongo?.connected ? 'bg-emerald-700/70 text-emerald-200' : 'bg-rose-700/70 text-rose-200'}`}>{health.mongo?.connected ? 'Connected' : 'Disconnected'}</span></li>
              <li>Port: <span className="ml-1 text-slate-300">{health.port}</span></li>
              <li>Updated: <span className="ml-1 text-slate-300">{new Date(health.timestamp).toLocaleTimeString()}</span></li>
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
