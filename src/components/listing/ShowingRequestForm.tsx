'use client';

import { useState } from 'react';

interface ShowingRequestFormProps {
  propertyAddress: string;
  agentEmail?: string;
  agentPhone?: string;
}

const inputClass =
  'w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white ' +
  'placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-0';

export default function ShowingRequestForm({ propertyAddress, agentEmail, agentPhone }: ShowingRequestFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, property: propertyAddress, agentEmail, agentPhone }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', date: '', time: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Request Received!</h3>
        <p className="text-green-700">We&apos;ll be in touch shortly to confirm your showing.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-green-600 underline hover:text-green-800"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold mb-1" style={{ color: '#1a2744' }}>Request a Showing</h3>
      <p className="text-gray-600 text-sm mb-5">Schedule a private tour of this property</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="Jane Smith"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              placeholder="jane@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Preferred Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
              style={{ colorScheme: 'light' }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Preferred Time</label>
            <select
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className={inputClass}
            >
              <option value="">Any time</option>
              <option value="Morning (9am–12pm)">Morning (9am–12pm)</option>
              <option value="Afternoon (12pm–4pm)">Afternoon (12pm–4pm)</option>
              <option value="Evening (4pm–7pm)">Evening (4pm–7pm)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={3}
            className={inputClass + ' resize-none'}
            placeholder="Any questions or special requests?"
          />
        </div>

        {status === 'error' && (
          <p className="text-red-600 text-sm font-medium">Something went wrong. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-4 rounded-lg font-bold text-white text-base transition disabled:opacity-60 active:scale-95"
          style={{ backgroundColor: '#1a2744' }}
        >
          {status === 'submitting' ? 'Sending…' : 'Request Showing'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Your information is private and will never be shared.
        </p>
      </form>
    </div>
  );
}
