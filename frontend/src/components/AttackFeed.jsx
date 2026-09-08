import { useState } from 'react';

export default function AttackFeed({ sessionState, isLoading }) {
  const [isUpdating] = useState(false);
  const {
    penetration_level: depth,
    attacker_intent: intent,
    llm_response: llmResponse,
    confidence,
    recommended_actions: recommendations,
    actual_loss_inr: actualLoss,
    prevented_exposure_inr: preventedExposure
  } = sessionState;

  const formatINR = (value) => {
    if (!value) return '₹0';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between h-full transition-all duration-500 ${isLoading || isUpdating ? 'animate-pulse' : ''}`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            Layer 2: Defender Telemetry
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800 font-mono font-semibold">
              CANARY ACTIVE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-xl text-center">
            <div className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Actual Loss</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{formatINR(actualLoss)}</div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Asset isolated</div>
          </div>
          <div className="p-3 bg-cyan-950/30 border border-cyan-900/60 rounded-xl text-center">
            <div className="text-[11px] text-cyan-400 uppercase tracking-wider font-semibold">Prevented</div>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-1">{formatINR(preventedExposure)}</div>
            <div className="text-[10px] text-cyan-500/80 mt-0.5">Exposure contained</div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-300">Penetration Depth</span>
            <span className={`text-xs font-mono font-bold ${
              depth === 1 ? 'text-yellow-400' : depth === 2 ? 'text-orange-400' : 'text-rose-400'
            }`}>
              Level {depth} of 3
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-1 p-0.5">
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${depth >= 1 ? 'bg-yellow-400' : 'bg-slate-700'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${depth >= 2 ? 'bg-orange-500' : 'bg-slate-700'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${depth >= 3 ? 'bg-rose-500' : 'bg-slate-700'}`} />
          </div>
        </div>
      </div>

      <div className={`mt-2 p-4 rounded-xl border transition-all duration-500 ${
        llmResponse
          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
          : 'bg-slate-950 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            ✨ Gemini 2.5 Deception Engine
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
            llmResponse ? 'bg-indigo-900 text-indigo-300' : 'bg-slate-800 text-slate-500'
          }`}>
            {llmResponse ? 'ACTIVE INTERVENTION' : 'MONITORING'}
          </span>
        </div>
        
          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Attacker Intent:</span>
            <span className="text-slate-300 font-mono font-semibold">{intent} ({Math.round(confidence * 100)}%)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">LLM Response:</span>
            {isLoading ? (
              <span className="text-slate-600 font-mono italic">Awaiting prompt...</span>
            ) : llmResponse ? (
              <pre className="text-emerald-400 font-mono truncate max-w-[240px] whitespace-pre-wrap">{llmResponse}</pre>
            ) : (
              <span className="text-slate-600 font-mono italic">Awaiting prompt...</span>
            )}
          </div>
          {recommendations.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-800/60 text-xs space-y-1">
              <div className="text-[11px] font-semibold text-slate-300">Recommended Actions</div>
              <ul className="list-disc ml-4 text-[12px] text-slate-400">
                {recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}