import React, { useState } from 'react';
import RiskGauge from './components/RiskGauge';
import Terminal from './components/Terminal';
import AttackFeed from './components/AttackFeed';

export default function App() {
  const [latestAction, setLatestAction] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Global Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-cyan-500/20">
            TG
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              ThreatCapital: GhostGrid
            </h1>
            <p className="text-[11px] text-slate-400">
              Autonomous Cyber Risk Quantification & Active Deception Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ENGINE ONLINE : PORT 8000
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Layer 1 Risk Assessment (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <RiskGauge />
        </div>

        {/* Middle Column: Interactive Sandbox Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Terminal onActionExecuted={(action) => setLatestAction(action)} />
        </div>

        {/* Right Column: Layer 2 Defender Telemetry & Canary Feed (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <AttackFeed latestAction={latestAction} />
        </div>
      </main>

      {/* Footer / Status Strip */}
      <footer className="border-t border-slate-800/80 px-6 py-3 bg-slate-950 text-[11px] text-slate-500 flex justify-between items-center font-mono">
        <div>Architecture: Monorepo | FastAPI + React + Vite + Google Gemini 2.5 Flash</div>
        <div className="text-slate-400">Hackathon Edition</div>
      </footer>
    </div>
  );
}