import React from 'react';
import {
  Activity,
  AlertTriangle,
  Flame,
  PlusCircle,
  Play,
  Pause,
  Server,
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { AwsRegion, AwsAccount } from '../types';
import { ACCOUNTS } from '../data/mockTelemetry';

interface NavbarProps {
  selectedRegion: AwsRegion;
  onRegionChange: (region: AwsRegion) => void;
  selectedAccount: AwsAccount;
  onAccountChange: (account: AwsAccount) => void;
  liveStreaming: boolean;
  onToggleLiveStreaming: () => void;
  refreshIntervalMs: number;
  onChangeRefreshInterval: (interval: number) => void;
  onOpenChaosModal: () => void;
  onOpenAlarmBuilder: () => void;
  activeAlarmsCount: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedRegion,
  onRegionChange,
  selectedAccount,
  onAccountChange,
  liveStreaming,
  onToggleLiveStreaming,
  refreshIntervalMs,
  onChangeRefreshInterval,
  onOpenChaosModal,
  onOpenAlarmBuilder,
  activeAlarmsCount,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner & Global Selectors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 shadow-lg shadow-orange-500/20 text-white font-bold">
              <Activity className="w-5 h-5 animate-pulse" />
              {liveStreaming && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  CloudWatch <span className="text-amber-400 font-extrabold">Pulse</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AWS Telemetry Radar & Incident Command</p>
            </div>
          </div>

          {/* Account & Region Selector */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Account Selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300">
              <Server className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <select
                aria-label="AWS Account Selector"
                value={selectedAccount.id}
                onChange={(e) => {
                  const acc = ACCOUNTS.find(a => a.id === e.target.value);
                  if (acc) onAccountChange(acc);
                }}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 font-medium"
              >
                {ACCOUNTS.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-800 text-slate-200">
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span>
              <select
                aria-label="AWS Region Selector"
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value as AwsRegion)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 font-mono"
              >
                <option value="us-east-1" className="bg-slate-800">us-east-1 (N. Virginia)</option>
                <option value="us-west-2" className="bg-slate-800">us-west-2 (Oregon)</option>
                <option value="eu-west-1" className="bg-slate-800">eu-west-1 (Ireland)</option>
                <option value="ap-northeast-1" className="bg-slate-800">ap-northeast-1 (Tokyo)</option>
                <option value="sa-east-1" className="bg-slate-800">sa-east-1 (São Paulo)</option>
              </select>
            </div>
          </div>

          {/* Action Tools & Streaming Controls */}
          <div className="flex items-center gap-2">
            {/* Live Play/Pause & Speed */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-xs">
              <button
                id="toggle-live-stream-btn"
                onClick={onToggleLiveStreaming}
                title={liveStreaming ? 'Pause Live Telemetry Stream' : 'Resume Live Telemetry Stream'}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${
                  liveStreaming
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {liveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="font-semibold">{liveStreaming ? 'Live' : 'Paused'}</span>
              </button>

              <select
                aria-label="Stream interval selector"
                value={refreshIntervalMs}
                onChange={(e) => onChangeRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-slate-300 text-xs px-1.5 focus:outline-none cursor-pointer font-mono"
              >
                <option value={1000} className="bg-slate-800">1s</option>
                <option value={3000} className="bg-slate-800">3s</option>
                <option value={5000} className="bg-slate-800">5s</option>
                <option value={10000} className="bg-slate-800">10s</option>
              </select>
            </div>

            {/* Chaos Simulator Button */}
            <button
              id="chaos-injector-btn"
              onClick={onOpenChaosModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all hover:border-rose-500/50"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span className="hidden sm:inline">Chaos Injector</span>
            </button>

            {/* New Alarm Builder */}
            <button
              id="create-alarm-btn"
              onClick={onOpenAlarmBuilder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create Alarm</span>
            </button>
          </div>

        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-1.5 pb-2 overflow-x-auto no-scrollbar text-xs sm:text-sm">
          <button
            id="tab-pulse-overview"
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Health Pulse & Radar</span>
          </button>

          <button
            id="tab-alarms"
            onClick={() => onSelectTab('alarms')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'alarms'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Alarms & RCA</span>
            {activeAlarmsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-xs">
                {activeAlarmsCount}
              </span>
            )}
          </button>

          <button
            id="tab-logs-insights"
            onClick={() => onSelectTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Logs Insights AI Studio</span>
          </button>

          <button
            id="tab-traces-lens"
            onClick={() => onSelectTab('traces')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'traces'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>ServiceLens & Traces</span>
          </button>

          <button
            id="tab-synthetics-slo"
            onClick={() => onSelectTab('synthetics')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'synthetics'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Synthetics & SLA / SLO</span>
          </button>
        </div>
      </div>
    </header>
  );
};
