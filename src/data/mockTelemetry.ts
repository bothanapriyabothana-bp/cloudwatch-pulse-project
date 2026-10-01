import {
  AwsAccount,
  ServiceHealth,
  CloudWatchAlarm,
  LogRecord,
  DistributedTrace,
  ServiceNode,
  ServiceEdge,
  SyntheticCanary,
  PresetQuery,
  MetricDataPoint
} from '../types';

export const ACCOUNTS: AwsAccount[] = [
  { id: '8824-5981-4129', name: 'AWS-Prod-Core (8824)', environment: 'production' },
  { id: '3319-4820-1102', name: 'AWS-Staging-Cluster (3319)', environment: 'staging' },
  { id: '9940-1284-7731', name: 'AWS-Sandbox-Dev (9940)', environment: 'sandbox' }
];

export const INITIAL_SERVICES: ServiceHealth[] = [
  {
    id: 'svc-lambda-orders',
    name: 'order-processing-fn',
    category: 'compute',
    type: 'AWS/Lambda',
    region: 'us-east-1',
    status: 'DEGRADED',
    latencyP99: 1840,
    latencyP50: 120,
    errorRate: 4.8,
    throughput: 1240,
    anomalyDetected: true,
    activeAlarmsCount: 2,
    memoryUtilization: 88,
    throttles: 14,
    sparkline: [22, 28, 35, 42, 68, 92, 114, 184, 172, 190]
  },
  {
    id: 'svc-rds-aurora',
    name: 'aurora-pg-primary',
    category: 'database',
    type: 'AWS/RDS',
    region: 'us-east-1',
    status: 'CRITICAL',
    latencyP99: 3420,
    latencyP50: 45,
    errorRate: 8.2,
    throughput: 4850,
    anomalyDetected: true,
    activeAlarmsCount: 3,
    cpuUtilization: 94.2,
    freeableMemoryMb: 312,
    sparkline: [45, 52, 60, 75, 88, 94, 96, 95, 94, 98]
  },
  {
    id: 'svc-apigw-gateway',
    name: 'api-gateway-v2-main',
    category: 'api',
    type: 'AWS/ApiGateway',
    region: 'us-east-1',
    status: 'DEGRADED',
    latencyP99: 1420,
    latencyP50: 64,
    errorRate: 3.9,
    throughput: 8900,
    anomalyDetected: true,
    activeAlarmsCount: 1,
    sparkline: [60, 62, 65, 80, 110, 140, 138, 142, 145, 142]
  },
  {
    id: 'svc-dynamo-users',
    name: 'user-sessions-table',
    category: 'database',
    type: 'AWS/DynamoDB',
    region: 'us-east-1',
    status: 'HEALTHY',
    latencyP99: 12,
    latencyP50: 2.4,
    errorRate: 0.02,
    throughput: 14200,
    anomalyDetected: false,
    activeAlarmsCount: 0,
    throttles: 0,
    sparkline: [2, 3, 2, 2, 3, 2, 3, 2, 3, 2]
  },
  {
    id: 'svc-ecs-checkout',
    name: 'checkout-service-cluster',
    category: 'compute',
    type: 'AWS/ECS',
    region: 'us-east-1',
    status: 'HEALTHY',
    latencyP99: 84,
    latencyP50: 22,
    errorRate: 0.15,
    throughput: 3200,
    anomalyDetected: false,
    activeAlarmsCount: 0,
    cpuUtilization: 48,
    memoryUtilization: 52,
    sparkline: [20, 22, 21, 24, 23, 22, 25, 23, 24, 22]
  },
  {
    id: 'svc-sqs-billing',
    name: 'payment-events-queue',
    category: 'messaging',
    type: 'AWS/SQS',
    region: 'us-east-1',
    status: 'DEGRADED',
    latencyP99: 420,
    latencyP50: 18,
    errorRate: 1.8,
    throughput: 640,
    anomalyDetected: true,
    activeAlarmsCount: 1,
    queueDepth: 8420,
    sparkline: [120, 340, 980, 1840, 3200, 5400, 6800, 7900, 8200, 8420]
  },
  {
    id: 'svc-cf-edge',
    name: 'global-cdn-dist-e28',
    category: 'network',
    type: 'AWS/CloudFront',
    region: 'us-east-1',
    status: 'HEALTHY',
    latencyP99: 28,
    latencyP50: 8,
    errorRate: 0.08,
    throughput: 24500,
    anomalyDetected: false,
    activeAlarmsCount: 0,
    sparkline: [8, 8, 9, 8, 9, 8, 8, 9, 8, 8]
  }
];

