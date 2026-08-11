'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import { submitContactForm } from '@/app/actions/ui-actions';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      organization: formData.get('organization') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await submitContactForm(data);
      if (res.success) {
        setStatus('success');
      } else {
        throw new Error('Submission failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col selection:bg-amber-500/30">
      {/* Navigation */}
      <nav className="p-6 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-semibold">
          <ChevronLeft className="h-4 w-4" /> Back to Home
        </Link>
        <span className="text-xs uppercase tracking-widest text-amber-500 font-mono font-bold">AmisiMedOS Global Support</span>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column: Contact Info */}
        <div className="space-y-8">
          <div>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">Contact Us</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-4">
              Get in touch with <span className="text-blue-500">AmisiMedOS</span>
            </h1>
            <p className="text-neutral-400 mt-4 leading-relaxed">
              Have questions about healthcare cloud architecture, custom tenant deployment, module entitlements, or enterprise SLAs? Our technical specialists are here to assist.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Email Direct</h3>
                <p className="text-sm text-neutral-400 mt-1">amisi@amisigenuine.com</p>
                <p className="text-xs text-neutral-500 mt-0.5">24/7 Monitored Inbox</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Direct Hotline</h3>
                <p className="text-sm text-neutral-400 mt-1">+254 700 578 380</p>
                <p className="text-xs text-neutral-500 mt-0.5">Clinical Operations & Technical Escalations</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Headquarters</h3>
                <p className="text-sm text-neutral-400 mt-1">Nairobi Tech Hub, Kenya</p>
                <p className="text-xs text-neutral-500 mt-0.5">Global Infrastructure Operations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Form */}
        <div>
          {status === 'success' ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center space-y-6 backdrop-blur-xl">
              <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-black text-white">Message Transmitted</h2>
              <p className="text-neutral-400 leading-relaxed max-w-sm mx-auto">
                Your message has been securely delivered to our orchestrator dashboard. An admin will contact you shortly.
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-5">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                Submit Inbound Inquiry
              </h2>

              {status === 'error' && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Your Name</label>
                  <input 
                    required 
                    name="name" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600" 
                    placeholder="Dr. Michael Chen" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Email Address</label>
                  <input 
                    required 
                    type="email"
                    name="email" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600" 
                    placeholder="m.chen@hospital.org" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Phone Number</label>
                  <input 
                    name="phone" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600" 
                    placeholder="+254 712 345 678" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Organization / Hospital</label>
                  <input 
                    name="organization" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600" 
                    placeholder="Valley General Hospital" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Subject</label>
                <input 
                  required
                  name="subject" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600" 
                  placeholder="Enterprise Pricing & Module Integration" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Message</label>
                <textarea 
                  required
                  name="message" 
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600 resize-none" 
                  placeholder="Tell us about your facility size, current EHR system, or custom requirements..." 
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {status === 'submitting' ? 'Transmitting Inbound Payload...' : (
                  <>
                    <Send className="w-4 h-4" /> Send Inbound Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
