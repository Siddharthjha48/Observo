'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, ShieldCheck, ChevronRight, Activity, Clock } from 'lucide-react';

interface IncidentData {
  id: string;
  monitorId: string | null;
  cronJobId: string | null;
  monitorName: string | null;
  cronJobName: string | null;
  type: 'DOWN' | 'DEGRADED' | 'CRON_MISSED';
  title: string;
  description: string | null;
  status: 'OPEN' | 'RESOLVED';
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
}

interface IncidentsClientProps {
  initialIncidents: IncidentData[];
}

export default function IncidentsClient({
  initialIncidents,
}: IncidentsClientProps) {
  const [incidents] = useState<IncidentData[]>(initialIncidents);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DOWN' | 'DEGRADED' | 'CRON_MISSED'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.description && inc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.monitorName && inc.monitorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.cronJobName && inc.cronJobName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' ? true : inc.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' ? true : inc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getIncidentBadge = (type: string) => {
    switch (type) {
      case 'DOWN':
        return <Badge variant="coral">OUTAGE</Badge>;
      case 'DEGRADED':
        return <Badge variant="yellow">DEGRADED</Badge>;
      case 'CRON_MISSED':
        return <Badge variant="cyan">CRON MISS</Badge>;
      default:
        return <Badge variant="white">{type}</Badge>;
    }
  };

  const getSourceLink = (inc: IncidentData) => {
    if (inc.monitorId) {
      return (
        <Link
          href={`/monitors/${inc.monitorId}`}
          className="hover:underline text-xs flex items-center gap-1 font-bold text-zinc-500 hover:text-black mt-1 uppercase"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Monitor: {inc.monitorName}</span>
        </Link>
      );
    }
    if (inc.cronJobId) {
      return (
        <Link
          href={`/cron-jobs/${inc.cronJobId}`}
          className="hover:underline text-xs flex items-center gap-1 font-bold text-zinc-500 hover:text-black mt-1 uppercase"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Cron: {inc.cronJobName}</span>
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-black pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider font-mono">
            Incident History Log
          </h1>
          <p className="text-zinc-600 font-mono text-sm uppercase mt-1">
            Centralized ledger tracking current outages, degraded response events, and missed cron runs.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="SEARCH BY TITLE, INCIDENT DETAILS OR NAME..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-black px-4 py-2.5 pl-10 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-zinc-400"
          />
          <Search className="w-5 h-5 text-black absolute left-3 top-3.5" />
        </div>

        <div className="flex flex-wrap gap-4 shrink-0">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase">Status:</span>
            <div className="flex border-2 border-black bg-white">
              {(['ALL', 'OPEN', 'RESOLVED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-r border-black last:border-r-0 cursor-pointer ${
                    statusFilter === status ? 'bg-black text-white' : 'hover:bg-slate-50 text-black'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase">Type:</span>
            <div className="flex border-2 border-black bg-white">
              {(['ALL', 'DOWN', 'DEGRADED', 'CRON_MISSED'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-r border-black last:border-r-0 cursor-pointer ${
                    typeFilter === type ? 'bg-black text-white' : 'hover:bg-slate-50 text-black'
                  }`}
                >
                  {type === 'ALL' ? 'ALL' : type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Incident List */}
      {filteredIncidents.length === 0 ? (
        <Card className="py-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-neo-green/10 border-2 border-black rounded-none flex items-center justify-center shadow-neo-sm animate-pulse">
            <ShieldCheck className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase font-mono">
              All Systems Operational
            </h3>
            <p className="text-sm font-mono text-zinc-500 uppercase mt-1">
              No current open or resolved incidents match your filter selections.
            </p>
          </div>
        </Card>
      ) : (
        <div className="border-3 border-black shadow-neo-md bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-sm">
              <thead>
                <tr className="bg-black text-white uppercase text-xs font-bold border-b-2 border-black">
                  <th className="p-4">Incident Log</th>
                  <th className="p-4">Affected Source</th>
                  <th className="p-4 text-center">Type</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Outage Duration</th>
                  <th className="p-4">Date Triggered</th>
                  <th className="p-4 text-right">Source Link</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                    {/* Incident title and details */}
                    <td className="p-4 font-black max-w-sm uppercase">
                      <div>{inc.title}</div>
                      {inc.description && (
                        <div className="text-[10px] text-zinc-500 mt-1 uppercase font-normal leading-normal line-clamp-2">
                          {inc.description}
                        </div>
                      )}
                    </td>

                    {/* Affected resource details */}
                    <td className="p-4 font-bold text-xs">
                      {getSourceLink(inc)}
                    </td>

                    {/* Incident Type Badge */}
                    <td className="p-4 text-center">
                      {getIncidentBadge(inc.type)}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      <Badge variant={inc.status === 'OPEN' ? 'coral' : 'green'}>
                        {inc.status}
                      </Badge>
                    </td>

                    {/* Duration calculation */}
                    <td className="p-4 text-center font-bold text-xs">
                      {inc.duration !== null ? (
                        <span>
                          {Math.round(inc.duration / 60)} Mins ({inc.duration}s)
                        </span>
                      ) : inc.status === 'OPEN' ? (
                        <span className="text-neo-coral font-black animate-pulse">ONGOING</span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>

                    {/* Time triggered */}
                    <td className="p-4 text-xs font-bold">
                      {new Date(inc.startedAt).toLocaleString()}
                    </td>

                    {/* Source details navigation action */}
                    <td className="p-4 text-right">
                      {inc.monitorId ? (
                        <Link href={`/monitors/${inc.monitorId}`}>
                          <button className="border-2 border-black bg-white hover:bg-slate-100 p-1.5 transition-all text-xs font-bold leading-none cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none ml-auto">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </Link>
                      ) : inc.cronJobId ? (
                        <Link href={`/cron-jobs/${inc.cronJobId}`}>
                          <button className="border-2 border-black bg-white hover:bg-slate-100 p-1.5 transition-all text-xs font-bold leading-none cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none ml-auto">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </Link>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
