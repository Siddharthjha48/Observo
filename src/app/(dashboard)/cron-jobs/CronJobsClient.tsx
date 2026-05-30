'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddCronModal } from '@/components/dashboard/add-cron-modal';
import { Search, Plus, Copy, Check, ChevronRight, Clock } from 'lucide-react';

interface CronJobData {
  id: string;
  name: string;
  slug: string;
  expectedInterval: number;
  gracePeriod: number;
  status: 'HEALTHY' | 'MISSED' | 'WAITING';
  lastPingAt: string | Date | null;
  isActive: boolean;
}

interface CronJobsClientProps {
  initialCronJobs: CronJobData[];
  plan: 'FREE' | 'PRO';
}

export default function CronJobsClient({
  initialCronJobs,
  plan,
}: CronJobsClientProps) {
  const [cronJobs] = useState<CronJobData[]>(initialCronJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleCopy = (id: string, slug: string) => {
    const pingUrl = `${origin || 'https://observo.dev'}/api/ping/${slug}`;
    navigator.clipboard.writeText(pingUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCronJobs = cronJobs.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-black pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider font-mono">
            Background Cron Jobs
          </h1>
          <p className="text-zinc-600 font-mono text-sm uppercase mt-1">
            Heartbeat monitor tracking background backups, queues, and cron scripts.
          </p>
        </div>
        <div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Cron Job
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
                You are on the Free Plan ({cronJobs.length}/2 cron jobs used)
              </h4>
              <p className="text-xs font-mono uppercase text-zinc-600 mt-0.5">
                Upgrading to Pro unlocks unlimited background cron heartbeats and multi-channel alerts!
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

      {/* Search Bar */}
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="SEARCH BY CRON JOB NAME..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-2 border-black px-4 py-2.5 pl-10 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-zinc-400"
        />
        <Search className="w-5 h-5 text-black absolute left-3 top-3.5" />
      </div>

      {/* Cron Jobs Grid / Table */}
      {filteredCronJobs.length === 0 ? (
        <Card className="py-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-neo-coral/10 border-2 border-black rounded-none flex items-center justify-center shadow-neo-sm">
            <Clock className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase font-mono">
              No Cron Heartbeats Found
            </h3>
            <p className="text-sm font-mono text-zinc-500 uppercase mt-1">
              {searchTerm
                ? 'Try clearing your search query.'
                : 'Get started by creating your very first background heartbeat cron job.'}
            </p>
          </div>
          {!searchTerm && (
            <Button onClick={() => setIsModalOpen(true)} variant="primary">
              Add Cron Job
            </Button>
          )}
        </Card>
      ) : (
        <div className="border-3 border-black shadow-neo-md overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-sm">
              <thead>
                <tr className="bg-black text-white uppercase text-xs font-bold border-b-2 border-black">
                  <th className="p-4">Cron Job</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Expected Interval</th>
                  <th className="p-4 text-center">Grace buffer</th>
                  <th className="p-4">Last heartbeat ping</th>
                  <th className="p-4 text-center">Heartbeat Endpoint</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {filteredCronJobs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-black uppercase">
                      <Link href={`/cron-jobs/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                      {!c.isActive && (
                        <span className="ml-2 bg-zinc-200 text-zinc-600 border border-black text-[10px] px-1 font-bold">
                          PAUSED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Badge
                        status={
                          c.status === 'HEALTHY'
                            ? 'UP'
                            : c.status === 'MISSED'
                            ? 'DOWN'
                            : 'UNKNOWN'
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-center font-bold">
                      {c.expectedInterval} Mins
                    </td>
                    <td className="p-4 text-center font-bold text-zinc-500">
                      +{c.gracePeriod}m
                    </td>
                    <td className="p-4 text-xs font-bold">
                      {c.lastPingAt ? (
                        new Date(c.lastPingAt).toLocaleString()
                      ) : (
                        <span className="text-zinc-400">NEVER PINGED</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        onClick={() => handleCopy(c.id, c.slug)}
                        variant="ghost"
                        className="px-2 py-1 text-xs border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 mx-auto"
                      >
                        {copiedId === c.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </Button>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/cron-jobs/${c.id}`}>
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

      {/* Add Cron Dialog */}
      <AddCronModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
