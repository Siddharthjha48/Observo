'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Activity,
  Clock,
  AlertTriangle,
  Bell,
  Sparkles,
  Settings,
  Eye
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Monitors', href: '/monitors', icon: Activity },
    { name: 'Cron Jobs', href: '/cron-jobs', icon: Clock },
    { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'AI Digest', href: '/ai-digest', icon: Sparkles },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r-3 border-black h-screen flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b-3 border-black bg-neo-yellow flex items-center gap-3">
          <div className="bg-black text-white p-1.5 border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <Eye className="w-6 h-6 text-neo-yellow" />
          </div>
          <span className="font-black text-2xl uppercase tracking-wider font-mono text-black">
            OBSERVO
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-4 py-3 font-mono font-bold text-sm uppercase tracking-wide border-2 border-black transition-all rounded-none ${
                  isActive
                    ? 'bg-neo-yellow text-black shadow-neo-sm translate-x-0.5 translate-y-0.5 shadow-none'
                    : 'bg-white text-black hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Panel */}
      <div className="p-4 border-t-3 border-black bg-slate-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="border-2 border-black p-0.5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none shrink-0">
            <UserButton />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs uppercase tracking-wide font-mono text-black truncate">
              Developer Profile
            </span>
            <span className="text-[10px] text-zinc-500 font-mono uppercase truncate">
              Observo Console
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
