import React from 'react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Clock,
  Sparkles,
  Zap,
  Activity,
  Bell,
  Check,
  ShieldAlert,
  ArrowRight,
  Eye
} from 'lucide-react';

export default async function LandingPage() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const isPlaceholder = !secretKey || secretKey.startsWith('sk_test_...') || secretKey === '...';

  let userId: string | null = null;
  if (!isPlaceholder) {
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch {
      userId = null;
    }
  } else {
    // Local Developer Preview Mode: Automatically simulate logged-in developer
    userId = 'mock_developer_clerk_id';
  }

  const steps = [
    {
      num: '01',
      title: 'Hook Up Endpoints',
      desc: 'Plug in your HTTP APIs or track background cron scripts using a curl heartbeat ping.',
    },
    {
      num: '02',
      title: '24/7 Active Watch',
      desc: 'We query your servers every 60 seconds, logging response latencies and Upstash TTL states.',
    },
    {
      num: '03',
      title: 'Instant Dev Alerts',
      desc: 'If something breaks, we dispatch rich webhook embeds to Slack, Discord, and SMTP emails instantly.',
    },
  ];

  const features = [
    {
      icon: Globe,
      title: 'Uptime Checking',
      desc: 'Native HTTP/S endpoint query pings with abort signal timeouts and precise status matching.',
    },
    {
      icon: Clock,
      title: 'Cron Tracking',
      desc: 'REST heartbeats using Upstash Redis. Detect backup or job queue silences with smart grace windows.',
    },
    {
      icon: Bell,
      title: 'Multi-Channel Alerts',
      desc: 'Connected Discord, Slack, and email notifications to keep operations teams updated.',
    },
    {
      icon: Sparkles,
      title: 'AI Weekly Digest',
      desc: 'Incidents log compilation, root cause analysis assumptions, and recommendations by Gemini.',
    },
    {
      icon: Zap,
      title: 'Latency Analytics',
      desc: 'Visual response time line charts and availability graphs to pinpoint slow response spikes.',
    },
    {
      icon: ShieldAlert,
      title: 'Incident Logs',
      desc: 'Unified operational outages feed tracking historical down times, resolutions, and recovery states.',
    },
  ];

  // Simulated status grid for gorgeous neobrutalism mockup
  const mockUptimeBlocks = Array.from({ length: 48 }, (_, i) => {
    if (i === 12 || i === 31) return 'DOWN';
    if (i === 24 || i === 40) return 'DEGRADED';
    return 'UP';
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-black font-mono">
      {/* 1. Brand Navbar */}
      <header className="border-b-3 border-black bg-white sticky top-0 z-50 select-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-1.5 border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <Eye className="w-5 h-5 text-neo-yellow" />
            </div>
            <span className="font-black text-xl uppercase tracking-wider">
              OBSERVO
            </span>
          </div>

          <div className="flex items-center gap-4">
            {userId ? (
              <Link href="/dashboard">
                <Button variant="primary" className="text-xs px-4 py-2">
                  Console Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <button className="font-bold text-xs uppercase tracking-wider hover:underline mr-2 cursor-pointer">
                    Log In
                  </button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="primary" className="text-xs px-4 py-2">
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="border-b-3 border-black py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Callouts */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-neo-coral border-2 border-black inline-block self-start px-3 py-1 font-bold text-xs uppercase shadow-neo-sm">
              ⚡️ UPTIME & CRON HEARTBEAT MONITORING
            </div>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none text-black">
              YOUR APP NEVER SLEEPS.<br/>
              <span className="bg-neo-yellow px-2 inline-block border-2 border-black my-1 shadow-neo-sm">NEITHER DO WE.</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-700 leading-relaxed max-w-xl font-sans font-medium">
              Observo is the ultimate developer monitor. Watch your REST endpoints, track background backups and cron heartbeat checks with Upstash Redis, connect Slack/Discord webhooks, and get weekly automated DevOps reviews using Google Gemini AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              {userId ? (
                <Link href="/dashboard">
                  <Button variant="primary" className="flex items-center gap-2 py-3.5 text-sm w-full sm:w-auto justify-center">
                    Go to Dev Console <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up">
                    <Button variant="primary" className="flex items-center gap-2 py-3.5 text-sm w-full sm:w-auto justify-center">
                      Get Started Free <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="ghost" className="py-3.5 text-sm w-full sm:w-auto justify-center">
                      See Demo Console
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Hero Interactive Mockup */}
          <div className="lg:col-span-5">
            <Card className="border-3 border-black bg-white shadow-neo-lg p-0 overflow-hidden">
              <div className="bg-black text-white p-3 flex items-center justify-between border-b-3 border-black">
                <span className="font-bold text-xs uppercase tracking-widest text-neo-yellow">
                  ● MONITOR_SIMULATOR.EXE
                </span>
                <span className="text-[10px] text-zinc-400">ACTIVE: 100%</span>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div className="font-black text-sm uppercase">my-backend-api</div>
                  <Badge status="UP" />
                </div>
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div className="font-black text-sm uppercase">db-backup-cron</div>
                  <Badge status="HEALTHY" />
                </div>
                
                {/* Uptime Blocks Simulation Grid */}
                <div className="mt-2">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Availability: 99.86%</div>
                  <div className="grid grid-cols-12 gap-1.5">
                    {mockUptimeBlocks.map((status, idx) => {
                      const color =
                        status === 'UP'
                          ? 'bg-neo-green'
                          : status === 'DOWN'
                          ? 'bg-neo-coral'
                          : 'bg-neo-yellow';
                      return (
                        <div
                          key={idx}
                          className={`${color} border border-black aspect-square transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:scale-110`}
                          title={`Status Check: ${status}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* 3. Infinite Marquee banner */}
      <div className="bg-black text-white border-b-3 border-black py-4 overflow-hidden relative select-none">
        <div className="flex whitespace-nowrap gap-8 font-black uppercase text-sm tracking-widest">
          <div className="flex shrink-0 gap-8 animate-marquee">
            <span>● 24/7 ACTIVE API WATCH</span>
            <span>● UPSTASH REDIS TTL CRONS</span>
            <span>● DISCORD WEBHOOK ALERTS</span>
            <span>● SLACK CHANNELS CONNECTED</span>
            <span>● GEMINI AI DIGEST GENERATOR</span>
            <span>● STRIPE READY SUBSCRIPTIONS</span>
            <span>● 100% VERCEL COMPATIBLE</span>
          </div>
          <div className="flex shrink-0 gap-8 animate-marquee" aria-hidden="true">
            <span>● 24/7 ACTIVE API WATCH</span>
            <span>● UPSTASH REDIS TTL CRONS</span>
            <span>● DISCORD WEBHOOK ALERTS</span>
            <span>● SLACK CHANNELS CONNECTED</span>
            <span>● GEMINI AI DIGEST GENERATOR</span>
            <span>● STRIPE READY SUBSCRIPTIONS</span>
            <span>● 100% VERCEL COMPATIBLE</span>
          </div>
        </div>
      </div>

      {/* 4. How It Works Section */}
      <section className="border-b-3 border-black py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col items-center gap-2">
            <Badge variant="yellow">OPERATIONS</Badge>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-black mt-2">
              HOW IT WORKS
            </h2>
            <p className="text-xs text-zinc-500 uppercase mt-1">
              Three simple steps to secure your server uptime and script health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <Card key={idx} className="border-3 border-black bg-white shadow-neo-md p-8 relative flex flex-col gap-4">
                <div className="absolute top-4 right-6 font-black font-mono text-5xl text-neo-yellow/30 border-2 border-black/10 px-2 py-0.5 select-none">
                  {step.num}
                </div>
                <h3 className="text-lg font-black uppercase font-mono mt-4 text-black border-b-2 border-black pb-2">
                  {step.title}
                </h3>
                <p className="text-xs font-mono uppercase leading-relaxed text-zinc-600">
                  {step.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Features Grid Section */}
      <section className="border-b-3 border-black py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col items-center gap-2">
            <Badge variant="coral">SYSTEM HIGHLIGHTS</Badge>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-black mt-2">
              PLATFORM FEATURES
            </h2>
            <p className="text-xs text-zinc-500 uppercase mt-1">
              Everything developers need to audit and maintain their systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Card key={idx} className="border-2 border-black p-6 hoverEffect bg-white">
                  <div className="bg-neo-yellow border-2 border-black p-3.5 inline-block mb-4 shadow-neo-sm">
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-base font-black uppercase font-mono text-black mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs font-mono uppercase leading-relaxed text-zinc-500">
                    {feat.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section className="border-b-3 border-black py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col items-center gap-2">
            <Badge variant="cyan">PRICING PLANS</Badge>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-black mt-2">
              CHOOSE YOUR TIER
            </h2>
            <p className="text-xs text-zinc-500 uppercase mt-1">
              Affordable plans built to scale with solo devs and robust production teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free plan card */}
            <Card className="border-3 border-black bg-white shadow-neo-md p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black uppercase font-mono text-black">FREE TIER</h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1">For side projects</p>
                  </div>
                  <div className="text-3xl font-black font-mono text-black">$0</div>
                </div>

                <ul className="flex flex-col gap-4 font-mono text-xs uppercase mb-8 border-t border-zinc-200 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>3 Endpoint monitors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>2 background cron heartbeats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>10-Minute checking interval</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 Active channel (Discord)</span>
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400 line-through">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Weekly AI DevOps summaries</span>
                  </li>
                </ul>
              </div>

              <Link href="/sign-up">
                <Button variant="ghost" fullWidth className="py-3 bg-white">
                  Join Free
                </Button>
              </Link>
            </Card>

            {/* Pro plan card */}
            <Card className="border-3 border-black bg-neo-yellow shadow-neo-lg p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-black text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 border border-black shadow-[2px_2px_0px_0px_rgba(255,255,0,1)] select-none">
                POPULAR TIER
              </div>
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black uppercase font-mono text-black">PRO PLAN</h3>
                    <p className="text-[10px] text-zinc-700 uppercase mt-1">For active applications</p>
                  </div>
                  <div className="text-3xl font-black font-mono text-black">$9<span className="text-sm font-bold">/MO</span></div>
                </div>

                <ul className="flex flex-col gap-4 font-mono text-xs uppercase mb-8 border-t border-black pt-6">
                  <li className="flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4 text-black shrink-0 border border-black bg-white" />
                    <span>Unlimited Endpoint monitors</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4 text-black shrink-0 border border-black bg-white" />
                    <span>Unlimited cron heartbeats</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4 text-black shrink-0 border border-black bg-white" />
                    <span>1-Minute checking interval</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4 text-black shrink-0 border border-black bg-white" />
                    <span>Unlimited connected channels</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4 text-black shrink-0 border border-black bg-white" />
                    <span>Gemini AI Weekly digest reports</span>
                  </li>
                </ul>
              </div>

              <Link href="/sign-up">
                <Button variant="primary" fullWidth className="py-3 bg-black text-white hover:bg-zinc-800">
                  Upgrade to Pro
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-black text-white py-12 select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-white text-black p-1">
                <Eye className="w-5 h-5 text-neo-yellow" />
              </div>
              <span className="font-black text-xl uppercase tracking-widest text-neo-yellow">
                OBSERVO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">
              The premium Neobrutalist developer monitoring SaaS platform. Always watching.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-neo-yellow hover:underline transition-colors">
              GitHub Repo
            </a>
            <span className="text-zinc-600">|</span>
            <a href="#" className="hover:text-neo-yellow hover:underline transition-colors">
              Developer Docs
            </a>
            <span className="text-zinc-600">|</span>
            <Link href="/dashboard" className="hover:text-neo-yellow hover:underline transition-colors">
              Dashboard Console
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
          <span>© 2026 OBSERVO INC. ALL RIGHTS RESERVED.</span>
          <span>BUILT FOR HACKERS & DEVS WORLDWIDE.</span>
        </div>
      </footer>
    </div>
  );
}