export const INITIAL_ALARMS: CloudWatchAlarm[] = [
  {
    id: 'alm-comp-01',
    name: 'Composite-PaymentGateway-Degradation',
    namespace: 'AWS/Composite',
    metricName: 'CompositeHealthRule',
    serviceId: 'svc-apigw-gateway',
    serviceName: 'api-gateway-v2-main',
    state: 'ALARM',
    severity: 'CRITICAL',
    isComposite: true,
    compositeRule: 'ALARM("RDS-HighConnections") AND (ALARM("Lambda-DurationP99") OR ALARM("ApiGw-5XXSpike"))',
    threshold: 'Composite Rule Triggered',
    currentValue: 1,
    unit: 'State',
    updatedAt: '2 min ago',
    durationInState: '14m 32s',
    snsTopic: 'arn:aws:sns:us-east-1:882459814129:sre-pagerduty-high',
    description: 'Triggered when Aurora database saturation cascades to API Gateway p99 latency threshold violations.',
    datapointsToAlarm: 'Immediate'
  },
  {
    id: 'alm-rds-01',
    name: 'RDS-Aurora-DatabaseConnections-Max',
    namespace: 'AWS/RDS',
    metricName: 'DatabaseConnections',
    serviceId: 'svc-rds-aurora',
    serviceName: 'aurora-pg-primary',
    state: 'ALARM',
    severity: 'CRITICAL',
    isComposite: false,
    metricMath: 'RATE(DatabaseConnections)/MaxCapacity * 100',
    threshold: '> 90% (850 conns) for 2 data points',
    currentValue: 94.2,
    unit: 'Percent',
    updatedAt: '4 min ago',
    durationInState: '18m 10s',
    snsTopic: 'arn:aws:sns:us-east-1:882459814129:sre-db-alerts',
    description: 'PostgreSQL active connection pool has reached critical saturation limit.',
    datapointsToAlarm: '2 out of 2'
  },
  {
    id: 'alm-lambda-01',
    name: 'Lambda-OrderProcessing-DurationP99-Anomaly',
    namespace: 'AWS/Lambda',
    metricName: 'Duration',
    serviceId: 'svc-lambda-orders',
    serviceName: 'order-processing-fn',
    state: 'ALARM',
    severity: 'HIGH',
    isComposite: false,
    metricMath: 'ANOMALY_DETECTION_BAND(m1, 3)',
    threshold: '> 3 Standard Deviations above 450ms',
    currentValue: 1840,
    unit: 'Milliseconds',
    updatedAt: '6 min ago',
    durationInState: '12m 45s',
    snsTopic: 'arn:aws:sns:us-east-1:882459814129:sre-compute-ops',
    description: 'Function p99 execution duration breached dynamic machine learning seasonal band.',
    datapointsToAlarm: '3 out of 3'
  },
  {
    id: 'alm-sqs-01',
    name: 'SQS-PaymentQueue-ApproximateAgeOfOldestMessage',
    namespace: 'AWS/SQS',
    metricName: 'ApproximateAgeOfOldestMessage',
    serviceId: 'svc-sqs-billing',
    serviceName: 'payment-events-queue',
    state: 'ALARM',
    severity: 'MEDIUM',
    isComposite: false,
    threshold: '> 300 seconds (5m) lag',
    currentValue: 420,
    unit: 'Seconds',
    updatedAt: '8 min ago',
    durationInState: '8m 20s',
    snsTopic: 'arn:aws:sns:us-east-1:882459814129:sre-ops-slack',
    description: 'Consumer lag accumulating in payment ingestion pipeline due to database locks.',
    datapointsToAlarm: '2 out of 3'
  },
  {
    id: 'alm-ddb-01',
    name: 'DynamoDB-UserSessions-ReadThrottleEvents',
    namespace: 'AWS/DynamoDB',
    metricName: 'ReadThrottleEvents',
    serviceId: 'svc-dynamo-users',
    serviceName: 'user-sessions-table',
    state: 'OK',
    severity: 'LOW',
    isComposite: false,
    threshold: '> 5 events per 60s',
    currentValue: 0,
    unit: 'Count',
    updatedAt: '15 min ago',
    durationInState: '4d 12h',
    snsTopic: 'arn:aws:sns:us-east-1:882459814129:sre-db-alerts',
    description: 'DynamoDB table read capacity units remaining in healthy on-demand scaling bounds.',
    datapointsToAlarm: '1 out of 1'
  },
  {
    id: 'alm-cf-01',
    name: 'CloudFront-Global-5XXErrorRate',
    namespace: 'AWS/CloudFront',
    metricName: '5xxErrorRate',
    serviceId: 'svc-cf-edge',
    serviceName: 'global-cdn-dist-e28',
    state: 'OK',
    severity: 'HIGH',
    isComposite: false,
    threshold: '> 1.0% error rate',
    currentValue: 0.08,
    unit: 'Percent',
    updatedAt: '25 min ago',
    durationInState: '6d 2h',
    snsTopic: 'arn:aws:sns:us-east-1:882459814129:sre-edge-alerts',
    description: 'Monitors origin edge response failures and geographic POP health.',
    datapointsToAlarm: '2 out of 2'
  }
];

