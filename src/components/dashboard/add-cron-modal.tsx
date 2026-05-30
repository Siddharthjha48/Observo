'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

interface AddCronModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCronModal: React.FC<AddCronModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    expectedInterval: '',
    gracePeriod: '10',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const interval = parseInt(form.expectedInterval);
    const grace = parseInt(form.gracePeriod);

    if (isNaN(interval) || interval <= 0) {
      setError('Expected interval must be a positive number of minutes.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/cron-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          expectedInterval: interval,
          gracePeriod: isNaN(grace) ? 10 : grace,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create cron job');
      }

      setForm({
        name: '',
        expectedInterval: '',
        gracePeriod: '10',
      });
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Background Cron Heartbeat">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-neo-coral/20 border-2 border-black p-3 font-mono font-bold text-xs uppercase text-black">
            ⚠️ Error: {error}
          </div>
        )}

        <Input
          label="Cron Job Name"
          placeholder="Daily Database Backup"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Exp. Interval (mins)"
            placeholder="1440"
            type="number"
            required
            value={form.expectedInterval}
            onChange={(e) => setForm({ ...form, expectedInterval: e.target.value })}
          />

          <Input
            label="Grace Period (mins)"
            placeholder="15"
            type="number"
            required
            value={form.gracePeriod}
            onChange={(e) => setForm({ ...form, gracePeriod: e.target.value })}
          />
        </div>

        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
          💡 Tip: Set the interval to match how often your background cron job runs. The grace period is an extra buffer before we trigger an alert if a heartbeat ping is missed.
        </p>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Create Cron Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
