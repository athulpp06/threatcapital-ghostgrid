import React, { useState, useEffect } from 'react';

export default function AttackFeed({ latestAction }) {
  const [telemetry, setTelemetry] = useState(latestAction || null);
  const [isResetting, setIsResetting] = useState(false);
  // persistent session id per browser (survives refresh) — keep in state so we can switch to external sessions
  const sessionKey = 'ghost_session_id';
  const [sessionId, setSessionId] = useState(() => {
    let id = localStorage.getItem(sessionKey);
    if (!id) {
      id = `ghost-sess-${Date.now().toString(16)}-${Math.floor(Math.random()*0xffff).toString(16)}`;
      try { localStorage.setItem(sessionKey, id); } catch (e) {}
    }
    return id;
  });

  useEffect(() => {
    const fetchLatestTelemetry = async () => {
      try {
        const host = window.location.hostname || '127.0.0.1';
        const res = await fetch(`http://${host}:8000/api/v1/bubble/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
          cache: 'no-store',
          body: JSON.stringify({ session_id: sessionId, command: '' })
        });
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch (err) {
        // ignore transient errors
      }
    };

    // fetch once immediately so the UI reflects current telemetry on refresh
    fetchLatestTelemetry();

    const interval = setInterval(fetchLatestTelemetry, 1500);
    return () => clearInterval(interval);
  }, [sessionId]);

  // discover active sessions across the backend periodically and auto-follow the most-recently-active one
  useEffect(() => {
    const discover = async () => {
      try {
        const host = window.location.hostname || '127.0.0.1';
        const res = await fetch(`http://${host}:8000/api/v1/bubble/sessions`);
        if (!res.ok) return;
        const json = await res.json();
        const sessions = json.sessions || [];
        if (!sessions.length) return;
        // pick the session with the latest last_activity
        sessions.sort((a,b) => (b.last_activity||0) - (a.last_activity||0));
        const top = sessions[0];
        if (top && top.session_id && top.session_id !== sessionId) {
          // if current telemetry is empty or older, switch to the active session
          const currPrevented = telemetry?.prevented_exposure_inr || 0;
          if ((top.prevented_exposure_inr || 0) > currPrevented) {
            try { localStorage.setItem(sessionKey, top.session_id); } catch (e) {}
            setSessionId(top.session_id);
          }
        }
      } catch (e) {
        // ignore discovery errors
      }
    };

    // run discovery regularly to pick up sessions created elsewhere
    discover();
    const interval = setInterval(discover, 2000);
    return () => clearInterval(interval);
  }, [telemetry, sessionId]);

  useEffect(() => {
    if (latestAction) setTelemetry(latestAction);
  }, [latestAction]);

  const resetSession = async () => {
    try {
      setIsResetting(true);
      const host = window.location.hostname || '127.0.0.1';
      const res = await fetch(`http://${host}:8000/api/v1/bubble/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        cache: 'no-store',
        body: JSON.stringify({ session_id: sessionId, command: 'reset' })
      });
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      // ignore
    } finally {
      setIsResetting(false);
    }
  };

  const depth = telemetry?.penetration_depth || 1;
  const intent = telemetry?.intent_classification || 'Initial Infiltration (T1078)';
  const generatedFile = telemetry?.generated_filename;
  const formatINR = (n) => {
    if (n === undefined || n === null) return '₹0';
    if (typeof n === 'number') {
      if (n === 0) return '₹0';
      const lakhs = n / 100000.0;
      return `₹${lakhs.toFixed(2)}L`;
    }
    // if already a string, return as-is
    return String(n);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between h-full">
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
            <button
              onClick={resetSession}
              disabled={isResetting}
              className="text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono font-semibold disabled:opacity-50"
            >
              {isResetting ? 'Resetting…' : 'Hard Reset'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-xl text-center">
            <div className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Actual Loss</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{formatINR(telemetry?.actual_loss_inr ?? 0)}</div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Asset isolated</div>
          </div>
          <div className="p-3 bg-cyan-950/30 border border-cyan-900/60 rounded-xl text-center">
            <div className="text-[11px] text-cyan-400 uppercase tracking-wider font-semibold">Prevented</div>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-1">{formatINR(telemetry?.prevented_exposure_inr ?? 0)}</div>
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
        generatedFile 
          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
          : 'bg-slate-950 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            ✨ Gemini 2.5 Deception Engine
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
            generatedFile ? 'bg-indigo-900 text-indigo-300' : 'bg-slate-800 text-slate-500'
          }`}>
            {generatedFile ? 'ACTIVE INTERVENTION' : 'MONITORING'}
          </span>
        </div>
        
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Attacker Intent:</span>
            <span className="text-slate-300 font-mono font-semibold">{intent}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">LLM Response:</span>
            {generatedFile ? (
              <span className="text-emerald-400 font-mono truncate max-w-[200px]">
                {generatedFile}
              </span>
            ) : (
              <span className="text-slate-600 font-mono italic">Awaiting prompt...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}