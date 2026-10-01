import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  Zap,
  Sparkles,
  Code2,
  Settings2,
  TrendingUp,
  AlertOctagon
} from 'lucide-react';
import { ServiceHealth, MetricDataPoint } from '../types';

interface LiveAnomalyRadarProps {
  selectedService: ServiceHealth;
  timeseriesData: MetricDataPoint[];
  onOpenAlarmOptimizer: (service: ServiceHealth, metricName: string) => void;
}

export const LiveAnomalyRadar: React.FC<LiveAnomalyRadarProps> = ({
  selectedService,
  timeseriesData,
  onOpenAlarmOptimizer
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'latency' | 'throughput' | 'errors' | 'cpu'>('latency');
  const [metricMathMode, setMetricMathMode] = useState<boolean>(false);
  const [metricMathQuery, setMetricMathQuery] = useState<string>(
    'RATE(Errors) / RATE(Invocations) * 100 > ANOMALY_DETECTION_BAND(m1, 3)'
  );

  const currentPoint = timeseriesData[timeseriesData.length - 1] || {
    actual: selectedService.latencyP99,
    upperBand: 450,
    lowerBand: 80,
    baseline: 200,
    isAnomaly: selectedService.anomalyDetected
  };

  const isCurrentAnomalous = currentPoint.actual > currentPoint.upperBand || currentPoint.actual < currentPoint.lowerBand;
  const zScore = ((currentPoint.actual - currentPoint.baseline) / Math.max(1, (currentPoint.upperBand - currentPoint.baseline) / 3)).toFixed(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm mb-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              CloudWatch Anomaly Radar & Metric Math
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
              {selectedService.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Machine-learning 3-sigma dynamic prediction bands trained on 14-day seasonal variance
          </p>
        </div>

        {/* Metric Selector & Math toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric tabs */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs text-slate-300">
            <button
              onClick={() => setSelectedMetric('latency')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedMetric === 'latency' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              Latency P99
            </button>
            <button
              onClick={() => setSelectedMetric('throughput')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedMetric === 'throughput' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              Throughput
            </button>
            <button
              onClick={() => setSelectedMetric('errors')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedMetric === 'errors' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              Error Rate
            </button>
            <button
              onClick={() => setSelectedMetric('cpu')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedMetric === 'cpu' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
            >
              Compute/Memory
            </button>
          </div>

          {/* Metric Math Toggle */}
          <button
            onClick={() => setMetricMathMode(!metricMathMode)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              metricMathMode
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            Metric Math
          </button>

          {/* AI Optimizer CTA */}
          <button
            onClick={() => onOpenAlarmOptimizer(selectedService, selectedMetric)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI Threshold Optimizer
          </button>
        </div>
      </div>

      {/* Metric Math Expression Bar if enabled */}
      {metricMathMode && (
        <div className="mb-4 p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-purple-300 font-mono">EXPRESSION:</span>
            <input
              type="text"
              value={metricMathQuery}
              onChange={(e) => setMetricMathQuery(e.target.value)}
              className="bg-slate-900 border border-purple-500/40 text-purple-200 text-xs font-mono px-2 py-1 rounded flex-1 focus:outline-none focus:border-purple-400"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <span className="bg-purple-500/20 px-2 py-0.5 rounded text-[11px]">Evaluation: 1m Period</span>
          </div>
        </div>
      )}

      {/* Statistical Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-medium">Actual Value</span>
          <p className="text-base font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
            {currentPoint.actual} {selectedMetric === 'latency' ? 'ms' : selectedMetric === 'errors' ? '%' : 'ops'}
            {isCurrentAnomalous && (
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 rounded font-sans">Anomaly</span>
            )}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-medium">Upper Prediction Band (+3σ)</span>
          <p className="text-base font-bold font-mono text-amber-300 mt-0.5">
            {currentPoint.upperBand} {selectedMetric === 'latency' ? 'ms' : 'units'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-medium">Seasonal Baseline (Mean)</span>
          <p className="text-base font-bold font-mono text-cyan-300 mt-0.5">
            {currentPoint.baseline} {selectedMetric === 'latency' ? 'ms' : 'units'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-medium">Z-Score Deviation</span>
          <p className={`text-base font-bold font-mono mt-0.5 ${Number(zScore) > 3.0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {zScore}σ ({Number(zScore) > 3.0 ? 'High Breach' : 'Within Band'})
          </p>
        </div>
      </div>

      {/* Main Timeseries Graph with Anomaly Bands */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={timeseriesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              {/* Gradient for Upper Anomaly Band */}
              <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />

            {/* Anomaly Prediction Upper Band Area */}
            <Area
              type="monotone"
              dataKey="upperBand"
              name="Upper 3σ ML Band"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#bandGradient)"
            />

            {/* Lower ML Band */}
            <Line
              type="monotone"
              dataKey="lowerBand"
              name="Lower 3σ ML Band"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1}
              dot={false}
            />

            {/* Expected Baseline */}
            <Line
              type="monotone"
              dataKey="baseline"
              name="Seasonal Baseline"
              stroke="#38bdf8"
              strokeWidth={1.5}
              dot={false}
            />

            {/* Actual Real-Time Metric Line */}
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Metric"
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isAnomaly) {
                  return (
                    <circle
                      key={`anomaly-${props.index}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="animate-pulse"
                    />
                  );
                }
                return (
                  <circle
                    key={`point-${props.index}`}
                    cx={cx}
                    cy={cy}
                    r={2.5}
                    fill="#f43f5e"
                  />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
