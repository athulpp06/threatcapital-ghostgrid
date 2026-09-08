import { useEffect, useState } from 'react';
import RiskGauge from './components/RiskGauge';
import Terminal from './components/Terminal';
import AttackFeed from './components/AttackFeed';

export default function App() {
  const [sessionState, setSessionState] = useState({
    penetration_level: 1,
    attacker_intent: 'Initial Infiltration (T1078)',
    llm_response: '',
    confidence: 0,
    recommended_actions: [],
    actual_loss_inr: 0,
    prevented_exposure_inr: 0,
    command_history: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCommandResult = (result, command) => {
    setSessionState((previous) => ({
      ...previous,
      penetration_level: result.penetration_level ?? result.penetration_depth ?? previous.penetration_level,
      attacker_intent: result.attacker_intent ?? result.intent_classification ?? previous.attacker_intent,
      llm_response: result.llm_response ?? (result.generated_filename ? result.output : ''),
      confidence: result.confidence ?? result.intent_confidence ?? previous.confidence,
      recommended_actions: result.recommended_actions ?? [],
      actual_loss_inr: result.actual_loss_inr ?? previous.actual_loss_inr,
      prevented_exposure_inr: result.prevented_exposure_inr ?? previous.prevented_exposure_inr,
      command_history: [...previous.command_history, { command, result }]
    }));
    setIsLoading(false);
  };

  const queryParams = new URLSearchParams(window.location.search);
  const isHackerMode = queryParams.get('mode') === 'hacker';
  // Ensure a single persistent session id is created once for the app so all components share it
  const [sessionId] = useState(() => {
    const sessionKey = 'ghost_session_id';
    let id = localStorage.getItem(sessionKey);
    if (!id) {
      id = `ghost-sess-${Date.now().toString(16)}-${Math.floor(Math.random()*0xffff).toString(16)}`;
      try { localStorage.setItem(sessionKey, id); } catch { /* Storage may be unavailable. */ }
    }
    return id;
  });

  useEffect(() => {
    if (isHackerMode) return undefined;

    let isCancelled = false;

    const syncLatestSession = async () => {
      try {
        const host = window.location.hostname || '127.0.0.1';
        const sessionsResponse = await fetch(`http://${host}:8000/api/v1/bubble/sessions`, {
          cache: 'no-store'
        });
        if (!sessionsResponse.ok) return;

        const { sessions = [] } = await sessionsResponse.json();
        const latestSession = [...sessions].sort(
          (left, right) => (right.last_activity || 0) - (left.last_activity || 0)
        )[0];
        if (!latestSession?.session_id || isCancelled) return;

        const telemetryResponse = await fetch(`http://${host}:8000/api/v1/bubble/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
          cache: 'no-store',
          body: JSON.stringify({ session_id: latestSession.session_id, command: '' })
        });
        if (!telemetryResponse.ok || isCancelled) return;

        const telemetry = await telemetryResponse.json();
        handleCommandResult(telemetry, '[remote session update]');
      } catch {
        // The defender console retries on the next refresh interval.
      }
    };

    syncLatestSession();
    const intervalId = setInterval(syncLatestSession, 1000);
    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [isHackerMode]);

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
            <Terminal
              onCommandStart={() => setIsLoading(true)}
              onCommandResult={handleCommandResult}
            />
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
        <AttackFeed sessionState={sessionState} isLoading={isLoading} />
      </main>

      <footer className="border-t border-slate-800/80 px-6 py-3 bg-slate-950 text-[11px] text-slate-500 flex justify-between items-center font-mono">
        <div>Node Architecture: Dual-Console Multi-Machine Live Demo</div>
        <div className="text-slate-400">Hackathon Edition</div>
      </footer>
    </div>
  );
}