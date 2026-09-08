import React, { useState, useRef, useEffect } from 'react';

export default function Terminal({ onActionExecuted }) {
  const [command, setCommand] = useState('');
  const [sessionId] = useState('ghost-sess-9912');
  const [history, setHistory] = useState([
    { text: 'Connected to internal SMB node (Session: ghost-sess-9912)', type: 'system' },
    { text: 'Authentication status: GRANTED via Valid Accounts (T1078)', type: 'system' },
    { text: 'Type "ls" to view files, "cat <filename>" to inspect, or "search <query>" for data.', type: 'info' }
  ]);
  const [loading, setLoading] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCmd = command.trim();
    if (!cleanCmd) return;

    // Add user command to history
    setHistory((prev) => [...prev, { text: `accounts@corp-storage:~$ ${cleanCmd}`, type: 'input' }]);
    setCommand('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/bubble/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, command: cleanCmd })
      });
      const data = await res.json();

      setHistory((prev) => [
        ...prev,
        { text: data.output || 'Command executed.', type: 'output' }
      ]);

      if (onActionExecuted) onActionExecuted(data);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { text: `Error: Unable to connect to backend engine: ${err.message}`, type: 'error' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Terminal Titlebar */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="text-xs font-mono text-slate-400 ml-2">GhostGrid Deception Bubble (Sandbox)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ACTIVE TRAP
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 bg-slate-950 text-slate-200">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`${
              item.type === 'input'
                ? 'text-cyan-400 font-semibold'
                : item.type === 'error'
                ? 'text-rose-400'
                : item.type === 'system'
                ? 'text-yellow-400'
                : item.type === 'info'
                ? 'text-slate-500'
                : 'text-slate-300 whitespace-pre-wrap'
            }`}
          >
            {item.text}
          </div>
        ))}
        {loading && (
          <div className="text-yellow-400 animate-pulse">
            [AI Reactive Engine: Synthesizing contextual decoy response...]
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Command Input */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 p-2 bg-slate-900 flex items-center">
        <span className="text-cyan-400 font-mono text-xs px-2 select-none">
          accounts@corp-storage:~$
        </span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Try 'ls', 'cat employee_payroll_2026.csv', or 'search wire transfer'"
          className="flex-1 bg-transparent text-slate-100 font-mono text-xs focus:outline-none placeholder-slate-600"
          autoFocus
        />
        <button
          type="submit"
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition-colors font-mono"
        >
          Send
        </button>
      </form>
    </div>
  );
}