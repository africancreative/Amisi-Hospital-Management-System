'use client';

import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Zap, ShieldCheck, Globe2, Cpu, MessageSquare, Phone, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const plans = [
    {
      name: 'Essential Plan',
      tag: 'Best for Clinics',
      monthlyPrice: 24.50,
      monthlyOriginal: 49,
      yearlyPrice: 245,
      yearlyOriginal: 490,
      color: 'emerald',
      features: [
        'Patient Registration & Records',
        'OPD Management',
        'Basic Billing',
        'Pharmacy (Basic)',
        'Appointment Scheduling',
        'Offline Mode (Local Server)',
        'Basic Reports',
      ],
      cta: 'Get Started',
    },
    {
      name: 'Professional Plan',
      tag: 'Most Popular',
      monthlyPrice: 64.50,
      monthlyOriginal: 129,
      yearlyPrice: 645,
      yearlyOriginal: 1290,
      color: 'blue',
      featured: true,
      features: [
        'Everything in Essential',
        'Full Billing System',
        'Lab & Diagnostics',
        'IPD & Ward Management',
        'Integrated Pharmacy',
        'Patient Chat & Notes',
        'Insurance Tracking',
        'Advanced Reports',
        'Hybrid Cloud + Local Sync',
      ],
      cta: 'Start Free Trial',
    },
    {
      name: 'Enterprise Plan',
      tag: 'For Large Hospitals',
      monthlyPrice: 149.50,
      monthlyOriginal: 299,
      yearlyPrice: 1495,
      yearlyOriginal: 2990,
      color: 'purple',
      features: [
        'Everything in Professional',
        'Multi-Branch Management',
        'Custom Workflows',
        'Real-Time Executive Dashboard',
        'API Integrations',
        'Dedicated Server Deployment',
        'Priority Support',
        'Custom Modules (ICU, Radiology, etc.)',
      ],
      cta: 'Contact Sales',
    },
  ];

  return (
    <div className="space-y-24">
      {/* 1. Hero & Toggle */}
      <section className="text-center pt-16">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6">
          Simple, Transparent Pricing for Every Hospital
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
          From small clinics to multi-specialty hospitals, AmisiMedOS scales with your growth—online or offline.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-bold ${billingCycle === 'MONTHLY' ? 'text-white' : 'text-neutral-500'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
            className="w-14 h-8 rounded-full bg-neutral-800 p-1 relative transition-colors border border-white/10"
          >
            <div className={`w-6 h-6 rounded-full bg-blue-500 absolute top-1 transition-all ${billingCycle === 'YEARLY' ? 'left-7' : 'left-1'}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${billingCycle === 'YEARLY' ? 'text-white' : 'text-neutral-500'}`}>Yearly</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              Save 2 months
            </span>
          </div>
        </div>
      </section>

      {/* 2. Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
        {plans.map((p) => (
          <div 
            key={p.name}
            className={`rounded-[40px] p-8 border transition-all relative ${p.featured ? 'bg-gradient-to-b from-blue-600/20 to-blue-950/10 border-blue-500/40 shadow-2xl shadow-blue-500/10 scale-105 z-10' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
          >
            <div className="mb-8">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${p.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : p.color === 'blue' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'}`}>
                {p.tag}
              </span>
              <div className="mt-4 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest inline-block">
                50% Intro Offer till Dec 2026
              </div>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">{p.name}</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <div className="flex flex-col">
                <span className="text-sm text-neutral-500 line-through font-bold">
                  ${billingCycle === 'MONTHLY' ? p.monthlyOriginal : p.yearlyOriginal}
                </span>
                <span className="text-5xl font-black text-white">${billingCycle === 'MONTHLY' ? p.monthlyPrice : p.yearlyPrice}</span>
              </div>
              <span className="text-neutral-500 text-sm font-bold">/{billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</span>
            </div>
            
            <Link 
              href={p.cta === 'Contact Sales' ? 'mailto:sales@amisigenuine.com' : '/request'}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 mb-10 ${p.featured ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
            >
              {p.cta} <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Key Features</p>
              {p.features.map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <CheckCircle2 className={`h-5 w-5 shrink-0 ${p.featured ? 'text-blue-500' : 'text-neutral-600'}`} />
                  <span className="text-sm text-neutral-300 font-medium leading-tight">{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Feature Comparison Table */}
      <section className="max-w-5xl mx-auto px-6 py-24 bg-white/[0.01] rounded-[60px] border border-white/5">
        <h2 className="text-center text-3xl font-black mb-16 uppercase italic">Comparison Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                <th className="py-6 px-4">Feature</th>
                <th className="py-6 px-4">Essential</th>
                <th className="py-6 px-4">Professional</th>
                <th className="py-6 px-4">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'Patient Records', essential: '✔', professional: '✔', enterprise: '✔' },
                { name: 'Billing Flexibility', essential: 'Basic', professional: 'Advanced', enterprise: 'Advanced' },
                { name: 'Lab & Diagnostics', essential: '—', professional: '✔', enterprise: '✔' },
                { name: 'Inpatient (IPD)', essential: '—', professional: '✔', enterprise: '✔' },
                { name: 'Multi-Branch', essential: '—', professional: '—', enterprise: '✔' },
                { name: 'Offline Mode', essential: '✔', professional: '✔', enterprise: '✔' },
                { name: 'Analytics', essential: 'Basic', professional: 'Advanced', enterprise: 'Executive' },
                { name: 'API Integrations', essential: '—', professional: 'Limited', enterprise: 'Full' },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 px-4 text-sm font-bold text-white">{row.name}</td>
                  <td className="py-5 px-4 text-sm text-neutral-400">{row.essential}</td>
                  <td className="py-5 px-4 text-sm text-neutral-400 font-bold">{row.professional}</td>
                  <td className="py-5 px-4 text-sm text-white font-black">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Add-Ons Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 uppercase italic">Customize Your Hospital Experience</h2>
          <p className="text-neutral-500 font-medium">Extend your platform with specialized modules.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { icon: MessageSquare, title: 'SMS & WhatsApp Notifications' },
            { icon: Globe2, title: 'Patient Mobile App' },
            { icon: Phone, title: 'Telemedicine Module' },
            { icon: Cpu, title: 'HR & Payroll' },
            { icon: Zap, title: 'Data Migration Support' },
          ].map((addon) => (
            <div key={addon.title} className="p-6 rounded-3xl bg-neutral-900 border border-white/5 flex flex-col items-center text-center group hover:border-blue-500/50 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <addon.icon className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-white">{addon.title}</h4>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
           <button className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm hover:bg-white/10 transition-all">Talk to Sales</button>
        </div>
      </section>

      {/* 5. Trust Section */}
      <section className="py-24 bg-gradient-to-b from-blue-600/5 to-transparent border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
           <div>
              <h2 className="text-4xl font-black mb-8 leading-tight">Built for Reliability in Real-World Conditions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                   'Works during internet outages',
                   'Runs on local servers + cloud sync',
                   'Designed for African healthcare environments',
                   'Secure & compliant data handling'
                 ].map(point => (
                   <div key={point} className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
                      <span className="text-sm font-bold text-neutral-300">{point}</span>
                   </div>
                 ))}
              </div>
           </div>
           <div className="h-64 rounded-[40px] bg-neutral-950 border border-white/5 shadow-2xl flex items-center justify-center">
              <Globe2 className="h-32 w-32 text-blue-500/20 animate-pulse" />
           </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-black mb-12 flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-amber-500" /> FAQ
        </h2>
        <div className="space-y-6">
          {[
            { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time through your dashboard.' },
            { q: 'Does it work offline?', a: 'Yes! Our local node technology ensures core clinical modules work without internet, syncing back once online.' },
            { q: 'Is there onboarding support?', a: 'Absolutely. All Professional and Enterprise plans include dedicated onboarding and training.' },
          ].map(faq => (
            <div key={faq.q} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <h4 className="text-lg font-bold text-white mb-2">{faq.q}</h4>
              <p className="text-neutral-500 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
         <h2 className="text-5xl font-black mb-8 uppercase italic">Ready to Digitize Your Hospital?</h2>
         <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/request" className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-xl shadow-2xl shadow-blue-600/40 hover:bg-blue-500 transition-all hover:scale-105">🚀 Start Free Trial</Link>
            <button className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xl hover:bg-white/10 transition-all">📞 Book a Demo</button>
         </div>
      </section>
    </div>
  );
}
