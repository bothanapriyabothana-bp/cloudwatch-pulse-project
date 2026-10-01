import React, { useState } from 'react';
import {
  RefreshCw,
  GitBranch,
  Clock,
  Layers,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Server,
  Database,
  Globe,
  Radio,
  Zap,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { ServiceNode, ServiceEdge, DistributedTrace } from '../types';

interface ServiceLensMapProps {
  nodes: ServiceNode[];
  edges: ServiceEdge[];
  traces: DistributedTrace[];
}

export const ServiceLensMap: React.FC<ServiceLensMapProps> = ({
  nodes,
  edges,
  traces
}) => {
  const [selectedTraceId, setSelectedTraceId] = useState<string>(traces[0]?.traceId || '');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const activeTrace = traces.find(t => t.traceId === selectedTraceId) || traces[0];

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'Lambda':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'RDS':
      case 'DynamoDB':
        return <Database className="w-3.5 h-3.5 text-blue-400" />;
      case 'API':
        return <Radio className="w-3.5 h-3.5 text-purple-400" />;
      case 'ECS':
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      case 'SQS':
        return <Layers className="w-3.5 h-3.5 text-pink-400" />;
      case 'CDN':
        return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Server className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm mb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <GitBranch className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">
              CloudWatch ServiceLens & Distributed Traces
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end request tracing (AWS X-Ray), upstream dependency topology, and latency bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Healthy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Degraded
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Fault / 5xx
          </span>
        </div>
      </div>

      {/* Service Topology Interactive Graph */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Microservices Dependency Mesh (Live Flow)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
          {/* Stage 1: Ingress Edge */}
          <div className="space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-mono">1. Edge & Clients</span>
            {nodes.filter(n => n.id === 'client' || n.id === 'cloudfront').map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  node.status === 'CRITICAL'
                    ? 'border-rose-500/60 bg-rose-950/20'
                    : node.status === 'DEGRADED'
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    {getNodeIcon(node.type)}
                    <span className="text-xs font-bold text-white">{node.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">{node.latencyP95}ms</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                  <span>{(node.requestsPerSec / 1000).toFixed(1)}k req/s</span>
                  <span>Err: {node.errorRate}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stage 2: API Gateway */}
          <div className="space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-mono">2. API Gateways</span>
            {nodes.filter(n => n.id === 'apigw').map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  node.status === 'CRITICAL'
                    ? 'border-rose-500/60 bg-rose-950/20'
                    : node.status === 'DEGRADED'
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    {getNodeIcon(node.type)}
                    <span className="text-xs font-bold text-white">{node.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400">{node.latencyP95}ms</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                  <span>{(node.requestsPerSec / 1000).toFixed(1)}k req/s</span>
                  <span className="text-rose-400 font-bold">Err: {node.errorRate}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stage 3: Compute */}
          <div className="space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-mono">3. Compute Tier</span>
            {nodes.filter(n => n.id === 'lambda-orders' || n.id === 'ecs-checkout').map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  node.status === 'CRITICAL'
                    ? 'border-rose-500/60 bg-rose-950/20'
                    : node.status === 'DEGRADED'
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    {getNodeIcon(node.type)}
                    <span className="text-xs font-bold text-white">{node.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${node.latencyP95 > 1000 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {node.latencyP95}ms
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                  <span>{(node.requestsPerSec / 1000).toFixed(1)}k req/s</span>
                  <span className={node.errorRate > 1.0 ? 'text-rose-400 font-bold' : ''}>Err: {node.errorRate}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stage 4: Database & Queue */}
          <div className="space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-mono">4. Storage & Queues</span>
            {nodes.filter(n => n.id === 'rds-aurora' || n.id === 'dynamo-users' || n.id === 'sqs-billing').map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  node.status === 'CRITICAL'
                    ? 'border-rose-500/60 bg-rose-950/20 ring-1 ring-rose-500/40'
                    : node.status === 'DEGRADED'
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    {getNodeIcon(node.type)}
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">{node.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${node.latencyP95 > 1000 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                    {node.latencyP95}ms
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                  <span>{(node.requestsPerSec / 1000).toFixed(1)}k ops</span>
                  <span className={node.errorRate > 1.0 ? 'text-rose-400 font-bold' : ''}>Err: {node.errorRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X-Ray Distributed Trace Waterfall Viewer */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-850">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              X-Ray Trace Waterfall Drilldown
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-purple-300">{activeTrace.traceId}</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                {activeTrace.status} ({activeTrace.durationMs}ms)
              </span>
            </div>
          </div>

          {/* Trace Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sample Traces:</span>
            {traces.map((tr, idx) => (
              <button
                key={tr.traceId}
                onClick={() => setSelectedTraceId(tr.traceId)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  selectedTraceId === tr.traceId
                    ? 'bg-purple-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Trace #{idx + 1} ({tr.status})
              </button>
            ))}
          </div>
        </div>

        {/* Waterfall Timeline Segments */}
        <div className="space-y-3 font-mono text-xs">
          {/* Segment 1: API Gateway */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                API Gateway: POST /v1/orders/checkout
              </span>
              <span className="text-rose-400 font-bold">1842 ms (HTTP 504)</span>
            </div>
            <div className="w-full bg-slate-900 h-4 rounded-md overflow-hidden relative">
              <div className="h-full bg-rose-500/80 rounded-md" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Segment 2: Lambda Invocations */}
          <div className="space-y-1 pl-4 border-l-2 border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Lambda: order-processing-fn
              </span>
              <span className="text-rose-400">1820 ms</span>
            </div>
            <div className="w-full bg-slate-900 h-3.5 rounded-md overflow-hidden relative">
              <div className="h-full bg-amber-500/80 rounded-md ml-[1%]" style={{ width: '98%' }} />
            </div>
          </div>

          {/* Segment 3: Database Connection Pool Lock (Fault point) */}
          <div className="space-y-1 pl-8 border-l-2 border-rose-500/50">
            <div className="flex items-center justify-between text-rose-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Database className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Aurora Postgres Connect (Pool Timeout)
              </span>
              <span className="text-rose-400 font-bold">1500 ms (FAULT)</span>
            </div>
            <div className="w-full bg-slate-900 h-3.5 rounded-md overflow-hidden relative">
              <div className="h-full bg-rose-600 rounded-md ml-[2%]" style={{ width: '81%' }} />
            </div>
            <p className="text-[11px] text-rose-300/80 pt-0.5">
              Error: ConnectionTimeoutException: pool exhausted [active=200, waiting=48]
            </p>
          </div>

          {/* Segment 4: SQS Dispatch */}
          <div className="space-y-1 pl-8 border-l-2 border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                SQS: SendMessageBatch
              </span>
              <span className="text-emerald-400">42 ms (OK)</span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-md overflow-hidden relative">
              <div className="h-full bg-emerald-500/80 rounded-md ml-[83%]" style={{ width: '3%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
