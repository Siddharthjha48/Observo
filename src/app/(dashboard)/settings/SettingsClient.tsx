'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Key, Eye, EyeOff, Copy, Check, ShieldAlert, Sparkles, CreditCard } from 'lucide-react';

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: 'FREE' | 'PRO';
    apiKey: string;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [apiKey, setApiKey] = useState(user.apiKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('simulated_upgrade') === 'true') {
      const plan = searchParams.get('plan');
      setAlertMessage(`🎉 Simulating Billing Update: Your developer plan was successfully changed to ${plan}! Limits are now fully reconfigured.`);
    }
  }, [searchParams]);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm('Warning: Rotating your ingest key will break all active webhook connections relying on the previous key. Are you sure you want to proceed?')) {
      return;
    }
    
    setRegenerating(true);
    try {
      const res = await fetch('/api/settings/regenerate', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setApiKey(data.apiKey);
      router.refresh();
      alert('Your API Key has been rotated successfully.');
    } catch {
      alert('Failed to rotate API Key.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Redirect user to Stripe or simulated upgrade landing
      window.location.href = data.url;
    } catch (error: any) {
      alert(error.message || 'Billing portal initialization failed.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-black pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider font-mono">
            Developer Settings
          </h1>
          <p className="text-zinc-600 font-mono text-sm uppercase mt-1">
            Rotate secure ingest credentials, audit billing, and monitor plan availability limits.
          </p>
        </div>
      </div>

      {/* Simulated Alert Notification */}
      {alertMessage && (
        <Card className="bg-neo-green/10 border-2 border-black p-4 font-mono text-xs uppercase text-black font-bold flex items-start gap-3 shadow-neo-sm">
          <span className="text-xl">🚀</span>
          <div>
            <div>{alertMessage}</div>
            <button
              onClick={() => {
                setAlertMessage(null);
                router.push('/settings');
              }}
              className="text-[10px] underline cursor-pointer mt-2 text-zinc-500 font-bold hover:text-black uppercase"
            >
              Clear Notice
            </button>
          </div>
        </Card>
      )}

      {/* API Key management */}
      <Card className="bg-white border-2 border-black shadow-neo-md p-6 flex flex-col gap-4">
        <h3 className="font-black font-mono text-base uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2">
          <Key className="w-5 h-5" />
          <span>Secret API Ingestion Key</span>
        </h3>
        
        <p className="text-xs font-mono text-zinc-500 uppercase leading-relaxed">
          Use this secret key to authorize custom webhook integrations or execute authenticated pings from private networks. Keep it highly protected!
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Key Input Field */}
          <div className="flex-1 relative">
            <input
              type={revealed ? 'text' : 'password'}
              readOnly
              value={apiKey}
              className="w-full border-2 border-black px-4 py-2.5 font-mono text-xs focus:outline-none bg-slate-50 text-black font-bold uppercase rounded-none select-all"
            />
            <button
              onClick={() => setRevealed(!revealed)}
              className="absolute right-3 top-3 text-zinc-500 hover:text-black transition-colors"
            >
              {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Copy action */}
          <Button
            onClick={handleCopy}
            variant="ghost"
            className="flex items-center justify-center gap-1.5 text-xs py-2.5 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" />
                <span>Copy Key</span>
              </>
            )}
          </Button>

          {/* Rotate Key Action */}
          <Button
            onClick={handleRegenerate}
            variant="danger"
            className="flex items-center justify-center gap-1.5 text-xs py-2.5"
            disabled={regenerating}
          >
            <span>{regenerating ? 'Rotating...' : 'Rotate Key'}</span>
          </Button>
        </div>
      </Card>

      {/* Plan and Billing Info */}
      <Card className="bg-white border-2 border-black shadow-neo-md p-6 flex flex-col gap-6">
        <h3 className="font-black font-mono text-base uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          <span>Active Subscription Billing</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs uppercase">
          {/* Current plan card info */}
          <div className="border-2 border-black p-4 bg-slate-50 flex flex-col justify-between gap-3">
            <div>
              <div className="text-zinc-500 text-[10px] font-bold">Active Tier</div>
              <div className="text-2xl font-black mt-1 flex items-center gap-1.5">
                <span>{user.plan}</span>
                <Badge variant={user.plan === 'PRO' ? 'yellow' : 'white'}>
                  {user.plan}
                </Badge>
              </div>
            </div>
            {user.plan === 'FREE' ? (
              <p className="text-[10px] text-zinc-500 leading-normal">
                Standard features, limited monitors.
              </p>
            ) : (
              <p className="text-[10px] text-zinc-600 leading-normal">
                Enjoying unlimited endpoints and checking!
              </p>
            )}
          </div>

          {/* Connected email info */}
          <div className="border-2 border-black p-4 bg-slate-50 flex flex-col justify-between gap-3">
            <div>
              <div className="text-zinc-500 text-[10px] font-bold">Connected Account</div>
              <div className="text-base font-black mt-1.5 truncate text-black">
                {user.name || 'Developer'}
              </div>
              <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                {user.email}
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold">
              User ID: {user.id.substring(0, 10)}...
            </span>
          </div>

          {/* Actions Billing Upgrade/Downgrade Button */}
          <div className="border-2 border-black p-4 bg-slate-50 flex flex-col justify-between gap-4">
            <div>
              <div className="text-zinc-500 text-[10px] font-bold">Subscription Action</div>
              <p className="text-[10px] text-zinc-500 leading-normal mt-1">
                {user.plan === 'FREE'
                  ? 'Unlock unlimited crons and checking intervals.'
                  : 'Manage billing parameters or close subscription.'}
              </p>
            </div>
            <Button
              onClick={handleUpgrade}
              variant={user.plan === 'FREE' ? 'primary' : 'ghost'}
              className="py-2 text-xs text-center justify-center border-2"
              disabled={loading}
            >
              {loading ? (
                'Syncing...'
              ) : user.plan === 'FREE' ? (
                'Upgrade to Pro'
              ) : (
                'Toggle Pro (Free Demo)'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
