import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Globe,
  Clock,
  Gauge,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { SyntheticCanary } from '../types';

interface SyntheticsAndSloProps {
  canaries: SyntheticCanary[];
}

export const SyntheticsAndSlo: React.FC<SyntheticsAndSloProps> = ({ canaries }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm mb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">
              CloudWatch Synthetics & SLA / Error Budget Burn
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Proactive API endpoint heartbeat canaries, 28-day rolling SLO adherence, and Error Budget burn rate
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
            Global Target: 99.90% SLO
          </span>
        </div>
      </div>

      {/* SLA / SLO Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Production SLA (30d)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">99.92%</span>
            <span className="text-xs text-emerald-400 font-medium">PASSING</span>
          </div>
          <p className="text-xs text-slate-400">Total allowed downtime: 43m 12s / mo</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Error Budget Remaining</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 font-mono">82.4%</span>
            <span className="text-xs text-rose-400 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> -4.8%/hr
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '82.4%' }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Burn Rate Alerting</span>
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono">4.8x</span>
            <span className="text-xs text-rose-300 font-semibold bg-rose-500/20 px-1.5 py-0.5 rounded">
              Elevated Burn
            </span>
          </div>
          <p className="text-xs text-slate-400">1-hour window threshold: &gt; 2.0x</p>
        </div>
      </div>

      {/* Synthetic Canaries List */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Active Synthetic Canaries
        </span>

        {canaries.map(canary => (
          <div
            key={canary.id}
            className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">{canary.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  canary.status === 'PASSED'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                }`}>
                  {canary.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{canary.url}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span>Frequency: <strong className="text-slate-200">{canary.frequency}</strong></span>
                <span>Avg Latency: <strong className="text-cyan-300 font-mono">{canary.latencyAvg}ms</strong></span>
                <span>Region: <strong className="text-slate-200 font-mono">{canary.region}</strong></span>
                <span>Last run: <strong className="text-slate-300">{canary.lastRun}</strong></span>
              </div>
            </div>

            {/* Right: SLO Actual vs Target */}
            <div className="flex items-center gap-4 shrink-0 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Target</span>
                <span className="text-xs font-bold text-slate-300 font-mono">{canary.sloTarget}%</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">24h Uptime</span>
                <span className={`text-base font-extrabold font-mono ${
                  canary.uptime24h >= canary.sloTarget ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {canary.uptime24h}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
