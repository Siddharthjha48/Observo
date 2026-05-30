'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import {
  Bell,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Mail,
  MessageSquare
} from 'lucide-react';

interface AlertChannelData {
  id: string;
  type: 'DISCORD' | 'SLACK' | 'EMAIL';
  name: string;
  config: any;
  isActive: boolean;
}

interface AlertsClientProps {
  initialChannels: AlertChannelData[];
  plan: 'FREE' | 'PRO';
}

export default function AlertsClient({
  initialChannels,
  plan,
}: AlertsClientProps) {
  const router = useRouter();
  const [channels, setChannels] = useState<AlertChannelData[]>(initialChannels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    type: 'DISCORD',
    webhookUrl: '',
    email: '',
  });

  const channelTypes = [
    { value: 'DISCORD', label: 'Discord Webhook' },
    { value: 'SLACK', label: 'Slack Webhook (Pro Only)' },
    { value: 'EMAIL', label: 'Email Alerts (Pro Only)' },
  ];

  const handleToggle = async (channelId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/alerts/${channelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) throw new Error();
      
      setChannels(
        channels.map((c) => (c.id === channelId ? { ...c, isActive: !currentActive } : c))
      );
      router.refresh();
    } catch {
      alert('Failed to update channel status');
    }
  };

  const handleDelete = async (channelId: string) => {
    if (!confirm('Are you sure you want to remove this alert channel?')) return;

    try {
      const res = await fetch(`/api/alerts/${channelId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();

      setChannels(channels.filter((c) => c.id !== channelId));
      router.refresh();
    } catch {
      alert('Failed to delete alert channel');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const config: any = {};
    if (form.type === 'DISCORD' || form.type === 'SLACK') {
      config.webhookUrl = form.webhookUrl;
    } else {
      config.email = form.email;
    }

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          config,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create channel');

      setIsModalOpen(false);
      setForm({
        name: '',
        type: 'DISCORD',
        webhookUrl: '',
        email: '',
      });
      
      // Add newly created channel to local state
      setChannels([data.alertChannel, ...channels]);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'DISCORD':
        return <MessageSquare className="w-8 h-8 text-black" />;
      case 'SLACK':
        return (
          <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.823 5.043a2.528 2.528 0 0 1-2.52-2.52A2.528 2.528 0 0 1 8.823 0a2.528 2.528 0 0 1 2.52 2.522v2.52h-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.78a2.528 2.528 0 0 1-2.522-2.522V8.824a2.528 2.528 0 0 1 2.522-2.52h5.043zm10.135 3.779a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.52h-2.52v-2.52zm-1.262 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V5.043a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zm-3.778 10.135a2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522 2.528 2.528 0 0 1-2.522-2.522v-2.52h2.522zm0-1.262a2.528 2.528 0 0 1-2.52-2.52v-5.043a2.528 2.528 0 0 1 2.52-2.522h5.043a2.528 2.528 0 0 1 2.522 2.522v5.043a2.528 2.528 0 0 1-2.522 2.52h-5.043z" />
          </svg>
        );
      case 'EMAIL':
        return <Mail className="w-8 h-8 text-black" />;
      default:
        return <Bell className="w-8 h-8 text-black" />;
    }
  };

  const getChannelBadgeColor = (type: string) => {
    switch (type) {
      case 'DISCORD':
        return 'cyan';
      case 'SLACK':
        return 'yellow';
      case 'EMAIL':
        return 'green';
      default:
        return 'white';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-black pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider font-mono">
            Alert Channels Configuration
          </h1>
          <p className="text-zinc-600 font-mono text-sm uppercase mt-1">
            Dispatch server downtime and cron misses instantly to your dev ops team.
          </p>
        </div>
        <div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Connect Channel
          </Button>
        </div>
      </div>

      {/* Grid: Connected Channels */}
      {channels.length === 0 ? (
        <Card className="py-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-neo-yellow/10 border-2 border-black rounded-none flex items-center justify-center shadow-neo-sm">
            <Bell className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase font-mono">
              No Alert Channels Configured
            </h3>
            <p className="text-sm font-mono text-zinc-500 uppercase mt-1">
              Connect Discord webhooks or SMTP emails to receive instant alert pings.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Connect Channel
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {channels.map((chan) => (
            <Card
              key={chan.id}
              className={`flex flex-col justify-between gap-4 relative overflow-hidden transition-all border-2 border-black ${
                chan.isActive ? 'bg-white' : 'bg-slate-50 opacity-70'
              }`}
            >
              {/* Channel Details */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-neo-yellow/10 border border-black p-3.5 shadow-neo-sm">
                    {getChannelIcon(chan.type)}
                  </div>
                  <Badge variant={getChannelBadgeColor(chan.type) as any}>
                    {chan.type}
                  </Badge>
                </div>
                <h3 className="text-lg font-black uppercase font-mono text-black">
                  {chan.name}
                </h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase truncate mt-1">
                  Destination:{' '}
                  {chan.type === 'EMAIL'
                    ? chan.config.email
                    : chan.config.webhookUrl || '—'}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between border-t border-zinc-200 pt-3 mt-2">
                <button
                  onClick={() => handleToggle(chan.id, chan.isActive)}
                  className="font-mono font-bold text-xs uppercase flex items-center gap-1 hover:text-black text-zinc-500 cursor-pointer"
                >
                  {chan.isActive ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-neo-green shrink-0" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-zinc-400 shrink-0" />
                      <span>Disabled</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(chan.id)}
                  className="border-2 border-black bg-white hover:bg-neo-coral p-1.5 transition-all text-xs font-bold leading-none cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                >
                  <Trash2 className="w-4 h-4 text-black" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Alert Channel Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Connect Alert Channel">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-neo-coral/20 border-2 border-black p-3 font-mono font-bold text-xs uppercase text-black">
              ⚠️ Error: {error}
            </div>
          )}

          <Input
            label="Channel Friendly Name"
            placeholder="My Dev Discord Alerts"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Select
            label="Notification Type"
            options={channelTypes}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />

          {/* Conditional inputs */}
          {(form.type === 'DISCORD' || form.type === 'SLACK') ? (
            <Input
              label="Webhook Destination URL"
              placeholder="https://discord.com/api/webhooks/..."
              required
              value={form.webhookUrl}
              onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
            />
          ) : (
            <Input
              label="Target Email Address"
              placeholder="operator@mycompany.com"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          )}

          {plan === 'FREE' && form.type !== 'DISCORD' && (
            <div className="bg-neo-yellow/20 border border-black p-2.5 font-mono text-[10px] uppercase text-black font-bold">
              🔒 Slack and Email notifications require upgrading to the PRO subscription tier. Only Discord Webhooks are enabled on the Free plan.
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || (plan === 'FREE' && form.type !== 'DISCORD')}
            >
              {loading ? 'Connecting...' : 'Connect Channel'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
