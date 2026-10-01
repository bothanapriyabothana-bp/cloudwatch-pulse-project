import React, { useState } from 'react';
import {
  Server,
  Database,
  Cpu,
  Layers,
  Globe,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  ArrowUpRight,
  Filter,
  Search
} from 'lucide-react';
import { ServiceHealth, ServiceCategory } from '../types';

interface ServicePulseGridProps {
  services: ServiceHealth[];
  selectedServiceId: string | null;
  onSelectService: (service: ServiceHealth) => void;
  onAnalyzeWithAI: (service: ServiceHealth) => void;
}

export const ServicePulseGrid: React.FC<ServicePulseGridProps> = ({
  services,
  selectedServiceId,
  onSelectService,
  onAnalyzeWithAI
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = services.filter(service => {
    if (filterCategory !== 'all' && service.category !== filterCategory) return false;
    if (statusFilter === 'degraded' && service.status === 'HEALTHY') return false;
    if (statusFilter === 'anomalies' && !service.anomalyDetected) return false;
    if (searchQuery && !service.name.toLowerCase().includes(searchQuery.toLowerCase()) && !service.type.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'AWS/Lambda':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'AWS/RDS':
        return <Database className="w-4 h-4 text-blue-400" />;
      case 'AWS/ApiGateway':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'AWS/DynamoDB':
        return <Database className="w-4 h-4 text-indigo-400" />;
      case 'AWS/ECS':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'AWS/SQS':
        return <Layers className="w-4 h-4 text-pink-400" />;
      case 'AWS/CloudFront':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      default:
        return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Healthy
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse" />
            Degraded
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
            <AlertOctagon className="w-3 h-3 text-rose-400 animate-bounce" />
            Critical
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm mb-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            CloudWatch Service Health Pulse
          </h2>
          <p className="text-xs text-slate-400">Real-time microservices latency, error rates, and ML anomaly bands</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500/80 w-36 sm:w-44"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs text-slate-300">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterCategory === 'all' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterCategory('compute')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterCategory === 'compute' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
              }`}
            >
              Compute
            </button>
            <button
              onClick={() => setFilterCategory('database')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterCategory === 'database' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
              }`}
            >
              Database
            </button>
            <button
              onClick={() => setFilterCategory('api')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterCategory === 'api' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
              }`}
            >
              API
            </button>
          </div>

          {/* Status Quick Filter */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'degraded' ? 'all' : 'degraded')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              statusFilter === 'degraded'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3" />
            Degraded Only
          </button>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.map((service) => {
          const isSelected = selectedServiceId === service.id;
          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className={`bg-slate-850/90 border rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : service.status === 'CRITICAL'
                  ? 'border-rose-500/40 hover:border-rose-500'
                  : service.status === 'DEGRADED'
                  ? 'border-amber-500/40 hover:border-amber-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Type & Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/80">
                      {getServiceIcon(service.type)}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block leading-tight">{service.type}</span>
                      <h3 className="text-sm font-bold text-white truncate max-w-[160px]">{service.name}</h3>
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>

                {/* Anomaly Badge */}
                {service.anomalyDetected && (
                  <div className="mb-3 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium">
                      <Zap className="w-3 h-3 text-amber-400" />
                      ML Anomaly Breach
                    </span>
                    <span className="font-mono text-[10px]">&gt; 3.2σ</span>
                  </div>
                )}

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-800/80 my-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">P99 Latency</span>
                    <p className={`text-xs font-bold font-mono ${service.latencyP99 > 1000 ? 'text-rose-400' : service.latencyP99 > 300 ? 'text-amber-400' : 'text-slate-200'}`}>
                      {service.latencyP99 >= 1000 ? `${(service.latencyP99 / 1000).toFixed(2)}s` : `${service.latencyP99}ms`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Error Rate</span>
                    <p className={`text-xs font-bold font-mono ${service.errorRate > 1.0 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {service.errorRate.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Throughput</span>
                    <p className="text-xs font-bold font-mono text-slate-200">
                      {service.throughput >= 1000 ? `${(service.throughput / 1000).toFixed(1)}k/s` : `${service.throughput}/s`}
                    </p>
                  </div>
                </div>

                {/* Secondary metric (e.g. CPU, Freeable Memory, Queue Depth) */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  {service.cpuUtilization !== undefined && (
                    <span>CPU: <strong className="text-slate-200 font-mono">{service.cpuUtilization.toFixed(1)}%</strong></span>
                  )}
                  {service.memoryUtilization !== undefined && (
                    <span>Memory: <strong className="text-slate-200 font-mono">{service.memoryUtilization.toFixed(1)}%</strong></span>
                  )}
                  {service.freeableMemoryMb !== undefined && (
                    <span>Free RAM: <strong className="text-rose-300 font-mono">{service.freeableMemoryMb} MB</strong></span>
                  )}
                  {service.queueDepth !== undefined && (
                    <span>Backlog: <strong className="text-amber-300 font-mono">{service.queueDepth} msgs</strong></span>
                  )}
                  {service.throttles !== undefined && (
                    <span>Throttles: <strong className="text-rose-400 font-mono">{service.throttles}</strong></span>
                  )}
                  <span className="text-slate-500 font-mono text-[10px]">{service.region}</span>
                </div>
              </div>

              {/* Action Buttons & Sparkline preview */}
              <div className="pt-2 flex items-center justify-between gap-2">
                {/* Mini sparkline visualization */}
                <div className="flex items-end gap-0.5 h-5 flex-1 opacity-70">
                  {service.sparkline.map((val, idx) => {
                    const max = Math.max(...service.sparkline, 1);
                    const heightPercent = Math.min(100, Math.max(15, (val / max) * 100));
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t-sm transition-all ${
                          service.status === 'CRITICAL'
                            ? 'bg-rose-500'
                            : service.status === 'DEGRADED'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    );
                  })}
                </div>

                {/* AI Root Cause CTA if degraded */}
                {service.status !== 'HEALTHY' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnalyzeWithAI(service);
                    }}
                    className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    AI RCA
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(service);
                    }}
                    className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-0.5"
                  >
                    Details <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
