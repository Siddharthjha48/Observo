'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';

interface AddMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMonitorModal: React.FC<AddMonitorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    url: '',
    method: 'GET',
    interval: '10',
    timeout: '30',
    expectedStatus: '200',
    maxResponseTime: '2000',
  });

  const methods = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'PATCH', label: 'PATCH' },
  ];

  const intervals = [
    { value: '1', label: '1 Minute (Pro Only)' },
    { value: '5', label: '5 Minutes (Pro Only)' },
    { value: '10', label: '10 Minutes' },
    { value: '30', label: '30 Minutes' },
    { value: '60', label: '60 Minutes (1 Hour)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic URL validation
    if (!form.url.startsWith('http://') && !form.url.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          url: form.url,
          method: form.method,
          interval: parseInt(form.interval),
          timeout: parseInt(form.timeout),
          expectedStatus: parseInt(form.expectedStatus),
          maxResponseTime: parseInt(form.maxResponseTime),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create monitor');
      }

      // Success
      setForm({
        name: '',
        url: '',
        method: 'GET',
        interval: '10',
        timeout: '30',
        expectedStatus: '200',
        maxResponseTime: '2000',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Add New API Monitor">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-neo-coral/20 border-2 border-black p-3 font-mono font-bold text-xs uppercase text-black">
            ⚠️ Error: {error}
          </div>
        )}

        <Input
          label="Monitor Name"
          placeholder="My Backend API"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          label="Endpoint URL"
          placeholder="https://api.myapp.com/health"
          required
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="HTTP Method"
            options={methods}
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
          />

          <Select
            label="Check Interval"
            options={intervals}
            value={form.interval}
            onChange={(e) => setForm({ ...form, interval: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Exp. Status"
            type="number"
            required
            value={form.expectedStatus}
            onChange={(e) => setForm({ ...form, expectedStatus: e.target.value })}
          />

          <Input
            label="Timeout (s)"
            type="number"
            required
            value={form.timeout}
            onChange={(e) => setForm({ ...form, timeout: e.target.value })}
          />

          <Input
            label="Max Delay (ms)"
            type="number"
            required
            value={form.maxResponseTime}
            onChange={(e) => setForm({ ...form, maxResponseTime: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Create Monitor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
