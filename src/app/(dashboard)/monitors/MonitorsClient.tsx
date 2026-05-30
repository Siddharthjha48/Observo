'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddMonitorModal } from '@/components/dashboard/add-monitor-modal';
import { Search, Plus, ExternalLink, ChevronRight, Activity } from 'lucide-react';

interface MonitorData {
  id: string;
  name: string;
  url: string;
  method: string;
  interval: number;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  uptimePercent: number | null;
  lastResponseTime: number | null;
  lastCheckedAt: string | Date | null;
  isActive: boolean;
}

interface MonitorsClientProps {
  initialMonitors: MonitorData[];
  plan: 'FREE' | 'PRO';
}

export default function MonitorsClient({
  initialMonitors,
  plan,
}: MonitorsClientProps) {
  const [monitors] = useState<MonitorData[]>(initialMonitors);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UP' | 'DOWN' | 'DEGRADED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMonitors = monitors.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' ? true : m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-black pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider font-mono">
            API Endpoint Monitors
          </h1>
          <p className="text-zinc-600 font-mono text-sm uppercase mt-1">
            Uptime checks, custom latency timeouts, and instant server alerts.
          </p>
        </div>
        <div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Monitor
          </Button>
        </div>
      </div>

      {/* Plan Limits Card (For Free Users) */}
      {plan === 'FREE' && (
        <Card className="bg-neo-yellow/10 border-2 border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">ℹ️</span>
            <div>
              <h4 className="font-black uppercase text-sm font-mono">
                You are on the Free Plan ({monitors.length}/3 monitors used)
              </h4>
              <p className="text-xs font-mono uppercase text-zinc-600 mt-0.5">
                Upgrading to Pro unlocks unlimited endpoints, 1-minute checking, and email alerts!
              </p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" className="text-xs px-3 py-1 bg-white">
              Upgrade
            </Button>
          </Link>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="SEARCH BY NAME OR URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-black px-4 py-2.5 pl-10 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-zinc-400"
          />
          <Search className="w-5 h-5 text-black absolute left-3 top-3.5" />
        </div>

        {/* Filter Status Badge buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'UP', 'DOWN', 'DEGRADED'] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`font-mono text-xs font-black uppercase border-2 border-black px-4 py-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-black text-white translate-x-0.5 translate-y-0.5 shadow-none'
                    : 'bg-white text-black hover:bg-zinc-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monitors List / Table */}
      {filteredMonitors.length === 0 ? (
        <Card className="py-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-neo-yellow/10 border-2 border-black rounded-none flex items-center justify-center shadow-neo-sm">
            <Activity className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase font-mono">
              No Monitors Found
            </h3>
            <p className="text-sm font-mono text-zinc-500 uppercase mt-1">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try clearing your search query or filters.'
                : 'Get started by creating your very first API endpoint monitor.'}
            </p>
          </div>
          {(!searchTerm && statusFilter === 'ALL') && (
            <Button onClick={() => setIsModalOpen(true)} variant="primary">
              Add Monitor
            </Button>
          )}
        </Card>
      ) : (
        <div className="border-3 border-black shadow-neo-md overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-sm">
              <thead>
                <tr className="bg-black text-white uppercase text-xs font-bold border-b-2 border-black">
                  <th className="p-4">Monitor Name</th>
                  <th className="p-4">Target Endpoint</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Interval</th>
                  <th className="p-4 text-center">Uptime</th>
                  <th className="p-4 text-center">Latency</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {filteredMonitors.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-black uppercase">
                      <Link href={`/monitors/${m.id}`} className="hover:underline">
                        {m.name}
                      </Link>
                      {!m.isActive && (
                        <span className="ml-2 bg-zinc-200 text-zinc-600 border border-black text-[10px] px-1 font-bold">
                          PAUSED
                        </span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs truncate text-xs text-zinc-600 uppercase">
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1 inline-flex"
                      >
                        <Badge variant="white" className="text-[10px] py-0 px-1 border-0 mr-1.5 bg-slate-100">
                          {m.method}
                        </Badge>
                        {m.url.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    </td>
                    <td className="p-4 text-center">
                      <Badge status={m.status} />
                    </td>
                    <td className="p-4 text-center font-bold text-xs">
                      {m.interval}M
                    </td>
                    <td className="p-4 text-center font-bold">
                      {m.uptimePercent !== null ? `${m.uptimePercent.toFixed(1)}%` : '100.0%'}
                    </td>
                    <td className="p-4 text-center font-bold text-xs">
                      {m.lastResponseTime !== null ? (
                        <span className={m.lastResponseTime > 1000 ? 'text-neo-coral' : 'text-emerald-600'}>
                          {m.lastResponseTime}ms
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/monitors/${m.id}`}>
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-xs border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 ml-auto"
                        >
                          Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Monitor Dialog */}
      <AddMonitorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