export const INITIAL_LOGS: LogRecord[] = [
  {
    id: 'log-101',
    timestamp: '2026-08-24T16:34:12.842Z',
    logGroup: '/aws/lambda/order-processing-fn',
    logStream: '2026/08/24/[$LATEST]49a8f1b92c4e',
    severity: 'ERROR',
    service: 'order-processing-fn',
    requestId: '9e41b2a7-6819-4dc8-a892-cb8911f4219b',
    traceId: '1-66c9f28a-7819ad2488102941bca98129',
    latencyMs: 1842,
    statusCode: 504,
    message: 'ERROR ConnectionTimeout: Timed out connecting to postgresql://aurora-pg-primary.internal:5432/orders after 15000ms. Connection pool exhausted [active=200, waiting=48]',
    jsonPayload: {
      errorType: 'ConnectionTimeoutException',
      retryAttempts: 3,
      connectionPool: { active: 200, idle: 0, waiting: 48, maxLimit: 200 },
      targetHost: 'aurora-pg-primary.internal'
    }
  },
  {
    id: 'log-102',
    timestamp: '2026-08-24T16:34:11.209Z',
    logGroup: '/aws/rds/aurora-pg-primary/postgresql',
    logStream: 'postgresql.log.2026-08-24-16',
    severity: 'FATAL',
    service: 'aurora-pg-primary',
    message: 'FATAL: remaining connection slots are reserved for non-replication superuser connections (max_connections=850, current_connections=850)',
    jsonPayload: {
      sqlState: '53300',
      clientAddr: '10.0.4.192',
      processId: 48192
    }
  },
  {
    id: 'log-103',
    timestamp: '2026-08-24T16:34:10.045Z',
    logGroup: '/aws/apigateway/api-gateway-v2-main',
    logStream: 'apigw-access-logs-us-east-1',
    severity: 'WARN',
    service: 'api-gateway-v2-main',
    requestId: '8a1294ef-1182-4aa1-9f99-2819cc782190',
    traceId: '1-66c9f28a-7819ad2488102941bca98129',
    latencyMs: 1420,
    statusCode: 504,
    message: 'HTTP POST /v1/orders - HTTP 504 Gateway Timeout (IntegrationLatency: 1418ms, ResponseLength: 142 bytes)',
    jsonPayload: {
      httpMethod: 'POST',
      resourcePath: '/v1/orders',
      ip: '203.0.113.82',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iOS 19_0)',
      integrationLatency: 1418,
      integrationStatus: '504'
    }
  },
  {
    id: 'log-104',
    timestamp: '2026-08-24T16:34:08.512Z',
    logGroup: '/aws/sqs/payment-events-queue',
    logStream: 'sqs-consumer-worker-pool',
    severity: 'WARN',
    service: 'payment-events-queue',
    message: 'WARN Backpressure detected: Consumer worker throughput dropped to 12 msg/sec (target: 120 msg/sec). Queue visibility timeout extended.',
    jsonPayload: {
      queueName: 'payment-events-queue',
      approximateBacklog: 8420,
      oldestMessageTimestamp: '2026-08-24T16:27:08.000Z'
    }
  },
  {
    id: 'log-105',
    timestamp: '2026-08-24T16:34:05.110Z',
    logGroup: '/aws/lambda/order-processing-fn',
    logStream: '2026/08/24/[$LATEST]49a8f1b92c4e',
    severity: 'INFO',
    service: 'order-processing-fn',
    requestId: 'b4821a99-8812-4aa9-9022-7718cc92819a',
    message: 'REPORT RequestId: b4821a99-8812-4aa9-9022-7718cc92819a Duration: 1840.42 ms Billed Duration: 1841 ms Memory Size: 1024 MB Max Memory Used: 914 MB Init Duration: 412.18 ms'
  },
  {
    id: 'log-106',
    timestamp: '2026-08-24T16:33:58.204Z',
    logGroup: '/aws/ecs/checkout-service-cluster',
    logStream: 'checkout-app/checkout-task/e819b821',
    severity: 'INFO',
    service: 'checkout-service-cluster',
    message: 'INFO HTTP GET /healthz 200 OK - Health check passed in 1.4ms'
  }
];

