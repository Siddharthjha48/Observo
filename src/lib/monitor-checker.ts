import prisma from './prisma';
import { dispatchUserAlerts, AlertPayload } from './alerts';

interface Monitor {
  id: string;
  userId: string;
  name: string;
  url: string;
  method: string;
  interval: number;
  timeout: number;
  expectedStatus: number;
  maxResponseTime: number;
  isActive: boolean;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  uptimePercent: number | null;
  lastCheckedAt: Date | null;
  lastResponseTime: number | null;
  createdAt: Date;
}

export async function checkMonitor(monitor: Monitor) {
  if (!monitor.isActive) return;

  const start = Date.now();
  let responseTime = 0;
  let statusCode: number | null = null;
  let errorMsg: string | null = null;
  let status: 'UP' | 'DOWN' | 'DEGRADED' = 'UP';

  try {
    const res = await fetch(monitor.url, {
      method: monitor.method,
      signal: AbortSignal.timeout(monitor.timeout * 1000),
      headers: {
        'User-Agent': 'Observo Uptime Engine/1.0 (https://observo.dev)'
      },
      cache: 'no-store'
    });

    responseTime = Date.now() - start;
    statusCode = res.status;

    const isDown = res.status !== monitor.expectedStatus;
    const isDegraded = responseTime > monitor.maxResponseTime;

    status = isDown ? 'DOWN' : isDegraded ? 'DEGRADED' : 'UP';
  } catch (err: any) {
    // Timeout or networking DNS resolution error = DOWN
    responseTime = Date.now() - start;
    status = 'DOWN';
    errorMsg = err.message || String(err);
  }

  try {
    // 1. Create a Check record in database
    await prisma.monitorCheck.create({
      data: {
        monitorId: monitor.id,
        status,
        responseTime,
        statusCode,
        error: errorMsg,
      },
    });

    const previousStatus = monitor.status;

    // 2. Incident State Machine & Multi-Channel Alerts dispatch
    if (status !== 'UP' && previousStatus === 'UP') {
      // Endpoint went DOWN or DEGRADED! Create incident and alert.
      await handleMonitorIncidentStart(monitor, status, responseTime, statusCode, errorMsg);
    } else if (status === 'UP' && previousStatus !== 'UP' && previousStatus !== 'UNKNOWN') {
      // Endpoint recovered! Resolve outstanding open incident and alert recovery.
      await handleMonitorIncidentResolve(monitor, responseTime);
    }

    // 3. Re-calculate overall uptimePercent
    const totalChecks = await prisma.monitorCheck.count({
      where: { monitorId: monitor.id },
    });
    const upChecks = await prisma.monitorCheck.count({
      where: { monitorId: monitor.id, status: 'UP' },
    });
    
    const uptimePercent = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 100;

    // 4. Update the Monitor record
    await prisma.monitor.update({
      where: { id: monitor.id },
      data: {
        status,
        lastCheckedAt: new Date(),
        lastResponseTime: responseTime,
        uptimePercent,
      },
    });
  } catch (dbErr) {
    console.error(`Database operations failed for monitor ${monitor.name}:`, dbErr);
  }
}

async function handleMonitorIncidentStart(
  monitor: Monitor,
  status: 'DOWN' | 'DEGRADED',
  responseTime: number,
  statusCode: number | null,
  errorMsg: string | null
) {
  try {
    // Double check if there is an existing open incident to avoid double-logging
    const existingOpenIncident = await prisma.incident.findFirst({
      where: {
        monitorId: monitor.id,
        status: 'OPEN',
      },
    });

    if (existingOpenIncident) return;

    const title = `${monitor.name} is ${status}!`;
    const description = status === 'DOWN'
      ? `The target endpoint returned status ${statusCode || 'No response'} (expected ${monitor.expectedStatus}).`
      : `The response time was ${responseTime}ms, which exceeds your target max response threshold of ${monitor.maxResponseTime}ms.`;

    // Save Incident log
    await prisma.incident.create({
      data: {
        userId: monitor.userId,
        monitorId: monitor.id,
        type: status === 'DOWN' ? 'DOWN' : 'DEGRADED',
        title,
        description: errorMsg ? `${description} Error details: ${errorMsg}` : description,
        status: 'OPEN',
        startedAt: new Date(),
      },
    });

    // Alert payload
    const alert: AlertPayload = {
      type: status,
      title: `🔴 ALERT: ${title}`,
      description: description + (errorMsg ? `\nError: ${errorMsg}` : ''),
      fields: [
        { name: 'Target Endpoint', value: `${monitor.method} ${monitor.url}` },
        { name: 'Checked Status', value: status },
        { name: 'Response Latency', value: `${responseTime}ms` },
        { name: 'Time of Incident', value: new Date().toUTCString() }
      ],
    };

    await dispatchUserAlerts(monitor.userId, alert);
  } catch (err) {
    console.error(`Incident initialization failed for ${monitor.name}:`, err);
  }
}

async function handleMonitorIncidentResolve(monitor: Monitor, responseTime: number) {
  try {
    // Find outstanding open incidents for this monitor
    const openIncident = await prisma.incident.findFirst({
      where: {
        monitorId: monitor.id,
        status: 'OPEN',
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!openIncident) return;

    const resolvedAt = new Date();
    const duration = Math.round((resolvedAt.getTime() - openIncident.startedAt.getTime()) / 1000);

    // Close incident in database
    await prisma.incident.update({
      where: { id: openIncident.id },
      data: {
        status: 'RESOLVED',
        resolvedAt,
        duration,
      },
    });

    // Send recovery alert
    const alert: AlertPayload = {
      type: 'RESOLVED',
      title: `💚 RECOVERY: ${monitor.name} is back UP`,
      description: `The endpoint has successfully returned expected values and is healthy. Outage resolved after ${Math.round(duration / 60)} minutes.`,
      fields: [
        { name: 'Target Endpoint', value: `${monitor.method} ${monitor.url}` },
        { name: 'Recovery Latency', value: `${responseTime}ms` },
        { name: 'Outage Duration', value: `${Math.round(duration / 60)} min (${duration}s)` },
        { name: 'Resolved Time', value: resolvedAt.toUTCString() }
      ],
    };

    await dispatchUserAlerts(monitor.userId, alert);
  } catch (err) {
    console.error(`Incident resolution failed for ${monitor.name}:`, err);
  }
}
