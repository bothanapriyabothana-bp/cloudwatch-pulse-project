export type AwsRegion = 'us-east-1' | 'us-west-2' | 'eu-west-1' | 'ap-northeast-1' | 'sa-east-1';

export type AwsAccount = {
  id: string;
  name: string;
  environment: 'production' | 'staging' | 'sandbox';
};

export type ServiceCategory = 'compute' | 'database' | 'api' | 'messaging' | 'storage' | 'network';

export interface ServiceHealth {
  id: string;
  name: string;
  category: ServiceCategory;
  type: 'AWS/Lambda' | 'AWS/ECS' | 'AWS/RDS' | 'AWS/ApiGateway' | 'AWS/DynamoDB' | 'AWS/SQS' | 'AWS/CloudFront';
  region: AwsRegion;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'MAINTENANCE';
  latencyP99: number; // ms
  latencyP50: number; // ms
  errorRate: number; // percentage
  throughput: number; // req/sec or ops/sec
  anomalyDetected: boolean;
  activeAlarmsCount: number;
  cpuUtilization?: number;
  memoryUtilization?: number;
  freeableMemoryMb?: number;
  queueDepth?: number;
  throttles?: number;
  sparkline: number[];
}

export interface MetricDataPoint {
  timestamp: string;
  actual: number;
  upperBand: number;
  lowerBand: number;
  baseline: number;
  isAnomaly?: boolean;
}

export type AlarmSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlarmState = 'ALARM' | 'OK' | 'INSUFFICIENT_DATA';

export interface CloudWatchAlarm {
  id: string;
  name: string;
  namespace: string;
  metricName: string;
  serviceId: string;
  serviceName: string;
  state: AlarmState;
  severity: AlarmSeverity;
  isComposite: boolean;
  compositeRule?: string;
  metricMath?: string;
  threshold: string;
  currentValue: number;
  unit: string;
  updatedAt: string;
  durationInState: string;
  snsTopic: string;
  description: string;
  datapointsToAlarm: string;
}

export interface LogRecord {
  id: string;
  timestamp: string;
  logGroup: string;
  logStream: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'DEBUG';
  message: string;
  service: string;
  requestId?: string;
  traceId?: string;
  latencyMs?: number;
  statusCode?: number;
  jsonPayload?: Record<string, any>;
}

export interface TraceSegment {
  id: string;
  name: string;
  service: string;
  durationMs: number;
  status: 'OK' | 'ERROR' | 'THROTTLED' | 'FAULT';
  startTimeMs: number;
  httpStatus?: number;
  subsegments?: TraceSegment[];
  metadata?: Record<string, any>;
}

export interface DistributedTrace {
  traceId: string;
  rootService: string;
  durationMs: number;
  timestamp: string;
  status: 'OK' | 'ERROR' | 'FAULT';
  httpMethod: string;
  urlPath: string;
  segments: TraceSegment[];
}

export interface ServiceNode {
  id: string;
  label: string;
  type: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  requestsPerSec: number;
  errorRate: number;
  latencyP95: number;
  x: number;
  y: number;
}

export interface ServiceEdge {
  from: string;
  to: string;
  latencyMs: number;
  callRate: number;
  errorRate: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface SyntheticCanary {
  id: string;
  name: string;
  url: string;
  frequency: string;
  uptime24h: number;
  latencyAvg: number;
  status: 'PASSED' | 'FAILED' | 'DEGRADED';
  lastRun: string;
  region: AwsRegion;
  sloTarget: number;
  sloActual: number;
  errorBudgetBurnRate: number; // e.g. 1.2x normal burn
}

export interface RcaAnalysisResult {
  summary: string;
  rootCause: string;
  blastRadius: string;
  confidenceScore: number;
  timeline: {
    timestamp: string;
    event: string;
    severity: AlarmSeverity;
  }[];
  evidence: string[];
  immediateMitigation: {
    description: string;
    cliCommands: string[];
  };
  longTermFixes: string[];
  recommendedAlarm: {
    name: string;
    metricNamespace: string;
    metricName: string;
    threshold: string;
    metricMath: string;
  };
}

export interface PresetQuery {
  id: string;
  title: string;
  category: string;
  query: string;
  description: string;
  recommendedVisual: 'table' | 'line' | 'bar' | 'pie';
}
