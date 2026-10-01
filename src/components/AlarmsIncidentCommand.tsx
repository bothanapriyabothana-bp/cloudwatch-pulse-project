import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  GitMerge,
  Bell,
  Clock,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { CloudWatchAlarm, AlarmState, AlarmSeverity } from '../types';

interface AlarmsIncidentCommandProps {
  alarms: CloudWatchAlarm[];
  onTriggerRca: (alarm: CloudWatchAlarm) => void;
  onMuteAlarm?: (alarmId: string) => void;
}

export const AlarmsIncidentCommand: React.FC<AlarmsIncidentCommandProps> = ({
  alarms,
  onTriggerRca
}) => {
  const [stateFilter, setStateFilter] = useState<AlarmState | 'ALL'>('ALARM');
  const [severityFilter, setSeverityFilter] = useState<AlarmSeverity | 'ALL'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAlarms = alarms.filter(alarm => {
    if (stateFilter !== 'ALL' && alarm.state !== stateFilter) return false;
    if (severityFilter !== 'ALL' && alarm.severity !== severityFilter) return false;
    return true;
  });

  const activeAlarmsCount = alarms.filter(a => a.state === 'ALARM').length;
  const criticalCount = alarms.filter(a => a.state === 'ALARM' && a.severity === 'CRITICAL').length;

  const handleCopyArn = (alarm: CloudWatchAlarm) => {
    navigator.clipboard.writeText(`arn:aws:cloudwatch:us-east-1:882459814129:alarm:${alarm.name}`);
    setCopiedId(alarm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (sev: AlarmSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-700 text-slate-300">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm mb-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">
              CloudWatch Alarm & Composite Incident Command
            </h2>
            {activeAlarmsCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {activeAlarmsCount} Triggered
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Triaging composite rules, anomaly detection breaches, and automated SRE playbooks
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* State Filter */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setStateFilter('ALARM')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                stateFilter === 'ALARM'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              In Alarm ({activeAlarmsCount})
            </button>
            <button
              onClick={() => setStateFilter('OK')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                stateFilter === 'OK' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              OK
            </button>
            <button
              onClick={() => setStateFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                stateFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              All States
            </button>
          </div>

          {/* Severity Filter */}
          <select
            aria-label="Filter alarms by severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500/80 cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>
      </div>

      {/* Alarms Cards List */}
      <div className="space-y-3">
        {filteredAlarms.length === 0 ? (
          <div className="text-center py-12 bg-slate-850/50 rounded-xl border border-dashed border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-200">No alarms match the current filter</p>
            <p className="text-xs text-slate-400 mt-1">All monitored metrics and composite rules are within safe thresholds.</p>
          </div>
        ) : (
          filteredAlarms.map((alarm) => {
            const isCritical = alarm.severity === 'CRITICAL';
            return (
              <div
                key={alarm.id}
                className={`bg-slate-850/90 border rounded-xl p-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  alarm.state === 'ALARM'
                    ? isCritical
                      ? 'border-rose-500/50 shadow-md shadow-rose-500/5 ring-1 ring-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-850 to-slate-850'
                      : 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-850 to-slate-850'
                    : 'border-slate-800'
                }`}
              >
                {/* Left: Info & Composite Rule */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {alarm.isComposite ? (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <GitMerge className="w-3 h-3 text-purple-400" />
                        COMPOSITE ALARM
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {alarm.namespace}
                      </span>
                    )}
                    {getSeverityBadge(alarm.severity)}
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      In state for {alarm.durationInState}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {alarm.name}
                      <button
                        onClick={() => handleCopyArn(alarm)}
                        title="Copy Alarm ARN"
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                      >
                        {copiedId === alarm.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">{alarm.description}</p>
                  </div>

                  {/* Composite Rule Expression or Threshold */}
                  {alarm.isComposite && alarm.compositeRule ? (
                    <div className="p-2 rounded bg-purple-950/30 border border-purple-500/30 text-[11px] font-mono text-purple-200 flex items-start gap-2">
                      <GitMerge className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{alarm.compositeRule}</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Threshold: <strong className="text-amber-300 font-mono">{alarm.threshold}</strong></span>
                      <span>Current: <strong className="text-rose-400 font-mono">{alarm.currentValue} {alarm.unit}</strong></span>
                      <span>Datapoints: <strong className="text-slate-300 font-mono">{alarm.datapointsToAlarm}</strong></span>
                    </div>
                  )}

                  {/* SNS Topic */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Bell className="w-3 h-3 text-amber-400" />
                    <span className="truncate max-w-sm sm:max-w-md">{alarm.snsTopic}</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-row lg:flex-col items-end justify-between gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                  {/* AI Root Cause Analysis Action */}
                  <button
                    id={`rca-btn-${alarm.id}`}
                    onClick={() => onTriggerRca(alarm)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 transition-all hover:scale-105"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" />
                    Gemini AI Root Cause Analysis
                  </button>
                  <span className="text-[10px] text-slate-500 hidden sm:block">
                    Correlates logs, traces & metrics
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
