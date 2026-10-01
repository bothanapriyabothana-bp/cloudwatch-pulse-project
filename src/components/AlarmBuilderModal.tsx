import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Zap,
  Code2,
  Bell,
  Check,
  Copy,
  Terminal
} from 'lucide-react';
import { CloudWatchAlarm, ServiceHealth, AlarmSeverity } from '../types';

interface AlarmBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceHealth[];
  initialService?: ServiceHealth | null;
  initialMetric?: string;
  onSaveAlarm: (alarm: CloudWatchAlarm) => void;
}

export const AlarmBuilderModal: React.FC<AlarmBuilderModalProps> = ({
  isOpen,
  onClose,
  services,
  initialService,
  initialMetric,
  onSaveAlarm
}) => {
  const [alarmName, setAlarmName] = useState<string>(
    initialService ? `${initialService.name}-${initialMetric || 'Latency'}-HighAlert` : 'New-Service-Metric-Alarm'
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialService?.id || services[0]?.id || '');
  const [metricName, setMetricName] = useState<string>(initialMetric || 'Duration');
  const [thresholdType, setThresholdType] = useState<'static' | 'anomaly'>('anomaly');
  const [staticValue, setStaticValue] = useState<number>(1000);
  const [standardDeviations, setStandardDeviations] = useState<number>(3);
  const [severity, setSeverity] = useState<AlarmSeverity>('HIGH');
  const [metricMath, setMetricMath] = useState<string>('ANOMALY_DETECTION_BAND(m1, 3)');
  const [snsTopic, setSnsTopic] = useState<string>('arn:aws:sns:us-east-1:882459814129:sre-incident-alerts');
  const [isAIOptimizing, setIsAIOptimizing] = useState<boolean>(false);
  const [aiTerraform, setAiTerraform] = useState<string>('');
  const [copiedTerraform, setCopiedTerraform] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetService = services.find(s => s.id === selectedServiceId) || services[0];

  const handleOptimizeWithAI = async () => {
    setIsAIOptimizing(true);
    try {
      const res = await fetch('/api/ai/alarm-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: targetService.name,
          metricName: metricName,
          currentThreshold: thresholdType === 'anomaly' ? `${standardDeviations} Standard Deviations` : `${staticValue}`,
          purpose: 'Catch latency regressions without alert fatigue'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.alarmName) setAlarmName(data.data.alarmName);
        if (data.data.metricMathExpression) setMetricMath(data.data.metricMathExpression);
        if (data.data.terraformSnippet) setAiTerraform(data.data.terraformSnippet);
        if (data.data.pagerDutySeverity) setSeverity(data.data.pagerDutySeverity);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAIOptimizing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlarm: CloudWatchAlarm = {
      id: `alm-${Date.now()}`,
      name: alarmName,
      namespace: targetService.type,
      metricName: metricName,
      serviceId: targetService.id,
      serviceName: targetService.name,
      state: 'OK',
      severity: severity,
      isComposite: false,
      metricMath: thresholdType === 'anomaly' ? metricMath : undefined,
      threshold: thresholdType === 'anomaly' ? `> ${standardDeviations}σ ML Band` : `> ${staticValue}`,
      currentValue: targetService.latencyP99 || 45,
      unit: 'ms',
      updatedAt: 'Just now',
      durationInState: '0m',
      snsTopic: snsTopic,
      description: `User-configured ${thresholdType} alarm on ${targetService.name}`,
      datapointsToAlarm: '3 out of 3'
    };

    onSaveAlarm(newAlarm);
    onClose();
  };

  const handleCopyTerraform = () => {
    navigator.clipboard.writeText(aiTerraform);
    setCopiedTerraform(true);
    setTimeout(() => setCopiedTerraform(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create CloudWatch Metric Alarm</h2>
              <p className="text-xs text-slate-400">Configure static or dynamic machine learning anomaly thresholds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Target Service & Alarm Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Target AWS Service</label>
              <select
                aria-label="Target service selector"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Alarm Name</label>
              <input
                type="text"
                value={alarmName}
                onChange={(e) => setAlarmName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Metric Name & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">CloudWatch Metric</label>
              <select
                aria-label="CloudWatch metric selector"
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Duration">Duration / Latency (ms)</option>
                <option value="Errors">Errors (Count)</option>
                <option value="Throttles">Throttles (Count)</option>
                <option value="CPUUtilization">CPUUtilization (%)</option>
                <option value="DatabaseConnections">DatabaseConnections</option>
                <option value="ApproximateNumberOfMessagesVisible">ApproximateNumberOfMessagesVisible</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Severity</label>
              <select
                aria-label="Severity selector"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlarmSeverity)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value="CRITICAL" className="text-rose-400 font-bold">CRITICAL (PagerDuty P1)</option>
                <option value="HIGH" className="text-orange-400 font-bold">HIGH (PagerDuty P2)</option>
                <option value="MEDIUM" className="text-amber-400">MEDIUM (Slack Channel)</option>
                <option value="LOW" className="text-slate-400">LOW (Log only)</option>
              </select>
            </div>
          </div>

          {/* Threshold Type */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Threshold Type</label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setThresholdType('anomaly')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  thresholdType === 'anomaly'
                    ? 'border-amber-500 bg-amber-950/20 text-amber-300'
                    : 'border-slate-800 bg-slate-850 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  ML Anomaly Detection
                </div>
                <p className="text-[11px] text-slate-400">Dynamic 3-sigma seasonal prediction band</p>
              </div>

              <div
                onClick={() => setThresholdType('static')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  thresholdType === 'static'
                    ? 'border-amber-500 bg-amber-950/20 text-amber-300'
                    : 'border-slate-800 bg-slate-850 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  Static Threshold
                </div>
                <p className="text-[11px] text-slate-400">Fixed numeric limit boundary</p>
              </div>
            </div>
          </div>

          {/* Threshold config values */}
          {thresholdType === 'anomaly' ? (
            <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Standard Deviations (Band Width):</span>
                <span className="font-mono text-amber-400 font-bold">{standardDeviations}σ</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={standardDeviations}
                onChange={(e) => setStandardDeviations(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="pt-2">
                <label className="text-slate-400 font-semibold block mb-1">Metric Math Expression</label>
                <input
                  type="text"
                  value={metricMath}
                  onChange={(e) => setMetricMath(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-purple-300 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-slate-300 font-semibold block mb-1">Static Breach Value</label>
              <input
                type="number"
                value={staticValue}
                onChange={(e) => setStaticValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none"
              />
            </div>
          )}

          {/* SNS Topic */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">SNS Notification Target ARN</label>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono text-xs">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="text"
                value={snsTopic}
                onChange={(e) => setSnsTopic(e.target.value)}
                className="bg-transparent text-slate-200 w-full focus:outline-none"
              />
            </div>
          </div>

          {/* AI Optimizer button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOptimizeWithAI}
              disabled={isAIOptimizing}
              className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              {isAIOptimizing ? 'Optimizing with Gemini AI...' : 'AI Alarm & Terraform Optimizer'}
            </button>
          </div>

          {/* AI Generated Terraform */}
          {aiTerraform && (
            <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  Generated Terraform Infrastructure as Code
                </span>
                <button
                  type="button"
                  onClick={handleCopyTerraform}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1"
                >
                  {copiedTerraform ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedTerraform ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-[10px] font-mono text-purple-200 overflow-x-auto p-2 bg-slate-900 rounded">
                {aiTerraform}
              </pre>
            </div>
          )}

          {/* Footer Save */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow"
            >
              Create Alarm
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
