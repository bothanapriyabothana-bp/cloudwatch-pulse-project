import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldAlert,
  Terminal,
  Check,
  Copy,
  AlertTriangle,
  Clock,
  Download,
  Share2,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CloudWatchAlarm, RcaAnalysisResult } from '../types';

interface AIRcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarm: CloudWatchAlarm | null;
  rcaResult: RcaAnalysisResult | null;
  isLoading: boolean;
  onApplyMitigation?: (command: string) => void;
}

export const AIRcaModal: React.FC<AIRcaModalProps> = ({
  isOpen,
  onClose,
  alarm,
  rcaResult,
  isLoading
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  if (!isOpen || !alarm) return null;

  const handleCopyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportMarkdown = () => {
    if (!rcaResult) return;
    const md = `# AWS CloudWatch Post-Mortem Incident Report
## Incident: ${alarm.name}
- **Timestamp:** ${new Date().toISOString()}
- **Severity:** ${alarm.severity}
- **Namespace:** ${alarm.namespace}
- **Confidence Score:** ${rcaResult.confidenceScore}%

### Executive Summary
${rcaResult.summary}

### Root Cause
${rcaResult.rootCause}

### Blast Radius
${rcaResult.blastRadius}

### Cascading Timeline
${rcaResult.timeline.map(t => `- **[${t.timestamp}]** (${t.severity}) ${t.event}`).join('\n')}

### Extracted Telemetry Evidence
${rcaResult.evidence.map(e => `- \`${e}\``).join('\n')}

### Immediate Remediation Commands
\`\`\`bash
${rcaResult.immediateMitigation.cliCommands.join('\n')}
\`\`\`

### Permanent Architecture Fixes
${rcaResult.longTermFixes.map(f => `- ${f}`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-rca-${alarm.id}.md`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Gemini AI Root Cause Analysis (RCA)</h2>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {alarm.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-lg">{alarm.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rcaResult && !isLoading && (
              <button
                onClick={handleExportMarkdown}
                title="Export Incident Post-Mortem"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Export Post-Mortem</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-200">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Synthesizing CloudWatch Telemetry...</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Cross-correlating CloudWatch Log Streams, RDS metrics, X-Ray traces, and anomaly standard deviations with Gemini AI.
                </p>
              </div>
            </div>
          ) : rcaResult ? (
            <>
              {/* Executive Summary & Confidence */}
              <div className="bg-slate-850 border border-slate-750 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Executive Summary
                  </span>
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    {rcaResult.summary}
                  </p>
                </div>
                <div className="shrink-0 bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-center min-w-[120px]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">AI Confidence</span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    {rcaResult.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Primary Root Cause & Blast Radius */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Primary Root Cause
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-mono">
                    {rcaResult.rootCause}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Blast Radius & Impact
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {rcaResult.blastRadius}
                  </p>
                </div>
              </div>

              {/* Cascade Timeline */}
              {rcaResult.timeline && rcaResult.timeline.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Cascading Failure Timeline
                  </span>
                  <div className="space-y-2">
                    {rcaResult.timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] shrink-0">
                          {item.timestamp}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            item.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          <span className="text-slate-300">{item.event}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Telemetry Evidence & Log Signatures */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Correlated Log & Metric Signatures
                </span>
                <ul className="space-y-1.5">
                  {rcaResult.evidence.map((ev, idx) => (
                    <li key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-purple-300 flex items-start gap-2">
                      <span className="text-slate-500 select-none">#</span>
                      <span className="break-all">{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Immediate AWS CLI Mitigation Playbook */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Immediate AWS Remediation Runbook
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">&lt; 5 min recovery</span>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  {rcaResult.immediateMitigation.description}
                </p>

                <div className="space-y-2">
                  {rcaResult.immediateMitigation.cliCommands.map((cmd, idx) => (
                    <div key={idx} className="relative group rounded-lg bg-slate-950 border border-slate-800 p-2.5 flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre no-scrollbar">
                        {cmd}
                      </code>
                      <button
                        onClick={() => handleCopyCommand(cmd, idx)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy CLI</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Long-term prevention & Recommended CloudWatch Alarm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Architectural Prevention Fixes
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {rcaResult.longTermFixes.map((fix, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {rcaResult.recommendedAlarm && (
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Recommended CloudWatch Metric Alarm
                    </span>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                      <p><span className="text-slate-500">Name:</span> {rcaResult.recommendedAlarm.name}</p>
                      <p><span className="text-slate-500">Namespace:</span> {rcaResult.recommendedAlarm.metricNamespace}</p>
                      <p><span className="text-slate-500">Metric:</span> {rcaResult.recommendedAlarm.metricName}</p>
                      <p><span className="text-slate-500">Threshold:</span> <strong className="text-amber-300">{rcaResult.recommendedAlarm.threshold}</strong></p>
                      {rcaResult.recommendedAlarm.metricMath && (
                        <p><span className="text-slate-500">Math:</span> <span className="text-purple-300">{rcaResult.recommendedAlarm.metricMath}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-xs text-slate-400 py-8">No analysis available.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Powered by Google Gemini 3.7 Flash Cloud Telemetry Reasoning
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Investigation
          </button>
        </div>

      </div>
    </div>
  );
};
