import React from 'react';
import {
  Activity,
  AlertOctagon,
  TrendingUp,
  Zap,
  Gauge,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ServiceHealth, CloudWatchAlarm } from '../types';

interface PulseHeroMetricsProps {
  services: ServiceHealth[];
  alarms: CloudWatchAlarm[];
  onFilterAlarms: () => void;
  onFilterAnomalies: () => void;
}

export const PulseHeroMetrics: React.FC<PulseHeroMetricsProps> = ({
  services,
  alarms,
  onFilterAlarms,
  onFilterAnomalies
}) => {
  const activeAlarms = alarms.filter(a => a.state === 'ALARM');
  const criticalAlarms = activeAlarms.filter(a => a.severity === 'CRITICAL');
  const anomaliesCount = services.filter(s => s.anomalyDetected).length;

  // Calculate composite health score
  const totalServices = services.length || 1;
  const healthyCount = services.filter(s => s.status === 'HEALTHY').length;
  const degradedCount = services.filter(s => s.status === 'DEGRADED').length;
  const criticalCount = services.filter(s => s.status === 'CRITICAL').length;
  
  const healthScore = Math.max(0, Math.round(((healthyCount * 100) + (degradedCount * 50) + (criticalCount * 10)) / totalServices));
  
  // Total throughput
  const totalThroughput = services.reduce((acc, s) => acc + s.throughput, 0);
  
  // Max P99 latency
  const maxP99 = Math.max(...services.map(s => s.latencyP99), 0);
  
  // Average error rate
  const avgErrorRate = (services.reduce((acc, s) => acc + s.errorRate, 0) / totalServices).toFixed(2);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* 1. Global Health Pulse Score */}
      <div className="col-span-2 md:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health Pulse</span>
          <Activity className={`w-4 h-4 ${healthScore > 90 ? 'text-emerald-400' : healthScore > 70 ? 'text-amber-400' : 'text-rose-400'}`} />
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">{healthScore}%</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            healthScore > 90
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : healthScore > 70
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
          }`}>
            {healthScore > 90 ? 'Nominal' : healthScore > 70 ? 'Degraded' : 'Critical Incident'}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              healthScore > 90 ? 'bg-emerald-500' : healthScore > 70 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>

      {/* 2. Active CloudWatch Alarms */}
      <div
        onClick={onFilterAlarms}
        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Alarms</span>
          <AlertOctagon className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">{activeAlarms.length}</span>
          {criticalAlarms.length > 0 && (
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              {criticalAlarms.length} Crit
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          {activeAlarms.length === 0 ? (
            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> All OK</span>
          ) : (
            <span className="text-rose-300 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Requires Triage</span>
          )}
        </p>
      </div>

      {/* 3. ML Anomaly Radar */}
      <div
        onClick={onFilterAnomalies}
        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anomaly Radar</span>
          <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">{anomaliesCount}</span>
          <span className="text-xs text-slate-400">services</span>
        </div>
        <p className="text-xs text-amber-300 font-medium">3-Sigma ML Band Breaches</p>
      </div>

      {/* 4. Global Ingestion Rate */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingestion Rate</span>
          <TrendingUp className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="my-2 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {(totalThroughput / 1000).toFixed(1)}k
          </span>
          <span className="text-xs text-slate-400 font-mono">ops/s</span>
        </div>
        <p className="text-xs text-slate-400">Real-time CloudWatch metrics</p>
      </div>

      {/* 5. Peak P99 Latency */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peak P99 Latency</span>
          <Gauge className="w-4 h-4 text-orange-400" />
        </div>
        <div className="my-2 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{maxP99}</span>
          <span className="text-xs text-slate-400 font-mono">ms</span>
        </div>
        <p className="text-xs text-orange-300 font-medium truncate">Aurora PG & Lambda lag</p>
      </div>

      {/* 6. Global Error Rate */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Error Rate</span>
          <AlertCircle className={`w-4 h-4 ${Number(avgErrorRate) > 1.0 ? 'text-rose-400' : 'text-emerald-400'}`} />
        </div>
        <div className="my-2 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{avgErrorRate}%</span>
          <span className="text-xs text-slate-400">avg</span>
        </div>
        <p className="text-xs text-slate-400">SLO target: &lt; 0.10%</p>
      </div>

    </div>
  );
};
