import React, { useState, useEffect, useRef } from 'react';
import {
  AwsRegion,
  AwsAccount,
  ServiceHealth,
  CloudWatchAlarm,
  LogRecord,
  DistributedTrace,
  ServiceNode,
  ServiceEdge,
  SyntheticCanary,
  RcaAnalysisResult,
  MetricDataPoint
} from './types';
import {
  ACCOUNTS,
  INITIAL_SERVICES,
  INITIAL_ALARMS,
  INITIAL_LOGS,
  INITIAL_NODES,
  INITIAL_EDGES,
  INITIAL_TRACES,
  INITIAL_SYNTHETICS,
  generateTimeseries
} from './data/mockTelemetry';
import { Navbar } from './components/Navbar';
import { PulseHeroMetrics } from './components/PulseHeroMetrics';
import { ServicePulseGrid } from './components/ServicePulseGrid';
import { LiveAnomalyRadar } from './components/LiveAnomalyRadar';
import { AlarmsIncidentCommand } from './components/AlarmsIncidentCommand';
import { LogsInsightsStudio } from './components/LogsInsightsStudio';
import { ServiceLensMap } from './components/ServiceLensMap';
import { SyntheticsAndSlo } from './components/SyntheticsAndSlo';
import { AIRcaModal } from './components/AIRcaModal';
import { AlarmBuilderModal } from './components/AlarmBuilderModal';
import { ChaosInjectorModal } from './components/ChaosInjectorModal';

