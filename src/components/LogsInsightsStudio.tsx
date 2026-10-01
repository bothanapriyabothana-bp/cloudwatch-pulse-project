import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Play,
  Copy,
  Check,
  Search,
  Filter,
  Terminal,
  Database,
  BarChart3,
  ListFilter,
  Eye,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  RefreshCw
} from 'lucide-react';
import { LogRecord, PresetQuery } from '../types';
import { PRESET_QUERIES } from '../data/mockTelemetry';

interface LogsInsightsStudioProps {
  logs: LogRecord[];
  onAddLog?: (log: LogRecord) => void;
}

export const LogsInsightsStudio: React.FC<LogsInsightsStudioProps> = ({ logs }) => {
  const [naturalPrompt, setNaturalPrompt] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [currentQuery, setCurrentQuery] = useState<string>(PRESET_QUERIES[0].query);
  const [queryExplanation, setQueryExplanation] = useState<string>(PRESET_QUERIES[0].description);
  const [selectedLogGroup, setSelectedLogGroup] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'records' | 'live-tail' | 'presets'>('records');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);
  const [isQueryRunning, setIsQueryRunning] = useState<boolean>(false);

  const logGroups = [
    'ALL',
    '/aws/lambda/order-processing-fn',
    '/aws/rds/aurora-pg-primary/postgresql',
    '/aws/apigateway/api-gateway-v2-main',
    '/aws/sqs/payment-events-queue',
    '/aws/ecs/checkout-service-cluster'
  ];

  // Filter logs for query / live tail
  const filteredLogs = logs.filter(log => {
    if (selectedLogGroup !== 'ALL' && log.logGroup !== selectedLogGroup) return false;
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
    if (searchFilter && !log.message.toLowerCase().includes(searchFilter.toLowerCase()) && !log.logGroup.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleGenerateAIQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalPrompt.trim()) return;

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: naturalPrompt,
          logType: selectedLogGroup !== 'ALL' ? selectedLogGroup : 'AWS CloudWatch Lambda & RDS Logs'
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCurrentQuery(json.data.query);
        setQueryExplanation(json.data.explanation || 'AI generated CloudWatch Insights query');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleRunQuery = () => {
    setIsQueryRunning(true);
    setTimeout(() => {
      setIsQueryRunning(false);
    }, 400);
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(currentQuery);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'FATAL':
        return <span className="px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 text-[10px] font-extrabold font-mono">FATAL</span>;
      case 'ERROR':
        return <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold font-mono">ERROR</span>;
      case 'WARN':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono">WARN</span>;
      case 'INFO':
        return <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold font-mono">INFO</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-mono">DEBUG</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm mb-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">
              CloudWatch Logs Insights & AI Query Studio
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Gemini NL-to-Query
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Query petabyte-scale CloudWatch log streams with AI assistance, syntax highlighting, and live tailing
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'records' ? 'bg-slate-700 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Query Editor
          </button>
          <button
            onClick={() => setActiveTab('live-tail')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'live-tail' ? 'bg-slate-700 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            Live Tail
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'presets' ? 'bg-slate-700 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            Query Library
          </button>
        </div>
      </div>

      {/* AI Natural Language Query Generator Bar */}
      <form onSubmit={handleGenerateAIQuery} className="mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-700/80 focus-within:border-amber-500/80 transition-all shadow-inner">
          <div className="flex items-center gap-2 px-2 flex-1">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              placeholder="Ask in plain English, e.g., 'Find all connection timeout exceptions in Aurora RDS over the last 15 minutes'..."
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              className="bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
          <button
            type="submit"
            disabled={isGeneratingAI || !naturalPrompt.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0"
          >
            {isGeneratingAI ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Generate Query
              </>
            )}
          </button>
        </div>
      </form>

      {/* Query Editor & Controls (when in records mode) */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Editor Box */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-850 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">CloudWatch Logs Insights Query</span>
                <span className="text-slate-600">|</span>
                <select
                  aria-label="Target log group"
                  value={selectedLogGroup}
                  onChange={(e) => setSelectedLogGroup(e.target.value)}
                  className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 focus:outline-none cursor-pointer"
                >
                  {logGroups.map(lg => (
                    <option key={lg} value={lg}>{lg}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyQuery}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Copy Query"
                >
                  {copiedQuery ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <textarea
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              rows={4}
              className="w-full bg-transparent font-mono text-xs text-emerald-300 focus:outline-none resize-y leading-relaxed"
              spellCheck={false}
            />

            {queryExplanation && (
              <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{queryExplanation}</span>
              </div>
            )}
          </div>

          {/* Execution Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunQuery}
                disabled={isQueryRunning}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
              >
                {isQueryRunning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Run Query
              </button>

              <span className="text-xs text-slate-400 font-mono">
                Scanned {filteredLogs.length * 14} KB • {filteredLogs.length} matching events
              </span>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
                {['ALL', 'ERROR', 'WARN', 'INFO'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      severityFilter === sev ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Query Presets Library */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {PRESET_QUERIES.map(preset => (
            <div
              key={preset.id}
              onClick={() => {
                setCurrentQuery(preset.query);
                setQueryExplanation(preset.description);
                setActiveTab('records');
              }}
              className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {preset.title}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                    {preset.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{preset.description}</p>
                <div className="p-2 rounded bg-slate-950 border border-slate-850 font-mono text-[10px] text-emerald-300 line-clamp-3">
                  {preset.query}
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  Load Query <Play className="w-3 h-3 fill-current" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Events Table / Stream */}
      <div className="mt-5 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search event messages or Request IDs..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none w-48 sm:w-64"
            />
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            {filteredLogs.length} events logged
          </span>
        </div>

        <div className="divide-y divide-slate-850 max-h-96 overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching log records found.
            </div>
          ) : (
            filteredLogs.map(log => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className={`p-3 transition-colors cursor-pointer hover:bg-slate-900/80 ${
                    log.severity === 'FATAL' || log.severity === 'ERROR'
                      ? 'bg-rose-950/10'
                      : log.severity === 'WARN'
                      ? 'bg-amber-950/10'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button className="text-slate-500 mt-0.5">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    {getSeverityBadge(log.severity)}
                    <span className="text-slate-400 text-[11px] shrink-0">{log.timestamp.slice(11, 23)}</span>
                    <span className="text-cyan-400 text-[11px] shrink-0 max-w-[140px] truncate">{log.service}</span>
                    <p className={`flex-1 break-all text-xs ${
                      log.severity === 'ERROR' || log.severity === 'FATAL'
                        ? 'text-rose-200 font-medium'
                        : log.severity === 'WARN'
                        ? 'text-amber-200'
                        : 'text-slate-300'
                    }`}>
                      {log.message}
                    </p>
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && (
                    <div className="mt-3 ml-6 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                        <p>Log Group: <span className="text-slate-200">{log.logGroup}</span></p>
                        <p>Log Stream: <span className="text-slate-200">{log.logStream}</span></p>
                        {log.requestId && <p>RequestId: <span className="text-amber-300">{log.requestId}</span></p>}
                        {log.traceId && <p>TraceId: <span className="text-purple-300">{log.traceId}</span></p>}
                      </div>
                      {log.jsonPayload && (
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-slate-500 uppercase text-[10px] block mb-1">Parsed JSON Payload:</span>
                          <pre className="p-2 rounded bg-slate-950 text-emerald-300 overflow-x-auto text-[11px]">
                            {JSON.stringify(log.jsonPayload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
