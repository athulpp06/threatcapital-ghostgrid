import React, { useState } from 'react';
import RiskGauge from './components/RiskGauge';
import Terminal from './components/Terminal';
import AttackFeed from './components/AttackFeed';

export default function App() {
  const [latestAction, setLatestAction] = useState(null);

  const queryParams = new URLSearchParams(window.location.search);
  const isHackerMode = queryParams.get('mode') === 'hacker';
  // Ensure a single persistent session id is created once for the app so all components share it
  const sessionKey = 'ghost_session_id';
  let sessionId = localStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = `ghost-sess-${Date.now().toString(16)}-${Math.floor(Math.random()*0xffff).toString(16)}`;
    try { localStorage.setItem(sessionKey, sessionId); } catch (e) {}
  }

  if (isHackerMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-center items-center font-mono selection:bg-rose-500 selection:text-slate-950">
        <div className="w-full max-w-4xl">
          <div className="bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-3 text-xs text-slate-400 font-bold tracking-wider uppercase">
                Remote Shell // target-node: 10.0.4.18 (SSH-2.0-OpenSSH)
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-400">
              SESSION ACTIVE
            </span>
          </div>
          <div className="border-x border-b border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
            <Terminal onActionExecuted={(action) => setLatestAction(action)} />
          </div>
          <div className="mt-3 text-right text-[11px] text-slate-600">
            Escaped sandbox routing: DISABLED | Session ID: {sessionId}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-cyan-500/20">
            TG
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              ThreatCapital: GhostGrid (SOC Defender Console)
            </h1>
            <p className="text-[11px] text-slate-400">
              Autonomous Cyber Risk Quantification & Active Deception Platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            DEFENDER RADAR ONLINE
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1500px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <RiskGauge />
        <AttackFeed latestAction={latestAction} />
      </main>

      <footer className="border-t border-slate-800/80 px-6 py-3 bg-slate-950 text-[11px] text-slate-500 flex justify-between items-center font-mono">
        <div>Node Architecture: Dual-Console Multi-Machine Live Demo</div>
        <div className="text-slate-400">Hackathon Edition</div>
      </footer>
    </div>
  );
}