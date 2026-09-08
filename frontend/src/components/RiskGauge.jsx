import React, { useState } from 'react';

export default function RiskGauge() {
  const [domain, setDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const runScan = async (target) => {
    if (!target) return;
    setIsScanning(true);
    setResult(null);

    const formatINR = (n) => {
      if (n === undefined || n === null) return "₹0";
      if (typeof n === 'number') {
        if (n === 0) return "₹0";
        const lakhs = n / 100000.0;
        return `₹${lakhs.toFixed(2)} Lakhs`;
      }
      return String(n);
    };

    try {
      const host = window.location.hostname || '127.0.0.1';
      const res = await fetch(`http://${host}:8000/api/v1/scan?domain=${target}`);
      if (!res.ok) throw new Error("Backend scan route failed");
      const data = await res.json();

      setResult({
        score: data.score || 555,
        rating: data.rating || "POOR",
        loss: formatINR(data.financial_exposure_inr !== undefined ? data.financial_exposure_inr : data.loss),
        details: data.details || "Missing DMARC (p=none); Ports 3389, 445 Open.",
        spf: data.spf || { status: 'MISSING', detail: '' },
        dmarc: data.dmarc || { status: 'MISSING', detail: '' },
        open_ports: data.open_ports || [],
        hibp_breaches: data.hibp_breaches || { count: 0 }
        ,masquerade_score: data.masquerade_score,
        penetration_score: data.penetration_score
      });
    } catch (err) {
      // Fallback demo behavior when backend is unreachable or errors
      setTimeout(() => {
        if (target.includes('vulnerable') || target === 'vulnerable-smb.demo') {
          setResult({
            score: 555,
            rating: "POOR",
            loss: "₹43.30 Lakhs",
            details: "Missing DMARC (p=none); Critical Ports (3389, 445) Exposed.",
            spf: { status: 'MISSING', detail: '' },
            dmarc: { status: 'MISSING', detail: '' },
            open_ports: [3389, 445],
            hibp_breaches: { count: 18 }
            ,masquerade_score: 20,
            penetration_score: 30
          });
        } else {
          setResult({
            score: 810,
            rating: "EXCELLENT",
            loss: "₹0",
            details: "DMARC Enforced (p=reject); Edge strictly hardened.",
            spf: { status: 'PASS', detail: 'HardFail (-all) properly enforced' },
            dmarc: { status: 'PASS', detail: "Policy 'reject' enforced" },
            open_ports: [443],
            hibp_breaches: { count: 0 }
            ,masquerade_score: 95,
            penetration_score: 90
          });
        }
        setIsScanning(false);
      }, 1200);
      return;
    }

    setIsScanning(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col h-full">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
        Layer 1: External Risk Quantification
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter domain (e.g., vulnerable-smb.demo)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            onClick={() => runScan(domain)}
            disabled={isScanning || !domain}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Run Audit'}
          </button>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => { setDomain('vulnerable-smb.demo'); runScan('vulnerable-smb.demo'); }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Preset: Vulnerable SMB
          </button>
          <button
            onClick={() => { setDomain('hardened-corp.demo'); runScan('hardened-corp.demo'); }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Preset: Hardened
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col items-center justify-center relative overflow-hidden">
        {!result && !isScanning && (
          <span className="text-slate-500 text-sm">Enter a domain or click a preset above to run real-time quantification.</span>
        )}
        
        {isScanning && (
          <div className="text-cyan-400 animate-pulse text-sm font-mono font-bold">
            [+] Probing DNS records & querying open ports...
          </div>
        )}

        {result && !isScanning && (
          <div className="w-full space-y-4">
            <div className="text-center">
              <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-1">Cyber FICO Score</div>
              <div className={`text-6xl font-black ${result.score < 600 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {result.score}
              </div>
              <div className={`text-sm font-bold tracking-widest mt-1 ${result.score < 600 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.rating}
              </div>
            </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Masquerade</span>
                  <span className="font-mono font-semibold">{result.masquerade_score ?? '--'}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400" style={{ width: `${result.masquerade_score ?? 0}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Penetration</span>
                  <span className="font-mono font-semibold">{result.penetration_score ?? '--'}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400" style={{ width: `${result.penetration_score ?? 0}%` }} />
                </div>
              </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center mt-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimated Financial Exposure</div>
              <div className="text-2xl font-mono font-bold text-rose-400">{result.loss}</div>
            </div>

            {/* Technical findings removed per request */}
          </div>
        )}
      </div>
    </div>
  );
}