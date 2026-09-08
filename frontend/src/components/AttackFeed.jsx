import React from 'react';

export default function AttackFeed({ latestAction }) {
  // Default to 1, or read from backend action
  const depth = latestAction?.penetration_depth !== undefined ? latestAction.penetration_depth : 1;
  const intent = latestAction?.intent_classification || 'Initial Infiltration (T1078)';
  const confidence = latestAction?.intent_confidence
    ? Math.round(latestAction.intent_confidence * 100)
    : 92;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            Layer 2: Defender Telemetry
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800 font-mono font-semibold">
            CANARY ACTIVE
          </span>
        </div>

        {/* Big Metric Box */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-xl text-center">
            <div className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">
              Actual Loss
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              ₹0
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Asset isolated</div>
          </div>

          <div className="p-3 bg-cyan-950/30 border border-cyan-900/60 rounded-xl text-center">
            <div className="text-[11px] text-cyan-400 uppercase tracking-wider font-semibold">
              Prevented
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
              ₹34.5L
            </div>
            <div className="text-[10px] text-cyan-500/80 mt-0.5">Exposure contained</div>
          </div>
        </div>

        {/* Penetration Depth Meter */}
        <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-300">Penetration Depth</span>
            <span className={`text-xs font-mono font-bold ${
              depth === 1 ? 'text-yellow-400' : depth === 2 ? 'text-orange-400' : 'text-rose-400'
            }`}>
              Level {depth} of 3
            </span>
          </div>

          {/* 3 Step Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-1 p-0.5">
            {/* Step 1: Always lit if depth >= 1 */}
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${
              depth >= 1 ? 'bg-yellow-400' : 'bg-slate-700'
            }`} />
            {/* Step 2: Lit if depth >= 2 */}
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${
              depth >= 2 ? 'bg-orange-500' : 'bg-slate-700'
            }`} />
            {/* Step 3: Lit ONLY if depth >= 3 */}
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${
              depth >= 3 ? 'bg-rose-500' : 'bg-slate-700'
            }`} />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 mt-2">
            <span className={depth === 1 ? 'text-yellow-400 font-bold' : ''}>1. Enumeration</span>
            <span className={depth === 2 ? 'text-orange-400 font-bold' : ''}>2. Discovery</span>
            <span className={depth === 3 ? 'text-rose-400 font-bold' : ''}>3. Exploitation</span>
          </div>
        </div>

        {/* Threat Classification */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
          <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
            Live Threat Classification
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white font-mono">{intent}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono">
              {confidence}% Confidence
            </span>
          </div>

          {latestAction?.generated_filename && (
            <div className="pt-2 border-t border-slate-800/80 text-xs">
              <div className="text-slate-400 text-[11px]">Synthetic Honeyfile Created:</div>
              <div className="text-emerald-400 font-mono font-medium truncate mt-0.5">
                📄 {latestAction.generated_filename}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
        <span>MITRE ATT&CK: T1078 + T1036</span>
        <span className="text-slate-400">Sandbox Isolation Engaged</span>
      </div>
    </div>
  );
}