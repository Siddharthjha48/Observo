'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    if (!username || !password) {
      setError('ALL FIELDS ARE REQUIRED!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'INVALID CREDENTIALS!');
      }

      // Success - Redirect to Dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEE00] p-6 font-mono selection:bg-black selection:text-white">
      <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative transition-all duration-200">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-[-4px] left-[-4px] right-[-4px] h-10 bg-black border-4 border-black flex items-center justify-between px-4 text-white font-bold text-sm select-none">
          <span>ADMIN_PORTAL.EXE</span>
          <div className="flex space-x-2">
            <span className="w-3 h-3 bg-[#FF6B6B] border border-white inline-block"></span>
            <span className="w-3 h-3 bg-[#FFEE00] border border-white inline-block"></span>
            <span className="w-3 h-3 bg-[#4ADE80] border border-white inline-block"></span>
          </div>
        </div>

        {/* Content Container (padded down to avoid covering title bar) */}
        <div className="pt-8">
          <div className="text-center mb-8 mt-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-black uppercase mb-2">
              OBSERVO
            </h1>
            <div className="inline-block bg-[#00E5FF] text-black border-2 border-black font-bold px-3 py-1 text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ADMIN CONTROL PANEL
            </div>
          </div>

          {error && (
            <div className="bg-[#FF6B6B] text-black border-2 border-black p-3 mb-6 font-bold text-xs uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2 animate-bounce">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-2 tracking-wider">
                ADMIN USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. siddharth"
                className="w-full bg-white text-black border-2 border-black p-3 font-bold placeholder:text-gray-400 focus:outline-none focus:bg-[#FFEE00] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-2 tracking-wider">
                ADMIN PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white text-black border-2 border-black p-3 font-bold placeholder:text-gray-400 focus:outline-none focus:bg-[#FFEE00] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4ADE80] text-black border-4 border-black font-black uppercase py-4 text-sm tracking-widest shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 transition-all duration-100 cursor-pointer"
            >
              {loading ? 'AUTHORIZING...' : 'INITIALIZE ADMIN SESSION'}
            </button>
          </form>

          {/* Quick Info */}
          <div className="mt-8 text-center border-t-2 border-dashed border-black pt-6">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Bypasses standard Clerk OAuth constraints.<br />
              Grants instant PRO-level database authorization.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