export default function App() {
  // Global AWS Environment State
  const [selectedRegion, setSelectedRegion] = useState<AwsRegion>('us-east-1');
  const [selectedAccount, setSelectedAccount] = useState<AwsAccount>(ACCOUNTS[0]);
  const [liveStreaming, setLiveStreaming] = useState<boolean>(true);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState<number>(3000);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Telemetry Collections
  const [services, setServices] = useState<ServiceHealth[]>(INITIAL_SERVICES);
  const [alarms, setAlarms] = useState<CloudWatchAlarm[]>(INITIAL_ALARMS);
  const [logs, setLogs] = useState<LogRecord[]>(INITIAL_LOGS);
  const [nodes, setNodes] = useState<ServiceNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<ServiceEdge[]>(INITIAL_EDGES);
  const [traces, setTraces] = useState<DistributedTrace[]>(INITIAL_TRACES);
  const [synthetics, setSynthetics] = useState<SyntheticCanary[]>(INITIAL_SYNTHETICS);

  // Selected drilldown service
  const [selectedService, setSelectedService] = useState<ServiceHealth>(INITIAL_SERVICES[0]);
  const [timeseriesData, setTimeseriesData] = useState<MetricDataPoint[]>(() =>
    generateTimeseries(24, INITIAL_SERVICES[0].latencyP99, INITIAL_SERVICES[0].anomalyDetected)
  );

  // Modals state
  const [isRcaModalOpen, setIsRcaModalOpen] = useState<boolean>(false);
  const [rcaTargetAlarm, setRcaTargetAlarm] = useState<CloudWatchAlarm | null>(null);
  const [rcaResult, setRcaResult] = useState<RcaAnalysisResult | null>(null);
  const [isRcaLoading, setIsRcaLoading] = useState<boolean>(false);

  const [isAlarmBuilderOpen, setIsAlarmBuilderOpen] = useState<boolean>(false);
  const [builderInitialService, setBuilderInitialService] = useState<ServiceHealth | null>(null);
  const [builderInitialMetric, setBuilderInitialMetric] = useState<string>('Duration');

  const [isChaosModalOpen, setIsChaosModalOpen] = useState<boolean>(false);

  // Update timeseries when selected service changes
  useEffect(() => {
    setTimeseriesData(
      generateTimeseries(24, selectedService.latencyP99, selectedService.anomalyDetected)
    );
  }, [selectedService.id]);

  // Real-time live telemetry stream simulation
  useEffect(() => {
    if (!liveStreaming) return;

    const interval = setInterval(() => {
      // 1. Jitter service metrics slightly
      setServices(prev =>
        prev.map(svc => {
          const jitter = (Math.random() - 0.5) * 0.08;
          const newThroughput = Math.max(10, Math.round(svc.throughput * (1 + jitter)));
          
          let newP99 = svc.latencyP99;
          if (svc.status === 'HEALTHY') {
            newP99 = Math.max(2, Math.round(svc.latencyP99 + (Math.random() - 0.5) * 4));
          } else {
            newP99 = Math.max(500, Math.round(svc.latencyP99 + (Math.random() - 0.5) * 40));
          }

          const newSparkline = [...svc.sparkline.slice(1), Math.round(newP99 / 10)];

          return {
            ...svc,
            throughput: newThroughput,
            latencyP99: newP99,
            sparkline: newSparkline
          };
        })
      );

      // 2. Advance timeseries data
      setTimeseriesData(prev => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        const base = selectedService.latencyP99;
        const baseline = Math.round(base * (1 + Math.sin(Date.now() / 15000) * 0.1));
        const upper = Math.round(baseline * 1.35);
        const lower = Math.max(10, Math.round(baseline * 0.65));
        
        const noise = (Math.random() - 0.5) * (base * 0.1);
        let actual = Math.max(10, Math.round(base + noise));
        if (selectedService.anomalyDetected) {
          actual = Math.round(upper * (1.3 + Math.random() * 0.4));
        }

        const newPoint: MetricDataPoint = {
          timestamp: timeStr,
          actual,
          upperBand: upper,
          lowerBand: lower,
          baseline,
          isAnomaly: selectedService.anomalyDetected
        };

        return [...prev.slice(1), newPoint];
      });

      // 3. Occasionally generate a log record
      if (Math.random() > 0.4) {
        const sampleService = services[Math.floor(Math.random() * services.length)];
        const isDegraded = sampleService.status !== 'HEALTHY';
        const newLog: LogRecord = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          logGroup: `/aws/${sampleService.category}/${sampleService.name}`,
          logStream: `2026/08/24/[$LATEST]${Math.random().toString(16).slice(2, 8)}`,
          severity: isDegraded && Math.random() > 0.4 ? 'ERROR' : 'INFO',
          service: sampleService.name,
          requestId: `${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 6)}`,
          message: isDegraded
            ? `ERROR Worker timeout processing batch payload on ${sampleService.name} (latency: ${sampleService.latencyP99}ms)`
            : `INFO Completed transaction successfully in ${sampleService.latencyP50}ms`
        };

        setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      }
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [liveStreaming, refreshIntervalMs, selectedService]);

  // AI Root Cause Analysis Trigger
  const handleTriggerRca = async (alarm: CloudWatchAlarm) => {
    setRcaTargetAlarm(alarm);
    setIsRcaModalOpen(true);
    setIsRcaLoading(true);
    setRcaResult(null);

    try {
      const correlatedLogs = logs.filter(
        l => l.service === alarm.serviceName || l.severity === 'ERROR' || l.severity === 'FATAL'
      ).slice(0, 6);

      const targetSvc = services.find(s => s.id === alarm.serviceId);

      const payload = {
        incident: {
          alarmName: alarm.name,
          namespace: alarm.namespace,
          metricName: alarm.metricName,
          severity: alarm.severity,
          threshold: alarm.threshold,
          currentValue: alarm.currentValue,
          durationInState: alarm.durationInState,
          compositeRule: alarm.compositeRule
        },
        metricData: {
          service: targetSvc?.name,
          p99Latency: targetSvc?.latencyP99,
          errorRate: targetSvc?.errorRate,
          cpuUtilization: targetSvc?.cpuUtilization,
          freeableMemoryMb: targetSvc?.freeableMemoryMb
        },
        logs: correlatedLogs,
        traces: traces.slice(0, 2)
      };

      const res = await fetch('/api/ai/rca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success && json.data) {
        setRcaResult(json.data);
      } else if (json.fallback) {
        setRcaResult(json.fallback);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setRcaResult({
        summary: 'CloudWatch anomaly correlation identified connection pool saturation in Aurora Postgres cascading to upstream Lambda workers.',
        rootCause: 'PostgreSQL max_connections limit (850) reached, causing connection starvation and 504 Gateway Timeouts.',
        blastRadius: 'Order Checkout and User Authentication degraded for ~14% of requests.',
        confidenceScore: 92,
        timeline: [
          { timestamp: 'T-10m', event: 'Sudden spike in active database connections on Aurora primary', severity: 'HIGH' },
          { timestamp: 'T-6m', event: 'Connection pool exhausted, Lambda duration exceeded 1800ms', severity: 'CRITICAL' },
          { timestamp: 'T-2m', event: 'Composite alarm triggered with PagerDuty P1 dispatch', severity: 'CRITICAL' }
        ],
        evidence: [
          'FATAL: remaining connection slots are reserved for non-replication superuser connections',
          'P99 latency surged from 45ms to 3420ms',
          'SQS consumer queue depth accumulated 8,420 unprocessed messages'
        ],
        immediateMitigation: {
          description: 'Scale Aurora read replica capacity and deploy AWS RDS Proxy connection pooling.',
          cliCommands: [
            'aws rds modify-db-instance --db-instance-identifier aurora-pg-primary --apply-immediately',
            'aws lambda put-function-concurrency --function-name order-processing-fn --reserved-concurrent-executions 100'
          ]
        },
        longTermFixes: [
          'Enable AWS RDS Proxy to reuse idle connection pools safely.',
          'Implement client-side exponential backoff with jitter on database queries.'
        ],
        recommendedAlarm: {
          name: 'Composite-RDS-And-Lambda-Saturation',
          metricNamespace: 'AWS/Composite',
          metricName: 'CompositeHealthRule',
          threshold: 'RDS Conns > 85% AND Lambda Duration > 500ms',
          metricMath: 'RATE(DatabaseConnections)/850 * 100'
        }
      });
    } finally {
      setIsRcaLoading(false);
    }
  };

  // AI RCA for direct service click
  const handleAnalyzeServiceWithAI = (service: ServiceHealth) => {
    const matchingAlarm = alarms.find(a => a.serviceId === service.id && a.state === 'ALARM') || {
      id: `alm-temp-${service.id}`,
      name: `${service.name}-DegradationAlarm`,
      namespace: service.type,
      metricName: 'P99Latency',
      serviceId: service.id,
      serviceName: service.name,
      state: 'ALARM',
      severity: service.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      isComposite: false,
      threshold: '> 500ms p99 latency',
      currentValue: service.latencyP99,
      unit: 'ms',
      updatedAt: 'Just now',
      durationInState: '14m',
      snsTopic: 'arn:aws:sns:us-east-1:882459814129:sre-incident-alerts',
      description: `Elevated latency and ML anomaly breach on ${service.name}`,
      datapointsToAlarm: '3 out of 3'
    };

    handleTriggerRca(matchingAlarm);
  };

  // Chaos Injection Handler
  const handleInjectChaos = (type: 'rds-exhaustion' | 'lambda-oom' | 'dynamo-throttles' | 'cf-outage' | 'recover') => {
    if (type === 'recover') {
      setServices(INITIAL_SERVICES.map(s => ({
        ...s,
        status: 'HEALTHY',
        latencyP99: Math.min(s.latencyP99, 120),
        errorRate: 0.05,
        anomalyDetected: false,
        activeAlarmsCount: 0
      })));
      setAlarms(INITIAL_ALARMS.map(a => ({
        ...a,
        state: 'OK',
        currentValue: 0
      })));
      return;
    }

    if (type === 'rds-exhaustion') {
      setServices(prev =>
        prev.map(s => {
          if (s.id === 'svc-rds-aurora') {
            return {
              ...s,
              status: 'CRITICAL',
              latencyP99: 4850,
              errorRate: 14.8,
              cpuUtilization: 98.6,
              freeableMemoryMb: 120,
              anomalyDetected: true
            };
          }
          if (s.id === 'svc-lambda-orders') {
            return { ...s, status: 'CRITICAL', latencyP99: 3800, errorRate: 9.4, anomalyDetected: true };
          }
          if (s.id === 'svc-apigw-gateway') {
            return { ...s, status: 'DEGRADED', errorRate: 6.2, latencyP99: 2100, anomalyDetected: true };
          }
          return s;
        })
      );
      setAlarms(prev =>
        prev.map(a => {
          if (a.id === 'alm-rds-01' || a.id === 'alm-comp-01') {
            return { ...a, state: 'ALARM', severity: 'CRITICAL' };
          }
          return a;
        })
      );
    } else if (type === 'lambda-oom') {
      setServices(prev =>
        prev.map(s => {
          if (s.id === 'svc-lambda-orders') {
            return {
              ...s,
              status: 'CRITICAL',
              latencyP99: 15000,
              errorRate: 22.4,
              memoryUtilization: 100,
              anomalyDetected: true
            };
          }
          return s;
        })
      );
      setAlarms(prev =>
        prev.map(a => {
          if (a.id === 'alm-lambda-01') return { ...a, state: 'ALARM', severity: 'CRITICAL' };
          return a;
        })
      );
    } else if (type === 'dynamo-throttles') {
      setServices(prev =>
        prev.map(s => {
          if (s.id === 'svc-dynamo-users') {
            return {
              ...s,
              status: 'DEGRADED',
              throttles: 450,
              latencyP99: 890,
              errorRate: 4.5,
              anomalyDetected: true
            };
          }
          return s;
        })
      );
      setAlarms(prev =>
        prev.map(a => {
          if (a.id === 'alm-ddb-01') return { ...a, state: 'ALARM', severity: 'HIGH' };
          return a;
        })
      );
    } else if (type === 'cf-outage') {
      setServices(prev =>
        prev.map(s => {
          if (s.id === 'svc-cf-edge') {
            return {
              ...s,
              status: 'DEGRADED',
              errorRate: 8.4,
              latencyP99: 450,
              anomalyDetected: true
            };
          }
          return s;
        })
      );
      setAlarms(prev =>
        prev.map(a => {
          if (a.id === 'alm-cf-01') return { ...a, state: 'ALARM', severity: 'HIGH' };
          return a;
        })
      );
    }
  };

  const handleSaveCustomAlarm = (newAlarm: CloudWatchAlarm) => {
    setAlarms(prev => [newAlarm, ...prev]);
  };

  const handleOpenAlarmOptimizer = (service: ServiceHealth, metricName: string) => {
    setBuilderInitialService(service);
    setBuilderInitialMetric(metricName);
    setIsAlarmBuilderOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Global Navigation Bar */}
      <Navbar
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
        liveStreaming={liveStreaming}
        onToggleLiveStreaming={() => setLiveStreaming(!liveStreaming)}
        refreshIntervalMs={refreshIntervalMs}
        onChangeRefreshInterval={setRefreshIntervalMs}
        onOpenChaosModal={() => setIsChaosModalOpen(true)}
        onOpenAlarmBuilder={() => {
          setBuilderInitialService(null);
          setIsAlarmBuilderOpen(true);
        }}
        activeAlarmsCount={alarms.filter(a => a.state === 'ALARM').length}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top-Level Hero Metrics Bar */}
        <PulseHeroMetrics
          services={services}
          alarms={alarms}
          onFilterAlarms={() => setActiveTab('alarms')}
          onFilterAnomalies={() => {
            const anomalySvc = services.find(s => s.anomalyDetected);
            if (anomalySvc) setSelectedService(anomalySvc);
            setActiveTab('overview');
          }}
        />

        {/* Tab Content 1: Health Pulse & Anomaly Radar */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <LiveAnomalyRadar
              selectedService={selectedService}
              timeseriesData={timeseriesData}
              onOpenAlarmOptimizer={handleOpenAlarmOptimizer}
            />

            <ServicePulseGrid
              services={services}
              selectedServiceId={selectedService.id}
              onSelectService={setSelectedService}
              onAnalyzeWithAI={handleAnalyzeServiceWithAI}
            />
          </div>
        )}

        {/* Tab Content 2: Alarms & RCA Command */}
        {activeTab === 'alarms' && (
          <AlarmsIncidentCommand
            alarms={alarms}
            onTriggerRca={handleTriggerRca}
          />
        )}

        {/* Tab Content 3: CloudWatch Logs Insights AI Studio */}
        {activeTab === 'logs' && (
          <LogsInsightsStudio
            logs={logs}
          />
        )}

        {/* Tab Content 4: ServiceLens & Traces */}
        {activeTab === 'traces' && (
          <ServiceLensMap
            nodes={nodes}
            edges={edges}
            traces={traces}
          />
        )}

        {/* Tab Content 5: Synthetics & SLO */}
        {activeTab === 'synthetics' && (
          <SyntheticsAndSlo
            canaries={synthetics}
          />
        )}

      </main>

      {/* Modals */}
      <AIRcaModal
        isOpen={isRcaModalOpen}
        onClose={() => setIsRcaModalOpen(false)}
        alarm={rcaTargetAlarm}
        rcaResult={rcaResult}
        isLoading={isRcaLoading}
      />

      <AlarmBuilderModal
        isOpen={isAlarmBuilderOpen}
        onClose={() => setIsAlarmBuilderOpen(false)}
        services={services}
        initialService={builderInitialService}
        initialMetric={builderInitialMetric}
        onSaveAlarm={handleSaveCustomAlarm}
      />

      <ChaosInjectorModal
        isOpen={isChaosModalOpen}
        onClose={() => setIsChaosModalOpen(false)}
        onInjectChaos={handleInjectChaos}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>AWS Telemetry Connected • CloudWatch Pulse v2.4</span>
          </div>
          <div>
            Powered by Google Gemini 3.7 Flash AI Observability Engine
          </div>
        </div>
      </footer>

    </div>
  );
}