export const INITIAL_NODES: ServiceNode[] = [
  { id: 'client', label: 'Client / Mobile Apps', type: 'Client', status: 'HEALTHY', requestsPerSec: 24500, errorRate: 0.1, latencyP95: 12, x: 50, y: 150 },
  { id: 'cloudfront', label: 'CloudFront Edge', type: 'CDN', status: 'HEALTHY', requestsPerSec: 24500, errorRate: 0.08, latencyP95: 28, x: 220, y: 150 },
  { id: 'apigw', label: 'API Gateway v2', type: 'API', status: 'DEGRADED', requestsPerSec: 8900, errorRate: 3.9, latencyP95: 1420, x: 420, y: 150 },
  { id: 'lambda-orders', label: 'Order Processing', type: 'Lambda', status: 'DEGRADED', requestsPerSec: 1240, errorRate: 4.8, latencyP95: 1840, x: 640, y: 80 },
  { id: 'ecs-checkout', label: 'Checkout Service', type: 'ECS', status: 'HEALTHY', requestsPerSec: 3200, errorRate: 0.15, latencyP95: 84, x: 640, y: 220 },
  { id: 'rds-aurora', label: 'Aurora PG Primary', type: 'RDS', status: 'CRITICAL', requestsPerSec: 4850, errorRate: 8.2, latencyP95: 3420, x: 880, y: 60 },
  { id: 'dynamo-users', label: 'User Sessions DB', type: 'DynamoDB', status: 'HEALTHY', requestsPerSec: 14200, errorRate: 0.02, latencyP95: 12, x: 880, y: 180 },
  { id: 'sqs-billing', label: 'Payment Queue', type: 'SQS', status: 'DEGRADED', requestsPerSec: 640, errorRate: 1.8, latencyP95: 420, x: 880, y: 290 }
];

export const INITIAL_EDGES: ServiceEdge[] = [
  { from: 'client', to: 'cloudfront', latencyMs: 28, callRate: 24500, errorRate: 0.08, status: 'HEALTHY' },
  { from: 'cloudfront', to: 'apigw', latencyMs: 34, callRate: 8900, errorRate: 3.9, status: 'WARNING' },
  { from: 'apigw', to: 'lambda-orders', latencyMs: 1420, callRate: 1240, errorRate: 4.8, status: 'CRITICAL' },
  { from: 'apigw', to: 'ecs-checkout', latencyMs: 84, callRate: 3200, errorRate: 0.15, status: 'HEALTHY' },
  { from: 'lambda-orders', to: 'rds-aurora', latencyMs: 3420, callRate: 1200, errorRate: 8.2, status: 'CRITICAL' },
  { from: 'lambda-orders', to: 'sqs-billing', latencyMs: 18, callRate: 640, errorRate: 1.8, status: 'WARNING' },
  { from: 'ecs-checkout', to: 'dynamo-users', latencyMs: 12, callRate: 3200, errorRate: 0.02, status: 'HEALTHY' }
];

