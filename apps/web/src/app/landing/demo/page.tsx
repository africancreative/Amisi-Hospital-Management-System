'use client';

import React, { useState } from 'react';
import { initLeadCapture } from '@/lib/lead-capture';

export default function DemoLandingPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const capture = initLeadCapture({
    source: 'Website',
    landingPage: '/landing/demo',
    onSuccess: () => {
      setStatus('success');
      setMessage('Thank you! We will contact you soon.');
    },
    onError: (err) => {
      setStatus('error');
      setMessage('Submission failed. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const formData = new FormData(e.currentTarget);
    await capture.submitForm({
      name: formData.get('name') as string,
      organization: formData.get('organization') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      facilityType: formData.get('facilityType') as string || 'Clinic',
      message: formData.get('message') as string || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Get a Demo</h1>
        
        {status === 'success' ? (
          <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4">
            <p className="text-emerald-400">{message}</p>
          </div>
        ) : (
          <form id="demo-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Organization</label>
              <input
                name="organization"
                type="text"
                required
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone</label>
              <input
                name="phone"
                type="tel"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Facility Type</label>
              <select
                name="facilityType"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
              >
                <option value="Clinic">Clinic</option>
                <option value="Hospital">Hospital</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Message</label>
              <textarea
                name="message"
                rows={3}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
              />
            </div>
            
            {status === 'error' && (
              <p className="text-red-400 text-sm">{message}</p>
            )}
            
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {status === 'loading' ? 'Submitting...' : 'Get Demo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
