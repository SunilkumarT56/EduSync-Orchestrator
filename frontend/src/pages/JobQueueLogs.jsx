import React from 'react';

const jobs = [
  { id: 1, status: 'Pending', timestamp: '2025-10-30 15:30', duration: '-', error: '' },
  { id: 2, status: 'Completed', timestamp: '2025-10-30 15:10', duration: '35s', error: '' },
  { id: 3, status: 'Failed', timestamp: '2025-10-30 14:59', duration: '22s', error: 'Timeout error' },
];

const statusClass = (s) => ({
  Pending: 'bg-amber-700/70 text-amber-200',
  'In Progress': 'bg-indigo-700/70 text-indigo-200',
  Completed: 'bg-emerald-700/70 text-emerald-200',
  Failed: 'bg-rose-700/70 text-rose-200',
}[s] || 'bg-slate-700 text-slate-200');

const JobQueueLogs = () => (
  <div className="min-h-screen text-slate-100 animate-fade-in">
    <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Job Queue & Logs</h1>

    <div className="rounded-2xl border border-slate-800 shadow-sm overflow-hidden bg-slate-900/60 backdrop-blur hover:shadow-lg transition animate-fade-up" style={{ animationDelay: '100ms' }}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-slate-900/80 to-slate-800/40">
            <tr className="text-left text-sm md:text-base text-slate-300">
              <th className="p-4">Status</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Error Logs</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, idx) => (
              <tr key={job.id} className={`${idx % 2 ? 'bg-slate-900/40' : 'bg-slate-900/20'} hover:bg-slate-800/40 transition-colors border-t border-slate-800`}>
                <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(job.status)}`}>{job.status}</span></td>
                <td className="p-4 text-xs md:text-sm text-slate-300">{job.timestamp}</td>
                <td className="p-4 text-xs md:text-sm text-slate-300">{job.duration}</td>
                <td className="p-4 text-xs md:text-sm text-slate-300">{job.error || '-'}</td>
                <td className="p-4 text-xs md:text-sm">
                  {job.status === 'Failed' && <button className="px-3 py-1.5 rounded border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/20">Retry</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default JobQueueLogs;