export const INITIAL_TRACES: DistributedTrace[] = [
  {
    traceId: '1-66c9f28a-7819ad2488102941bca98129',
    rootService: 'api-gateway-v2-main',
    durationMs: 1842,
    timestamp: '16:34:12.842',
    status: 'FAULT',
    httpMethod: 'POST',
    urlPath: '/v1/orders/checkout',
    segments: [
      {
        id: 'seg-1',
        name: 'API Gateway Ingress',
        service: 'AWS/ApiGateway',
        durationMs: 1842,
        status: 'FAULT',
        startTimeMs: 0,
        httpStatus: 504,
        subsegments: [
          {
            id: 'seg-2',
            name: 'Lambda: order-processing-fn',
            service: 'AWS/Lambda',
            durationMs: 1820,
            status: 'FAULT',
            startTimeMs: 12,
            subsegments: [
              {
                id: 'seg-3',
                name: 'PostgreSQL Connect Pooler',
                service: 'AWS/RDS',
                durationMs: 1500,
                status: 'FAULT',
                startTimeMs: 24,
                metadata: { error: 'ConnectionTimeoutException (15000ms limit reached)' }
              },
              {
                id: 'seg-4',
                name: 'SQS: SendMessageBatch',
                service: 'AWS/SQS',
                durationMs: 42,
                status: 'OK',
                startTimeMs: 1528
              }
            ]
          }
        ]
      }
    ]
  },
  {
    traceId: '1-66c9f28b-9901ef123309182744aa7123',
    rootService: 'api-gateway-v2-main',
    durationMs: 94,
    timestamp: '16:34:09.112',
    status: 'OK',
    httpMethod: 'GET',
    urlPath: '/v1/users/profile',
    segments: [
      {
        id: 'seg-10',
        name: 'API Gateway Ingress',
        service: 'AWS/ApiGateway',
        durationMs: 94,
        status: 'OK',
        startTimeMs: 0,
        httpStatus: 200,
        subsegments: [
          {
            id: 'seg-11',
            name: 'ECS: checkout-service-cluster',
            service: 'AWS/ECS',
            durationMs: 82,
            status: 'OK',
            startTimeMs: 8,
            subsegments: [
              {
                id: 'seg-12',
                name: 'DynamoDB: GetItem (user-sessions-table)',
                service: 'AWS/DynamoDB',
                durationMs: 12,
                status: 'OK',
                startTimeMs: 16
              }
            ]
          }
        ]
      }
    ]
  }
];

export const INITIAL_SYNTHETICS: SyntheticCanary[] = [
  {
    id: 'canary-checkout',
    name: 'prod-checkout-e2e-canary',
    url: 'https://api.cloudwatch-pulse.internal/v1/checkout/probe',
    frequency: 'Every 1 min',
    uptime24h: 98.42,
    latencyAvg: 482,
    status: 'DEGRADED',
    lastRun: '42s ago',
    region: 'us-east-1',
    sloTarget: 99.9,
    sloActual: 98.42,
    errorBudgetBurnRate: 4.8
  },
  {
    id: 'canary-auth',
    name: 'oauth2-token-refresh-canary',
    url: 'https://auth.cloudwatch-pulse.internal/.well-known/openid-configuration',
    frequency: 'Every 5 mins',
    uptime24h: 99.98,
    latencyAvg: 34,
    status: 'PASSED',
    lastRun: '2m ago',
    region: 'us-east-1',
    sloTarget: 99.95,
    sloActual: 99.98,
    errorBudgetBurnRate: 0.2
  },
  {
    id: 'canary-cdn',
    name: 'global-static-asset-canary',
    url: 'https://cdn.cloudwatch-pulse.internal/healthcheck.txt',
    frequency: 'Every 1 min',
    uptime24h: 100.0,
    latencyAvg: 18,
    status: 'PASSED',
    lastRun: '15s ago',
    region: 'us-east-1',
    sloTarget: 99.99,
    sloActual: 100.0,
    errorBudgetBurnRate: 0.0
  }
];

