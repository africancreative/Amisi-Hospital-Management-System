'use client';

import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Zap, 
  ShieldCheck, 
  Globe, 
  MessageCircle, 
  Smartphone, 
  Stethoscope, 
  Users, 
  ArrowRight,
  Plus,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@amisimedos/ui';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="flex-1 bg-[#07070a] text-white selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* ── 1. Hero Section ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <Zap className="h-3 w-3 fill-current" />
            Flexible Infrastructure
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
            Simple, Transparent Pricing<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              For Every Hospital
            </span>
          </h1>
          
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            From small clinics to multi-specialty hospitals, AmisiMedOS scales with your growth—online or offline.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-bold ${!isAnnual ? 'text-white' : 'text-neutral-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-7 rounded-full bg-neutral-800 border border-white/10 p-1 transition-all relative"
            >
              <div className={`w-5 h-5 rounded-full bg-blue-600 transition-all ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isAnnual ? 'text-white' : 'text-neutral-500'}`}>Yearly</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                Save 2 months
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 px-8">
              <Link href="/checkout?plan=ESSENTIAL&period=yearly">
                Create Your Account
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-14 px-8">
              <Link href="/request">
                Book Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 2. Pricing Cards ── */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Essential Plan */}
          <PricingCard 
            title="Essential"
            tag="Best for Clinics"
            originalPrice={isAnnual ? 490 : 49}
            price={isAnnual ? 245 : 24.50}
            period={isAnnual ? 'yr' : 'mo'}
            description="Perfect for starting your digital healthcare journey."
            features={[
              "Patient Registration & Records",
              "OPD Management",
              "Basic Billing",
              "Pharmacy (Basic)",
              "Appointment Scheduling",
              "Offline Mode (Local Server)",
              "Basic Reports"
            ]}
            cta="Create Your Account"
            href={`/checkout?plan=ESSENTIAL&period=${isAnnual ? 'yearly' : 'monthly'}`}
            color="neutral"
          />

          {/* Professional Plan */}
          <PricingCard 
            title="Professional"
            tag="Most Popular"
            originalPrice={isAnnual ? 1290 : 129}
            price={isAnnual ? 645 : 64.50}
            period={isAnnual ? 'yr' : 'mo'}
            description="The complete operating system for modern hospitals."
            features={[
              "Everything in Essential",
              "Full Billing (Multi-point)",
              "Lab & Diagnostics",
              "IPD & Ward Management",
              "Integrated Pharmacy",
              "Patient Chat & Notes",
              "Insurance Tracking",
              "Advanced Reports",
              "Hybrid Cloud + Local Sync"
            ]}
            cta="Create Your Account"
            href={`/checkout?plan=PROFESSIONAL&period=${isAnnual ? 'yearly' : 'monthly'}`}
            highlight={true}
            color="blue"
          />

          {/* Enterprise Plan */}
          <PricingCard 
            title="Enterprise"
            tag="For Large Hospitals"
            originalPrice={isAnnual ? 2990 : 299}
            price={isAnnual ? 1495 : 149.50}
            period={isAnnual ? 'yr' : 'mo'}
            description="Custom infrastructure for high-volume institutions."
            features={[
              "Everything in Professional",
              "Multi-Branch Management",
              "Custom Workflows",
              "Real-Time Executive Dashboard",
              "API Integrations",
              "Dedicated Server Deployment",
              "Priority Support",
              "Custom Modules (ICU, etc.)"
            ]}
            cta="Contact Sales"
            href={`/checkout?plan=ENTERPRISE&period=${isAnnual ? 'yearly' : 'monthly'}`}
            color="indigo"
          />

        </div>
      </section>

      {/* ── 3. Comparison Table ── */}
      <section className="py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Feature Comparison</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-6 font-black text-neutral-500 uppercase text-xs tracking-widest">Feature</th>
                  <th className="py-6 font-black text-white uppercase text-xs tracking-widest">Essential</th>
                  <th className="py-6 font-black text-blue-400 uppercase text-xs tracking-widest">Professional</th>
                  <th className="py-6 font-black text-indigo-400 uppercase text-xs tracking-widest">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <ComparisonRow label="Patient Records" essential={true} professional={true} enterprise={true} />
                <ComparisonRow label="Billing Flexibility" essential="Basic" professional="Advanced" enterprise="Advanced" />
                <ComparisonRow label="Lab & Diagnostics" essential={false} professional={true} enterprise={true} />
                <ComparisonRow label="Inpatient (IPD)" essential={false} professional={true} enterprise={true} />
                <ComparisonRow label="Multi-Branch" essential={false} professional={false} enterprise={true} />
                <ComparisonRow label="Offline Mode" essential={true} professional={true} enterprise={true} />
                <ComparisonRow label="Analytics" essential="Basic" professional="Advanced" enterprise="Executive" />
                <ComparisonRow label="API Integrations" essential={false} professional="Limited" enterprise="Full" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 4. Add-Ons Section ── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-4">Customize Your Experience</h2>
            <p className="text-neutral-500">Power up your hospital with specialized modules.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AddOnCard icon={MessageCircle} title="SMS & WhatsApp" desc="Automated patient reminders & alerts." />
            <AddOnCard icon={Smartphone} title="Patient Mobile App" desc="White-labeled patient portal." />
            <AddOnCard icon={Stethoscope} title="Telemedicine" desc="Integrated video consultations." />
            <AddOnCard icon={Users} title="HR & Payroll" desc="Manage staff records and salaries." />
            <AddOnCard icon={Globe} title="Data Migration" desc="Expert support for legacy data." />
          </div>

          <div className="mt-12 text-center">
            <Link href="/contact" className="inline-flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Talk to Sales for custom add-ons <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Trust Section ── */}
      <section className="py-24 bg-blue-600/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-4">Built for Reliability</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <TrustItem icon={Globe} title="Works Offline" desc="Clinical continuity during internet outages." />
            <TrustItem icon={ShieldCheck} title="Hybrid Sync" desc="Local servers + secure cloud backup." />
            <TrustItem icon={Stethoscope} title="African Context" desc="Designed for regional healthcare workflows." />
            <TrustItem icon={ShieldCheck} title="Secure & Compliant" desc="HIPAA/GDPR-grade data handling." />
          </div>
        </div>
      </section>

      {/* ── 6. FAQ Section ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            <FAQItem q="Can I switch plans later?" a="Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle." />
            <FAQItem q="Does it work offline?" a="Absolutely. Our core USP is offline clinical resilience. Even if the internet goes down, your hospital continues to run on our local edge node." />
            <FAQItem q="Is there onboarding support?" a="Yes, every plan includes a dedicated implementation specialist to help you migrate data and train your staff." />
            <FAQItem q="Can I customize modules?" a="Custom module development and deep integrations are available on our Enterprise plan." />
          </div>
        </div>
      </section>

      {/* ── 7. Final CTA ── */}
      <section className="py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-blue-600/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase mb-8 leading-tight">
            Ready to Digitize<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Your Hospital?</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold h-16 px-10 text-lg shadow-xl shadow-blue-600/20">
              <Link href="/checkout?plan=ESSENTIAL&period=yearly">
                🚀 Create Your Account
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-16 px-10 text-lg">
              <Link href="/request">
                📞 Book a Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}

