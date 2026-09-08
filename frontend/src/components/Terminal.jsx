import React, { useState, useRef, useEffect } from 'react';

export default function Terminal({ onActionExecuted }) {
  const sessionKey = 'ghost_session_id';
  let initialSessionId = localStorage.getItem(sessionKey);
  if (!initialSessionId) {
    initialSessionId = `ghost-sess-${Date.now().toString(16)}-${Math.floor(Math.random()*0xffff).toString(16)}`;
    try { localStorage.setItem(sessionKey, initialSessionId); } catch (e) {}
  }

  const [history, setHistory] = useState([
    { type: 'system', content: `Connected to internal SMB node (Session: ${initialSessionId})` },
    { type: 'system', content: 'Authentication status: GRANTED via Valid Accounts (T1078)' },
    { type: 'system', content: 'Type "ls" to view files, "cat <filename>" to inspect, or "search <query>" for data.' }
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isExecuting) return;

    setHistory((prev) => [...prev, { type: 'command', content: trimmed }]);
    setInput('');
    setIsExecuting(true);

    try {
      const host = window.location.hostname || '127.0.0.1';
      // use persistent session id (same key as AttackFeed)
      const sessionKey = 'ghost_session_id';
      let sessionId = localStorage.getItem(sessionKey);
      if (!sessionId) {
        sessionId = `ghost-sess-${Date.now().toString(16)}-${Math.floor(Math.random()*0xffff).toString(16)}`;
        try { localStorage.setItem(sessionKey, sessionId); } catch (e) {}
      }

      const res = await fetch(`http://${host}:8000/api/v1/bubble/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, command: trimmed })
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();

      setHistory((prev) => [...prev, { type: 'output', content: data.output || 'Command executed.' }]);
      if (onActionExecuted) onActionExecuted(data);
    } catch (err) {
      setHistory((prev) => [...prev, { type: 'error', content: `Error: Unable to connect to backend engine: ${err.message}` }]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm flex flex-col h-[520px] shadow-2xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="ml-2 font-semibold text-slate-300">accounts@corp-storage: ~</span>
        </div>
        <span className="text-[11px] text-slate-500">BASH / T1078 SESSION</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 text-xs leading-relaxed">
        {history.map((item, idx) => (
          <div key={idx}>
            {item.type === 'system' && <p className="text-amber-400/90 font-medium">{item.content}</p>}
            {item.type === 'command' && (
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <span>accounts@corp-storage:~$</span>
                <span className="text-white">{item.content}</span>
              </div>
            )}
            {item.type === 'output' && (
              <pre className="text-slate-300 whitespace-pre-wrap font-mono mt-0.5 bg-slate-900/40 p-2 rounded border border-slate-800/40">
                {item.content}
              </pre>
            )}
            {item.type === 'error' && <p className="text-rose-400 font-semibold">{item.content}</p>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleCommand} className="mt-3 pt-3 border-t border-slate-800 flex gap-2 items-center">
        <span className="text-cyan-400 font-bold text-xs">accounts@corp-storage:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isExecuting ? "Executing command in decoy bubble..." : "Try 'ls', 'cat employee_payroll_2026.csv', or 'search invoice'"}
          disabled={isExecuting}
          className="flex-1 bg-transparent text-slate-100 text-xs focus:outline-none placeholder-slate-600 font-mono disabled:opacity-50"
          autoFocus
        />
        <button
          type="submit"
          disabled={isExecuting}
          className="px-3 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-700/50 rounded text-xs transition-colors disabled:opacity-30"
        >
          {isExecuting ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}