import React from 'react';

const Login = () => (
  <div className="min-h-[70vh] flex items-center justify-center text-slate-100 animate-fade-in">
    <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-10 md:p-12 shadow-sm backdrop-blur animate-scale-in">
      <h1 className="text-4xl font-semibold mb-3 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Welcome</h1>
      <p className="text-slate-300 mb-8 text-base">Sign in to continue with Automated Summarizer</p>
      <div className="grid gap-4">
        <a href="/auth/google" className="inline-flex items-center justify-center rounded-lg border border-indigo-500/40 bg-indigo-600/20 px-5 py-3 text-indigo-200 hover:bg-indigo-600/30 transition text-sm md:text-base">Continue with Google</a>
        <a href="/auth/notion" className="inline-flex items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-600/20 px-5 py-3 text-cyan-200 hover:bg-cyan-600/30 transition text-sm md:text-base">Connect Notion</a>
      </div>
      <p className="text-xs text-slate-400 mt-5">You may be redirected to grant permissions.</p>
    </div>
  </div>
);

export default Login;
