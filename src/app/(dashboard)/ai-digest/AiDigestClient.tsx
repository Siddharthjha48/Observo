'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, BrainCircuit, RefreshCw, AlertCircle } from 'lucide-react';

export default function AiDigestClient() {
  const [digest, setDigest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setDigest(null);

    try {
      const res = await fetch('/api/ai-digest', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate weekly digest.');
      }

      setDigest(data.digest);
    } catch (err: any) {
      setError(err.message || 'An error occurred during digest generation.');
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown-like Renderer to style headings and bold words
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-black font-mono uppercase tracking-wide border-b-2 border-black pb-1.5 mt-6 mb-3 text-black">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-sm font-black font-mono uppercase tracking-wider mt-5 mb-2 text-zinc-800">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-black font-mono uppercase tracking-wider border-b-3 border-black pb-2 mt-8 mb-4 text-black">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Handle bold blocks (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(trimmed)) {
        const parts = trimmed.split(boldRegex);
        return (
          <p key={idx} className="text-xs font-mono uppercase leading-relaxed text-zinc-700 mb-4">
            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-black font-black bg-neo-yellow/30 px-1 border border-black">{part}</strong> : part))}
          </p>
        );
      }

      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs font-mono uppercase leading-relaxed text-zinc-700 mb-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-black pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider font-mono flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-black" />
            <span>AI Weekly Digest</span>
          </h1>
          <p className="text-zinc-600 font-mono text-sm uppercase mt-1">
            Weekly automated DevOps status compiler powered by Google Gemini AI.
          </p>
        </div>
      </div>

      {/* Main interaction Card */}
      {!digest && !loading && (
        <Card className="py-16 px-6 text-center flex flex-col items-center justify-center gap-6 border-3 border-black shadow-neo-md bg-white">
          <div className="w-16 h-16 bg-neo-yellow border-2 border-black rounded-none flex items-center justify-center shadow-neo-sm animate-bounce">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-black uppercase font-mono">
              Compile Your Weekly Digest
            </h3>
            <p className="text-xs font-mono text-zinc-500 uppercase mt-2 leading-relaxed">
              We will gather all latency checks, background cron heartbeats, and outage incident logs from the last 7 days. Gemini AI will analyze the dataset to generate a customized DevOps report complete with overall health scores, root cause assumptions, and actionable recommendations.
            </p>
          </div>
          <Button onClick={handleGenerate} variant="primary" className="flex items-center gap-2">
            Generate Weekly Report
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="py-24 text-center flex flex-col items-center justify-center gap-4 bg-white border-3 border-black shadow-neo-lg">
          <div className="w-12 h-12 border-4 border-black border-t-neo-yellow animate-spin rounded-none" />
          <h3 className="text-lg font-black uppercase font-mono tracking-widest mt-4">
            🤖 MUNCHING ON SYSTEM METRICS...
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">
            Gemini is analyzing check histories, ping logs, and recent outages. Please hold.
          </p>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-neo-coral/10 border-3 border-black shadow-neo-md p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-black shrink-0" />
            <div>
              <h3 className="font-black font-mono uppercase text-base text-black">
                Failed to Compile Report
              </h3>
              <p className="text-xs font-mono uppercase text-zinc-600 mt-0.5">
                {error}
              </p>
            </div>
          </div>
          <Button onClick={handleGenerate} variant="primary" className="self-start text-xs">
            Try Again
          </Button>
        </Card>
      )}

      {/* Finished Output Card */}
      {digest && !loading && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs font-bold text-zinc-500 uppercase">
              Generated: Just now
            </span>
            <Button
              onClick={handleGenerate}
              variant="ghost"
              className="text-xs px-3 py-1 flex items-center gap-1 bg-white border-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-generate
            </Button>
          </div>

          <Card className="bg-white border-3 border-black shadow-neo-lg p-8 font-mono">
            <div className="max-w-none">
              {renderMarkdown(digest)}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
