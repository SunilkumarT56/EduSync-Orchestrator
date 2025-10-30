import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';

const SectionTitle = ({ children }) => (
  <div className="text-base font-medium text-slate-200 mb-2">{children}</div>
);

const CourseSummaries = () => {
  const [me, setMe] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet('/data/me').then((data) => {
      setMe(data);
      if (data.courses && data.courses.length > 0) {
        setSelectedId(data.courses[0].courseId);
      }
    }).catch((e) => setError(e.message));
  }, []);

  const selectedCourse = useMemo(() => {
    if (!me) return null;
    return (me.courses || []).find(c => c.courseId === selectedId) || null;
  }, [me, selectedId]);

  const latestSummary = useMemo(() => {
    const list = selectedCourse?.summaryData || [];
    if (list.length === 0) return null;
    return list[list.length - 1];
  }, [selectedCourse]);

  const triggerSummaries = async () => {
    setProcessing(true); setError(null); setResult(null);
    try {
      const res = await apiPost('/gemini/process');
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 animate-fade-in">
      <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Course Summaries</h1>

      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: '40ms' }}>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="p-3 rounded-lg border border-slate-800 bg-slate-900/70 shadow-sm text-sm text-slate-200">
            {(me?.courses || []).map((course) => (
              <option key={course.courseId} value={course.courseId} className="bg-slate-900">{course.name}</option>
            ))}
          </select>
          <button onClick={triggerSummaries} disabled={processing} className="px-4 py-2 rounded-lg border border-indigo-500/40 bg-indigo-600/20 text-indigo-200 hover:bg-indigo-600/30 transition disabled:opacity-60">
            {processing ? 'Processing…' : 'Generate Summaries'}
          </button>
        </div>

        {error && <div className="text-rose-300 text-sm mb-4">{error}</div>}
        {result && (
          <div className="text-emerald-300 text-sm mb-4">Processed courses: {result.processedCourses}</div>
        )}

        {!selectedCourse && <div className="text-slate-400">No courses found. Go to Dashboard first to import Classroom courses.</div>}

        {selectedCourse && (
          <div className="rounded-2xl border border-slate-800 shadow-sm overflow-hidden bg-slate-900/60 backdrop-blur hover:-translate-y-0.5 hover:shadow-lg transition duration-300 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-800/40">
              <div className="text-2xl font-semibold text-slate-100">{selectedCourse.name}</div>
              <div className="mt-1 text-xs text-slate-400">{latestSummary ? 'AI Summary • Latest' : 'No summary yet'}</div>
            </div>
            <div className="p-6 space-y-6">
              {latestSummary ? (
                <>
                  <div>
                    <SectionTitle>Summary</SectionTitle>
                    <p className="text-base text-slate-300 leading-relaxed">{latestSummary.summaryText || '—'}</p>
                  </div>
                  <div>
                    <SectionTitle>Roadmap</SectionTitle>
                    <ol className="list-decimal ml-6 text-base space-y-1 text-slate-200">
                      {(latestSummary.roadmap || []).map((step, i) => <li key={i}>Week {step.week}: {step.focus} — {step.description}</li>)}
                    </ol>
                  </div>
                  <div>
                    <SectionTitle>Key Points</SectionTitle>
                    <ul className="list-disc ml-6 text-base space-y-1 text-slate-200">
                      {(latestSummary.keyPoints || []).map((kp, i) => <li key={i}>{kp}</li>)}
                    </ul>
                  </div>
                  <div>
                    <SectionTitle>Model Questions</SectionTitle>
                    <details className="rounded border border-slate-800 bg-slate-800/50 p-4 text-base">
                      <summary className="cursor-pointer font-medium">Show/Hide</summary>
                      <ul className="list-disc ml-6 text-sm mt-2 space-y-1 text-slate-300">
                        {(latestSummary.modelQuestions || []).map((q, i) => <li key={i}>{(q.type || '').toUpperCase()} → {q.question}</li>)}
                      </ul>
                    </details>
                  </div>
                  <div>
                    <SectionTitle>Action Plan</SectionTitle>
                    <ul className="ml-1 text-base space-y-2">
                      {(latestSummary.actionPlan || []).map((ap, i) => (
                        <li key={i} className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400"></span>{ap.task} (Priority: {ap.priority})</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-slate-400">No summary available. Click “Generate Summaries”.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSummaries;