function PricingCard({ title, tag, originalPrice, price, period, description, features, cta, href, highlight = false, color }: any) {
  const accentColor = color === 'blue' ? 'text-blue-400' : color === 'indigo' ? 'text-indigo-400' : 'text-neutral-400';
  const borderClass = highlight ? 'border-blue-500/50 shadow-2xl shadow-blue-600/10 scale-[1.05]' : 'border-white/5 hover:border-white/10';
  const bgClass = highlight ? 'bg-gradient-to-b from-blue-600/20 to-neutral-900/40' : 'bg-white/[0.02]';

  return (
    <div className={`relative p-8 rounded-3xl border ${borderClass} ${bgClass} transition-all duration-500 flex flex-col h-full`}>
      {highlight && (
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
          Most Popular
        </div>
      )}
      
      <div className="mb-8">
        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${accentColor}`}>{tag}</p>
        <h3 className="text-3xl font-black italic uppercase mb-4">{title}</h3>
        <div className="mb-2">
            <span className="text-sm text-neutral-500 line-through font-bold">${originalPrice}</span>
            <div className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest inline-block ml-2">
                50% OFF till Jan 31, 2027
            </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black italic">$</span>
          <span className="text-6xl font-black italic tracking-tighter">{price}</span>
          <span className="text-neutral-500 font-bold">/{period}</span>
        </div>
        <p className="text-neutral-500 text-sm mt-4">{description}</p>
      </div>

      <div className="flex-1 space-y-4 mb-10">
        {features.map((f: string) => (
          <div key={f} className="flex items-start gap-3">
            <Check className={`h-4 w-4 mt-1 shrink-0 ${highlight ? 'text-blue-400' : 'text-emerald-500'}`} />
            <span className="text-sm text-neutral-300 font-medium">{f}</span>
          </div>
        ))}
      </div>

      <Button asChild className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${highlight ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
        <Link href={href}>
            👉 {cta}
        </Link>
      </Button>
    </div>
  );
}

function ComparisonRow({ label, essential, professional, enterprise }: any) {
  const renderCell = (val: any) => {
    if (val === true) return <Check className="h-5 w-5 text-emerald-500 mx-auto" />;
    if (val === false) return <X className="h-5 w-5 text-neutral-700 mx-auto" />;
    return <span className="text-neutral-400 font-bold italic">{val}</span>;
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="py-5 font-bold text-neutral-300">{label}</td>
      <td className="py-5 text-center">{renderCell(essential)}</td>
      <td className="py-5 text-center">{renderCell(professional)}</td>
      <td className="py-5 text-center">{renderCell(enterprise)}</td>
    </tr>
  );
}

function AddOnCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] group hover:border-white/10 transition-all">
      <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
      <h4 className="font-black italic uppercase text-sm mb-2">{title}</h4>
      <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function TrustItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="text-center md:text-left">
      <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
      <h4 className="font-black uppercase text-sm mb-2 italic">{title}</h4>
      <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function FAQItem({ q, a }: any) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-blue-400 shrink-0" />
          <span className="font-bold text-white italic uppercase tracking-tighter">{q}</span>
        </div>
        <Plus className={`h-5 w-5 text-neutral-600 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-14 pb-6 text-neutral-400 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}
