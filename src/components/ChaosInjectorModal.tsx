import React from 'react';
import {
  X,
  Flame,
  Database,
  Zap,
  Globe,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';

interface ChaosInjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectChaos: (type: 'rds-exhaustion' | 'lambda-oom' | 'dynamo-throttles' | 'cf-outage' | 'recover') => void;
}

export const ChaosInjectorModal: React.FC<ChaosInjectorModalProps> = ({
  isOpen,
  onClose,
  onInjectChaos
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'rds-exhaustion' as const,
      title: 'Aurora PG Connection Pool Starvation',
      service: 'AWS/RDS (aurora-pg-primary)',
      severity: 'CRITICAL',
      icon: <Database className="w-5 h-5 text-rose-400" />,
      description: 'Saturates active connection pool to max_connections=850, exhausts freeable memory, and cascades 504 timeouts to Lambda & API Gateway.',
      expectedAlarms: ['RDS-Aurora-DatabaseConnections-Max', 'Composite-PaymentGateway-Degradation']
    },
    {
      id: 'lambda-oom' as const,
      title: 'Lambda Order Service Memory Limit OOM',
      service: 'AWS/Lambda (order-processing-fn)',
      severity: 'HIGH',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      description: 'Injects severe heap memory leak reaching 1024MB container limit, triggering container cold restarts and 1800ms duration spikes.',
      expectedAlarms: ['Lambda-OrderProcessing-DurationP99-Anomaly']
    },
    {
      id: 'dynamo-throttles' as const,
      title: 'DynamoDB Hot Partition Throttling Surge',
      service: 'AWS/DynamoDB (user-sessions-table)',
      severity: 'HIGH',
      icon: <Database className="w-5 h-5 text-purple-400" />,
      description: 'Simulates uneven partition key access spiking ReadThrottleEvents to 450/sec with elevated P99 latency.',
      expectedAlarms: ['DynamoDB-UserSessions-ReadThrottleEvents']
    },
    {
      id: 'cf-outage' as const,
      title: 'CloudFront Origin 502 Bad Gateway Wave',
      service: 'AWS/CloudFront (global-cdn-dist-e28)',
      severity: 'HIGH',
      icon: <Globe className="w-5 h-5 text-cyan-400" />,
      description: 'Origin edge communication failure spiking global 5xx error rate from 0.08% to 6.4%.',
      expectedAlarms: ['CloudFront-Global-5XXErrorRate']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AWS Chaos & Incident Simulator</h2>
              <p className="text-xs text-slate-400">Inject real-time production failures to validate CloudWatch Radar & Gemini RCA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body List of Chaos Scenarios */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Nominal Health Baseline
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Clear all active simulated outages and return system telemetry to healthy baseline.
              </p>
            </div>
            <button
              onClick={() => {
                onInjectChaos('recover');
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow flex items-center gap-1.5 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              Restore All Systems
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Injectable Outage Scenarios
            </span>

            {scenarios.map(sc => (
              <div
                key={sc.id}
                className="p-4 rounded-xl bg-slate-850 border border-slate-800 hover:border-rose-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {sc.icon}
                    <h3 className="text-sm font-bold text-white">{sc.title}</h3>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                      {sc.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{sc.description}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-slate-500">Triggers alarms:</span>
                    {sc.expectedAlarms.map(a => (
                      <span key={a} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onInjectChaos(sc.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold shadow flex items-center justify-center gap-1.5 shrink-0 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Inject Chaos
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
