'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  ArrowLeft,
  Trash2,
  Play,
  Pause,
  Edit3,
  Copy,
  Check,
  Clock,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface PingData {
  id: string;
  pingAt: string;
  note: string | null;
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

interface CronJobDetail {
  id: string;
  name: string;
  slug: string;
  expectedInterval: number;
  gracePeriod: number;
  status: 'HEALTHY' | 'MISSED' | 'WAITING';
  lastPingAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface CronJobDetailClientProps {
  cronJob: CronJobDetail;
  pings: PingData[];
  incidents: IncidentData[];
}

export default function CronJobDetailClient({
  cronJob,
  pings,
  incidents,
}: CronJobDetailClientProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(cronJob.isActive);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: cronJob.name,
    expectedInterval: String(cronJob.expectedInterval),
    gracePeriod: String(cronJob.gracePeriod),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleCopy = () => {
    const pingUrl = `${origin || 'https://observo.dev'}/api/ping/${cronJob.slug}`;
    navigator.clipboard.writeText(pingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cron-jobs/${cronJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      setIsActive(!isActive);
      router.refresh();
    } catch {
      alert('Failed to update active state');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you absolutely sure you want to delete this cron job heartbeat?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cron-jobs/${cronJob.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      router.push('/cron-jobs');
      router.refresh();
    } catch {
      alert('Failed to delete cron job');
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/cron-jobs/${cronJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          expectedInterval: parseInt(form.expectedInterval),
          gracePeriod: parseInt(form.gracePeriod),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update cron job settings');

      setIsEditOpen(false);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message || 'Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const pingUrl = `${origin || 'https://observo.dev'}/api/ping/${cronJob.slug}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Back navigation and header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-black pb-6">
        <div className="flex items-center gap-4">
          <Link href="/cron-jobs">
            <button className="border-2 border-black bg-white hover:bg-slate-50 p-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black uppercase tracking-wider font-mono">
                {cronJob.name}
              </h1>
              <Badge
                status={
                  cronJob.status === 'HEALTHY'
                    ? 'UP'
                    : cronJob.status === 'MISSED'
                    ? 'DOWN'
                    : 'UNKNOWN'
                }
              >
                {cronJob.status}
              </Badge>
              {!isActive && (
                <span className="bg-zinc-200 border border-black text-[10px] px-2 py-0.5 font-bold font-mono">
                  PAUSED
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-zinc-500 uppercase mt-1">
              Heartbeat monitor slug: {cronJob.slug}
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

      {/* Heartbeat ping instructions card */}
      <Card className="bg-neo-yellow/5 border-2 border-black p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-black font-mono text-lg uppercase tracking-wide">
            Your Ping Heartbeat Endpoint
          </h3>
          <p className="text-xs font-mono text-zinc-600 uppercase leading-relaxed max-w-2xl">
            To watch this job, send an HTTP POST request to this unique URL at the end of your cron script or background worker. If Observo doesn't receive a ping within {cronJob.expectedInterval + cronJob.gracePeriod} minutes (Interval + Grace buffer), we'll dispatch instant alerts!
          </p>
          <div className="mt-2 flex items-center bg-white border-2 border-black p-3 font-mono text-xs text-black font-bold uppercase overflow-x-auto shadow-neo-sm">
            curl -X POST {pingUrl}
          </div>
        </div>
        <Button
          onClick={handleCopy}
          variant="primary"
          className="shrink-0 flex items-center gap-2 self-start md:self-center"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-emerald-600" />
              <span>Copied Link</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Copy curl</span>
            </>
          )}
        </Button>
      </Card>

      {/* Grid: Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-2 border-black flex items-center gap-4">
          <div className="bg-neo-yellow border border-black p-3 shrink-0">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-mono uppercase font-bold">Expected Interval</div>
            <div className="text-xl font-black font-mono">{cronJob.expectedInterval} Minutes</div>
          </div>
        </Card>

        <Card className="bg-white border-2 border-black flex items-center gap-4">
          <div className="bg-neo-coral border border-black p-3 shrink-0">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-mono uppercase font-bold">Grace buffer</div>
            <div className="text-xl font-black font-mono">+{cronJob.gracePeriod} Min Overdue</div>
          </div>
        </Card>

        <Card className="bg-white border-2 border-black flex items-center gap-4">
          <div className="bg-neo-cyan border border-black p-3 shrink-0">
            <Activity className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-mono uppercase font-bold">Last Ping Recorded</div>
            <div className="text-xs font-black font-mono">
              {cronJob.lastPingAt ? new Date(cronJob.lastPingAt).toLocaleString() : 'NEVER PINGED'}
            </div>
          </div>
        </Card>
      </div>

      {/* Outages and Pings History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ping History */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="bg-white border-2 border-black shadow-neo-md p-6">
            <h3 className="font-black font-mono text-base uppercase tracking-wider mb-4 border-b-2 border-black pb-2">
              📋 Heartbeat Ping Log (Last 50)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-black uppercase text-zinc-500">
                    <th className="pb-2">Ping Timestamp</th>
                    <th className="pb-2">Attached Details</th>
                    <th className="pb-2 text-right">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {pings.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-zinc-400 font-bold uppercase">
                        No heartbeat pings received yet.
                      </td>
                    </tr>
                  ) : (
                    pings.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 text-zinc-600">
                          {new Date(p.pingAt).toLocaleString()}
                        </td>
                        <td className="py-2 text-zinc-500 italic">
                          {p.note || 'None'}
                        </td>
                        <td className="py-2 text-right font-black text-neo-yellow bg-black px-1.5 py-0.5 inline-block text-[9px]">
                          POST
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Miss incidents feed */}
        <Card className="bg-white border-2 border-black shadow-neo-md p-6">
          <h3 className="font-black font-mono text-base uppercase tracking-wider mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-neo-coral" />
            <span>Miss Alert Log</span>
          </h3>
          <div className="flex flex-col gap-4 font-mono">
            {incidents.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs font-bold uppercase">
                🎉 No missed heartbeat alerts recorded.
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
                    Missed at: {new Date(inc.startedAt).toLocaleString()}
                  </div>
                  {inc.resolvedAt && (
                    <div className="text-zinc-500 text-[10px]">
                      Ping recovered: {new Date(inc.resolvedAt).toLocaleString()}
                    </div>
                  )}
                  {inc.duration && (
                    <div className="text-zinc-600 font-bold mt-1 text-[10px]">
                      Missed period: {Math.round(inc.duration / 60)} Min
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Edit Settings Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Cron Job Settings">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          {editError && (
            <div className="bg-neo-coral/20 border-2 border-black p-3 font-mono font-bold text-xs uppercase text-black">
              ⚠️ Error: {editError}
            </div>
          )}

          <Input
            label="Cron Job Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Interval (mins)"
              type="number"
              required
              value={form.expectedInterval}
              onChange={(e) => setForm({ ...form, expectedInterval: e.target.value })}
            />

            <Input
              label="Grace Period (mins)"
              type="number"
              required
              value={form.gracePeriod}
              onChange={(e) => setForm({ ...form, gracePeriod: e.target.value })}
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
