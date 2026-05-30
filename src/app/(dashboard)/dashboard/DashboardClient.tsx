'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Globe,
  Clock,
  AlertTriangle,
  Heart,
  ChevronRight,
  ShieldCheck,
  Plus,
  Activity
} from 'lucide-react';

interface MonitorStat {
  id: string;
  name: string;
  url: string;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
}

interface CronStat {
  id: string;
  name: string;
  status: 'HEALTHY' | 'MISSED' | 'WAITING';
}

interface IncidentStat {
  id: string;
  title: string;
  type: 'DOWN' | 'DEGRADED' | 'CRON_MISSED';
  status: 'OPEN' | 'RESOLVED';
  startedAt: string;
}

interface DashboardClientProps {
  stats: {
    totalMonitors: number;
    monitorsUp: number;
    openIncidents: number;
    cronJobsHealthy: number;
  };
  recentIncidents: IncidentStat[];
  allMonitors: MonitorStat[];
  allCrons: CronStat[];
}

export default function DashboardClient({
  stats,
  recentIncidents,
  allMonitors,
  allCrons,
}: DashboardClientProps) {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Welcome header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-black pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider font-mono">
            Developer Console Overview
          </h1>
          <p className="text-zinc-600 font-mono text-sm uppercase mt-1">
            Real-time status analysis, availability metrics, and notification dispatch.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/monitors">
            <Button variant="ghost" className="text-xs border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 bg-white">
              <Plus className="w-4 h-4" /> Monitor
            </Button>
          </Link>
          <Link href="/cron-jobs">
            <Button variant="primary" className="text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Cron Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        {/* Total Monitors */}
        <Card className="bg-white border-2 border-black flex items-center gap-4 p-5 hoverEffect">
          <div className="bg-neo-cyan border border-black p-3.5 shrink-0 shadow-neo-sm">
            <Globe className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-bold uppercase">Total Monitors</div>
            <div className="text-2xl font-black">{stats.totalMonitors}</div>
          </div>
        </Card>

        {/* Monitors UP */}
        <Card className="bg-white border-2 border-black flex items-center gap-4 p-5 hoverEffect">
          <div className="bg-neo-green border border-black p-3.5 shrink-0 shadow-neo-sm">
            <Activity className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-bold uppercase">Endpoints UP</div>
            <div className="text-2xl font-black">
              {stats.monitorsUp}
              <span className="text-xs text-zinc-500 font-normal">/{stats.totalMonitors}</span>
            </div>
          </div>
        </Card>

        {/* Open Incidents */}
        <Card className="bg-white border-2 border-black flex items-center gap-4 p-5 hoverEffect">
          <div className={`border border-black p-3.5 shrink-0 shadow-neo-sm ${stats.openIncidents > 0 ? 'bg-neo-coral' : 'bg-neo-green/20'}`}>
            <AlertTriangle className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-bold uppercase">Open Incidents</div>
            <div className={`text-2xl font-black ${stats.openIncidents > 0 ? 'text-neo-coral font-black' : ''}`}>
              {stats.openIncidents}
            </div>
          </div>
        </Card>

        {/* Cron Jobs Healthy */}
        <Card className="bg-white border-2 border-black flex items-center gap-4 p-5 hoverEffect">
          <div className="bg-neo-yellow border border-black p-3.5 shrink-0 shadow-neo-sm">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-zinc-500 text-[10px] font-bold uppercase">Healthy Crons</div>
            <div className="text-2xl font-black">
              {stats.cronJobsHealthy}
              <span className="text-xs text-zinc-500 font-normal">/{allCrons.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Outages and targets listings split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Incidents Log (last 10) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="bg-white border-2 border-black shadow-neo-md p-6 h-full">
            <h3 className="font-black font-mono text-base uppercase tracking-wider mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-neo-coral animate-bounce" />
              <span>Dev Ops Incident Feed</span>
            </h3>

            <div className="flex flex-col gap-4 font-mono">
              {recentIncidents.length === 0 ? (
                <div className="py-16 text-center text-zinc-400 text-xs font-bold uppercase flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-neo-green/10 border border-black flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-black" />
                  </div>
                  <span>🎉 No active outages or heartbeat miss logs.</span>
                </div>
              ) : (
                recentIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="border-2 border-black p-4 bg-slate-50 text-xs uppercase flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-black text-sm">{inc.title}</span>
                        <Badge variant={inc.type === 'DOWN' ? 'coral' : 'yellow'}>
                          {inc.type}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-bold">
                        Triggered: {new Date(inc.startedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Badge variant={inc.status === 'OPEN' ? 'coral' : 'green'}>
                        {inc.status}
                      </Badge>
                      <Link href="/incidents">
                        <button className="border-2 border-black bg-white hover:bg-slate-100 p-1 cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Quick Status widgets list */}
        <div className="flex flex-col gap-6">
          {/* Monitors Quick List */}
          <Card className="bg-white border-2 border-black shadow-neo-md p-6">
            <h3 className="font-black font-mono text-base uppercase tracking-wider mb-4 border-b-2 border-black pb-2">
              🔌 Monitor Status Grid
            </h3>
            <div className="flex flex-col gap-3 font-mono">
              {allMonitors.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 text-xs uppercase font-bold">
                  No monitors added yet.
                </div>
              ) : (
                allMonitors.map((mon) => (
                  <Link
                    key={mon.id}
                    href={`/monitors/${mon.id}`}
                    className="flex items-center justify-between p-2 border border-black hover:bg-slate-50 transition-all text-xs uppercase font-bold bg-slate-50/50"
                  >
                    <span className="truncate max-w-[150px]">{mon.name}</span>
                    <Badge status={mon.status} className="scale-90" />
                  </Link>
                ))
              )}
            </div>
          </Card>

          {/* Cron Jobs Quick List */}
          <Card className="bg-white border-2 border-black shadow-neo-md p-6">
            <h3 className="font-black font-mono text-base uppercase tracking-wider mb-4 border-b-2 border-black pb-2">
              ⏰ Cron heartbeats Grid
            </h3>
            <div className="flex flex-col gap-3 font-mono">
              {allCrons.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 text-xs uppercase font-bold">
                  No crons added yet.
                </div>
              ) : (
                allCrons.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cron-jobs/${c.id}`}
                    className="flex items-center justify-between p-2 border border-black hover:bg-slate-50 transition-all text-xs uppercase font-bold bg-slate-50/50"
                  >
                    <span className="truncate max-w-[150px]">{c.name}</span>
                    <Badge
                      status={
                        c.status === 'HEALTHY'
                          ? 'UP'
                          : c.status === 'MISSED'
                          ? 'DOWN'
                          : 'UNKNOWN'
                      }
                      className="scale-90"
                    >
                      {c.status}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
