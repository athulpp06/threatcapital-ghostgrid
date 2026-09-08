import React, { useState } from 'react';

export default function RiskGauge({ onScanComplete }) {
  const [domain, setDomain] = useState('techcorp-smb.in');
  const [loading, setLoading] = useState(false);
  const [scanData, setScanData] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!domain) return;
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const data = await res.json();
      setScanData(data);
      if (onScanComplete) onScanComplete(data);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 750) return 'text-emerald-400 border-emerald-500';
    if (score >= 650) return 'text-yellow-400 border-yellow-500';
    return 'text-rose-500 border-rose-500';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Layer 1: Cyber Credit Rating
          </h2>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            DNS / SPF / Port Audit
          </span>
        </div>

        <form onSubmit={handleScan} className="flex gap-2 mb-6">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter business domain (e.g., target.com)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-all"
          >
            {loading ? 'Auditing...' : 'Run Audit'}
          </button>
        </form>

        {scanData ? (
          <div className="space-y-6">
            {/* Score & Rating Hero */}
            <div className="flex items-center justify-around p-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                  Credit Score
                </div>
                <div className={`text-4xl font-black font-mono ${getScoreColor(scanData.score).split(' ')[0]}`}>
                  {scanData.score}
                  <span className="text-sm text-slate-500 font-normal"> / {scanData.max_score}</span>
                </div>
                <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">
                  Rating: <span className="text-cyan-400">{scanData.rating}</span>
                </div>
              </div>

              <div className="h-12 w-px bg-slate-800" />

              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                  Financial Exposure
                </div>
                <div className="text-3xl font-black font-mono text-rose-400">
                  ₹{(scanData.financial_exposure_inr / 100000).toFixed(1)}L
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Potential breach loss
                </div>
              </div>
            </div>

            {/* Check Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-medium">SPF Record</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    scanData.checks.spf.status === 'PASS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {scanData.checks.spf.status}
                  </span>
                </div>
                <p className="text-slate-400 truncate text-[11px]">{scanData.checks.spf.detail}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-medium">DMARC Policy</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    scanData.checks.dmarc.status === 'PASS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {scanData.checks.dmarc.status}
                  </span>
                </div>
                <p className="text-slate-400 truncate text-[11px]">{scanData.checks.dmarc.detail}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
            Enter a domain to initiate real-time DNS quantification.
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
        <span>Framework: NIST + FICO Risk Quant</span>
        <span className="text-slate-400">Layer 1 Active</span>
      </div>
    </div>
  );
}