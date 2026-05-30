'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import ResponseChart from '@/components/dashboard/response-chart';
import {
  ArrowLeft,
  Trash2,
  Play,
  Pause,
  Edit3,
  Globe,
  Clock,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface CheckData {
  id: string;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  responseTime: number | null;
  statusCode: number | null;
  error: string | null;
  checkedAt: string;
}

interface IncidentData {
  id: string;
  type: 'DOWN' | 'DEGRADED' | 'CRON_MISSED';
  title: string;
  description: string | null;
  status: 'OPEN' | 'RESOLVED';
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
}

interface MonitorDetail {
  id: string;
  name: string;
  url: string;
  method: string;
  interval: number;
  timeout: number;
  expectedStatus: number;
  maxResponseTime: number;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  uptimePercent: number | null;
  lastResponseTime: number | null;
  lastCheckedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface MonitorDetailClientProps {
  monitor: MonitorDetail;
  checks: CheckData[];
  incidents: IncidentData[];
  chartData: { time: string; latency: number }[];
  uptimeHistory: { day: string; isHealthy: boolean; count: number }[];
}

export default function MonitorDetailClient({
  monitor,
  checks: initialChecks,
  incidents,
  chartData,
  uptimeHistory,
}: MonitorDetailClientProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(monitor.isActive);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: monitor.name,
    url: monitor.url,
    method: monitor.method,
    interval: String(monitor.interval),
    timeout: String(monitor.timeout),
    expectedStatus: String(monitor.expectedStatus),
    maxResponseTime: String(monitor.maxResponseTime),
  });

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/monitors/${monitor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      setIsActive(!isActive);
      router.refresh();
    } catch {
      alert('Failed to update monitor status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you absolutely sure you want to delete this monitor and all its check history?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/monitors/${monitor.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      router.push('/monitors');
      router.refresh();
    } catch {
      alert('Failed to delete monitor');
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/monitors/${monitor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          url: form.url,
          method: form.method,
          interval: parseInt(form.interval),
          timeout: parseInt(form.timeout),
          expectedStatus: parseInt(form.expectedStatus),
          maxResponseTime: parseInt(form.maxResponseTime),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update monitor');

      setIsEditOpen(false);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message || 'Error updating monitor settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back button and page actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-black pb-6">
        <div className="flex items-center gap-4">
          <Link href="/monitors">
            <button className="border-2 border-black bg-white hover:bg-slate-50 p-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black uppercase tracking-wider font-mono">
                {monitor.name}
              </h1>
              <Badge status={monitor.status} />
              {!isActive && (
                <span className="bg-zinc-200 border border-black text-[10px] px-2 py-0.5 font-bold font-mono">
                  PAUSED
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-zinc-500 uppercase mt-1">
              Target: {monitor.method} {monitor.url}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleToggleActive}
            variant="ghost"
            className="flex items-center gap-2 text-xs"
            disabled={loading}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" /> Pause checks
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Resume checks
              </>
            )}
          </Button>

          <Button
            onClick={() => setIsEditOpen(true)}
            variant="primary"
            className="flex items-center gap-2 text-xs"
            disabled={loading}
          >
            <Edit3 className="w-4 h-4" /> Edit
          </Button>

          <Button
            onClick={handleDelete}
            variant="danger"
            className="flex items-center gap-2 text-xs"
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Grid: Status widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-2 border-black flex items-center gap-4">
          <div className="bg-neo-yellow border border-black p-3 shrink-0">
            <Globe className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-mono uppercase font-bold">Uptime</div>
            <div className="text-2xl font-black font-mono">
              {monitor.uptimePercent !== null ? `${monitor.uptimePercent.toFixed(2)}%` : '100.00%'}
            </div>
          </div>
        </Card>

        <Card className="bg-white border-2 border-black flex items-center gap-4">
          <div className="bg-neo-coral border border-black p-3 shrink-0">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-mono uppercase font-bold">Latency</div>
            <div className="text-2xl font-black font-mono">
              {monitor.lastResponseTime !== null ? `${monitor.lastResponseTime}ms` : '—'}
            </div>
          </div>
        </Card>

        <Card className="bg-white border-2 border-black flex items-center gap-4">
          <div className="bg-neo-cyan border border-black p-3 shrink-0">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-mono uppercase font-bold">Interval</div>
            <div className="text-2xl font-black font-mono">{monitor.interval} Min</div>
          </div>
        </Card>

        <Card className="bg-white border-2 border-black flex items-center gap-4">
          <div className="bg-slate-100 border border-black p-3 shrink-0">
            <Activity className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-mono uppercase font-bold">Expected Code</div>
            <div className="text-2xl font-black font-mono">{monitor.expectedStatus}</div>
          </div>
        </Card>
      </div>

      {/* Latency Chart */}
      <Card className="bg-white border-2 border-black shadow-neo-md p-6">
        <h3 className="font-black font-mono text-base uppercase tracking-wider mb-6 border-b-2 border-black pb-2 flex items-center gap-2">
          <span>📉 Latency Response History (Last 24 Hours)</span>
        </h3>
        <ResponseChart data={chartData} />
      </Card>

      {/* 7 Day Status Grid */}
      <Card className="bg-white border-2 border-black shadow-neo-md p-6">
        <h3 className="font-black font-mono text-base uppercase tracking-wider mb-6 border-b-2 border-black pb-2">
          📅 Daily Health & Checks (Last 7 Days)
        </h3>
        <div className="grid grid-cols-7 gap-2 text-center font-mono">
          {uptimeHistory.map((day) => (
            <div key={day.day} className="flex flex-col gap-2">
              <div
                className={`border-2 border-black h-16 flex items-center justify-center font-bold uppercase text-xs ${
                  day.count === 0
                    ? 'bg-zinc-100 text-zinc-400 border-dashed'
                    : day.isHealthy
                    ? 'bg-neo-green text-black'
                    : 'bg-neo-coral text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {day.count === 0 ? '—' : day.isHealthy ? 'OK' : 'FAIL'}
              </div>
              <span className="text-[10px] font-bold text-zinc-500">{day.day}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Grid: Incident Log and check history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check History */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="bg-white border-2 border-black shadow-neo-md p-6">
            <h3 className="font-black font-mono text-base uppercase tracking-wider mb-4 border-b-2 border-black pb-2">
              📋 Uptime Checked History (Last 50)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-black uppercase text-zinc-500">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 text-center">Code</th>
                    <th className="pb-2 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {initialChecks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-400 font-bold uppercase">
                        No check records found.
                      </td>
                    </tr>
                  ) : (
                    initialChecks.map((check) => (
                      <tr key={check.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 text-zinc-600">
                          {new Date(check.checkedAt).toLocaleString()}
                        </td>
                        <td className="py-2 text-center">
                          <Badge status={check.status} />
                        </td>
                        <td className="py-2 text-center font-bold">
                          {check.statusCode || '—'}
                        </td>
                        <td className="py-2 text-right font-bold">
                          {check.responseTime !== null ? `${check.responseTime}ms` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Incidents feed */}
        <Card className="bg-white border-2 border-black shadow-neo-md p-6">
          <h3 className="font-black font-mono text-base uppercase tracking-wider mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-neo-coral" />
            <span>Outage Log</span>
          </h3>
          <div className="flex flex-col gap-4 font-mono">
            {incidents.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs font-bold uppercase">
                🎉 No active or historical incidents.
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="border-2 border-black p-3 bg-slate-50 text-xs uppercase"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-black">{inc.title}</span>
                    <Badge variant={inc.status === 'OPEN' ? 'coral' : 'green'}>
                      {inc.status}
                    </Badge>
                  </div>
                  <div className="text-zinc-500 text-[10px]">
                    Started: {new Date(inc.startedAt).toLocaleString()}
                  </div>
                  {inc.resolvedAt && (
                    <div className="text-zinc-500 text-[10px]">
                      Resolved: {new Date(inc.resolvedAt).toLocaleString()}
                    </div>
                  )}
                  {inc.duration && (
                    <div className="text-zinc-600 font-bold mt-1 text-[10px]">
                      Duration: {Math.round(inc.duration / 60)} Min
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Edit Settings Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Monitor Settings">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          {editError && (
            <div className="bg-neo-coral/20 border-2 border-black p-3 font-mono font-bold text-xs uppercase text-black">
              ⚠️ Error: {editError}
            </div>
          )}

          <Input
            label="Monitor Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Endpoint URL"
            required
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="HTTP Method"
              options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'DELETE', label: 'DELETE' },
                { value: 'PATCH', label: 'PATCH' },
              ]}
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
            />

            <Select
              label="Check Interval"
              options={[
                { value: '1', label: '1 Minute (Pro Only)' },
                { value: '5', label: '5 Minutes (Pro Only)' },
                { value: '10', label: '10 Minutes' },
                { value: '30', label: '30 Minutes' },
                { value: '60', label: '60 Minutes (1 Hour)' },
              ]}
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Exp. Status"
              type="number"
              required
              value={form.expectedStatus}
              onChange={(e) => setForm({ ...form, expectedStatus: e.target.value })}
            />

            <Input
              label="Timeout (s)"
              type="number"
              required
              value={form.timeout}
              onChange={(e) => setForm({ ...form, timeout: e.target.value })}
            />

            <Input
              label="Max Delay (ms)"
              type="number"
              required
              value={form.maxResponseTime}
              onChange={(e) => setForm({ ...form, maxResponseTime: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