export const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'q1',
    title: 'Top 10 Slowest Endpoints (P99 Latency)',
    category: 'Performance',
    query: `fields @timestamp, @message, duration, path\n| filter @message like /REPORT/\n| parse @message /Duration: (?<duration>[0-9.]+) ms/\n| stats pct(duration, 99) as p99, pct(duration, 50) as p50, count(*) as invocations by path\n| sort p99 desc\n| limit 10`,
    description: 'Calculates P99 and P50 execution times grouped by REST endpoint route.',
    recommendedVisual: 'bar'
  },
  {
    id: 'q2',
    title: 'Error & Exception Frequency by 5m Window',
    category: 'Errors',
    query: `fields @timestamp, @message, @logStream\n| filter @message like /(?i)(error|exception|fatal|timeout|failed)/\n| stats count(*) as errorCount by bin(5m)\n| sort @timestamp desc`,
    description: 'Timeseries histogram of error volume aggregated into 5-minute buckets.',
    recommendedVisual: 'line'
  },
  {
    id: 'q3',
    title: 'Lambda Cold Start & Init Duration Analysis',
    category: 'Serverless',
    query: `fields @timestamp, @message\n| filter @message like /Init Duration/\n| parse @message /Init Duration: (?<initDuration>[0-9.]+) ms/\n| stats count(*) as coldStarts, avg(initDuration) as avgInit, max(initDuration) as maxInit by bin(15m)\n| sort @timestamp desc`,
    description: 'Identifies cold start frequency and average initialization overhead.',
    recommendedVisual: 'line'
  },
  {
    id: 'q4',
    title: 'PostgreSQL Connection Exhaustion Signatures',
    category: 'Database',
    query: `fields @timestamp, @message\n| filter @message like /connection slots are reserved|Connection pool exhausted/\n| stats count(*) as connectionErrors by bin(1m)\n| sort @timestamp desc`,
    description: 'Pinpoints exact timestamps when Aurora PostgreSQL connection limits were breached.',
    recommendedVisual: 'bar'
  },
  {
    id: 'q5',
    title: 'HTTP Status Code Distribution (2xx vs 4xx vs 5xx)',
    category: 'API Gateway',
    query: `fields @timestamp, status\n| filter ispresent(status)\n| stats count(*) as statusCount by status\n| sort statusCount desc`,
    description: 'Aggregates API Gateway response codes into categorized distributions.',
    recommendedVisual: 'pie'
  }
];

export function generateTimeseries(
  pointsCount: number = 24,
  baseValue: number = 100,
  hasAnomaly: boolean = false
): MetricDataPoint[] {
  const result: MetricDataPoint[] = [];
  const now = Date.now();
  const step = 60 * 1000; // 1 min

  for (let i = pointsCount - 1; i >= 0; i--) {
    const time = new Date(now - i * step);
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    
    // Base curve with slight periodic variation
    const wave = Math.sin((pointsCount - i) / 3) * (baseValue * 0.15);
    const noise = (Math.random() - 0.5) * (baseValue * 0.1);
    let actual = Math.max(10, Math.round(baseValue + wave + noise));

    const baseline = Math.round(baseValue + wave);
    const upperBand = Math.round(baseline + baseValue * 0.35);
    const lowerBand = Math.max(5, Math.round(baseline - baseValue * 0.35));

    let isAnomalyPoint = false;
    // Inject anomaly in the last 4 points if requested
    if (hasAnomaly && i <= 3) {
      actual = Math.round(upperBand * (1.6 + (4 - i) * 0.3));
      isAnomalyPoint = true;
    }

    result.push({
      timestamp: timeStr,
      actual,
      upperBand,
      lowerBand,
      baseline,
      isAnomaly: isAnomalyPoint
    });
  }

  return result;
}
