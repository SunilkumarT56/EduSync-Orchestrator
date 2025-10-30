import React from 'react';

const Settings = () => (
  <div className="min-h-screen text-slate-100 max-w-3xl animate-fade-in">
    <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Settings & Integrations</h1>
    <form className="space-y-6 rounded-2xl border border-slate-800 shadow-sm overflow-hidden bg-slate-900/60 backdrop-blur hover:shadow-lg transition animate-fade-up" style={{ animationDelay: '80ms' }}>
      <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-800/40 text-slate-200 text-base font-medium">Configuration</div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a href="/auth/google" className="inline-flex items-center justify-center rounded-lg border border-indigo-500/40 bg-indigo-600/20 px-4 py-2 text-indigo-200 hover:bg-indigo-600/30 transition">Connect Google</a>
          <a href="/auth/notion" className="inline-flex items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-600/20 px-4 py-2 text-cyan-200 hover:bg-cyan-600/30 transition">Connect Notion</a>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-slate-300">Notion API Key</label>
          <input type="text" className="w-full border border-slate-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-slate-900 text-slate-200 placeholder:text-slate-500" placeholder="Enter API key..." />
          <p className="text-xs text-emerald-300 mt-1">Status: Connected</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">S3</label>
            <span className="text-xs inline-block rounded-full bg-emerald-700/70 text-emerald-200 px-2.5 py-1">Connected</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">MongoDB</label>
            <span className="text-xs inline-block rounded-full bg-emerald-700/70 text-emerald-200 px-2.5 py-1">Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input id="cachettl" type="checkbox" className="accent-indigo-500 h-4 w-4" />
          <label htmlFor="cachettl" className="text-sm text-slate-300">Enable Cache TTL</label>
        </div>
        <div className="flex items-center gap-3">
          <input id="autosync" type="checkbox" className="accent-indigo-500 h-4 w-4" />
          <label htmlFor="autosync" className="text-sm text-slate-300">Enable Auto-sync</label>
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg py-3 transition-colors">Save Changes</button>
      </div>
    </form>
  </div>
);

export default Settings;
