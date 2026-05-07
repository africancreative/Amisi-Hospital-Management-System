'use client';

import { useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { submitHospitalInquiry } from '@/app/actions/core-actions';

export default function RequestAccessPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      hospitalName: formData.get('hospitalName') as string,
      contactName: formData.get('contactName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      bedCapacity: formData.get('bedCapacity') as string,
      notes: formData.get('notes') as string,
    };

    try {
      await submitHospitalInquiry(data);
      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-6 selection:bg-amber-500/30">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
          <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-black mb-4">Request Sent</h2>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            Thank you! Your hospital inquiry has been securely routed to our onboarding team. An admin will contact you shortly to provision your enterprise cluster.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            <ChevronLeft className="h-4 w-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col selection:bg-amber-500/30">
      <nav className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-semibold">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-xl w-full relative">
          <div className="mb-10 text-center">
            <div className="inline-flex h-16 w-16 bg-blue-500/10 items-center justify-center rounded-2xl mb-6 border border-white/5">
              <Building2 className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-4">Enterprise Onboarding</h1>
            <p className="text-neutral-400">Deploy a dedicated, secure multi-tenant environment for your healthcare network.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Hospital / Clinic Name</label>
                <input required name="hospitalName" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600" placeholder="e.g. Mercy General Hospital" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Primary Contact</label>
                  <input required name="contactName" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600" placeholder="Dr. Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Bed Capacity (approx)</label>
                  <select name="bedCapacity" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                    <option value="Clinic (0-20 beds)" className="bg-neutral-900 border-none">Clinic (0-20 beds)</option>
                    <option value="Mid-scale (20-100 beds)" className="bg-neutral-900">Mid-scale (20-100 beds)</option>
                    <option value="Large (100-500 beds)" className="bg-neutral-900">Large (100-500 beds)</option>
                    <option value="Enterprise (500+ beds)" className="bg-neutral-900">Enterprise (500+ beds)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Email Address</label>
                  <input required type="email" name="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600" placeholder="jane@hospital.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Phone Number</label>
                  <input required type="tel" name="phone" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Primary Modules Needed (Optional)</label>
                <textarea name="notes" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600 resize-none" placeholder="e.g. We urgently need the Lab Information System and Pharmacy extensions..." />
              </div>
            </div>

            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                {errorMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {status === 'submitting' ? 'TRANSMITTING...' : 'SEND REQUEST'} 
              {status !== 'submitting' && <ArrowRight className="h-5 w-5" />}
            </button>
            <p className="text-center text-xs text-neutral-500">By submitting, you agree to our Enterprise SLA policy.</p>

          </form>
        </div>
      </main>
    </div>
  );
}
