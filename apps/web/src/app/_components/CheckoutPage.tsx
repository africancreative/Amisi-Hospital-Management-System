'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { 
  ShieldCheck, 
  ChevronLeft, 
  Check, 
  CreditCard,
  Lock,
  Loader2,
  Building2,
  Globe,
  User,
  Mail,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { getPayPalClientId, notifyCheckoutAttempt } from '@/app/actions/system-actions';
import { trpc } from '@/trpc/client';
import { DeploymentTier } from '@amisimedos/constants';

const PLANS = {
  ESSENTIAL: {
    name: 'Essential Plan',
    monthlyPrice: 24.50,
    yearlyPrice: 245,
    features: ['Patient Registration', 'OPD Management', 'Basic Billing', 'Pharmacy (Basic)']
  },
  PROFESSIONAL: {
    name: 'Professional Plan',
    monthlyPrice: 64.50,
    yearlyPrice: 645,
    features: ['Everything in Essential', 'Full Billing', 'Lab & Diagnostics', 'IPD & Ward Mgmt']
  },
  ENTERPRISE: {
    name: 'Enterprise Plan',
    monthlyPrice: 149.50,
    yearlyPrice: 1495,
    features: ['Multi-Branch', 'Custom Workflows', 'API Integrations', 'Dedicated Server']
  }
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = (searchParams.get('plan') || 'PROFESSIONAL').toUpperCase();
  const plan = PLANS[planKey as keyof typeof PLANS] || PLANS.PROFESSIONAL;
  const isAnnual = searchParams.get('period') === 'yearly';
  const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;

  const [clientId, setClientId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
      name: '',
      slug: '',
      region: 'US-EAST-1',
      tier: DeploymentTier.CLINIC as DeploymentTier,
      dbUrl: '',
      selectedModuleIds: [] as string[],
      adminName: '',
      adminEmail: '',
      adminPassword: ''
  });

  const onboard = trpc.system.onboardTenant.useMutation({
      onSuccess: () => {
          router.push('/checkout/success');
      }
  });

  useEffect(() => {
    getPayPalClientId().then(setClientId);
  }, []);

  if (!clientId) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const handleNextStep = () => {
      // Send the email notification
      notifyCheckoutAttempt(formData, plan);
      setStep(2);
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-blue-500/30 pb-20">
      
      {/* Navigation */}
      <nav className="p-6">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-semibold">
          <ChevronLeft className="h-4 w-4" /> Back to Pricing
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        
        {/* Left Side: Order Summary */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-4 italic uppercase">Complete Your Order</h1>
            <p className="text-neutral-400">Join the next generation of healthcare infrastructure with AmisiMedOS.</p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Selected Plan</p>
                <h2 className="text-2xl font-black italic uppercase">{plan.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black italic text-white">${price}</p>
                <p className="text-[10px] text-neutral-500 font-bold uppercase">{isAnnual ? 'Per Year' : 'Per Month'}</p>
              </div>
            </div>

            <div className="py-4 border-y border-white/5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400 font-medium">Platform Fee</span>
                <span className="text-white font-bold">${price * 2}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400 font-black italic uppercase">50% Intro Discount</span>
                <span className="text-emerald-400 font-black italic">-${price}</span>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <span className="text-xl font-black italic uppercase tracking-tighter">Total Due</span>
              <span className="text-3xl font-black text-white italic tracking-tighter">${price}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-2">Plan Includes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-3 px-4 py-3 bg-white/[0.01] border border-white/5 rounded-xl">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-xs text-neutral-300 font-bold">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Flow Interface */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 lg:p-12 relative overflow-hidden">
          
          {step === 1 ? (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-black italic uppercase mb-2">Hospital Details</h3>
                    <p className="text-sm text-neutral-500">Create your administrative account</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Hospital Legal Name</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text"
                            placeholder="e.g. St. Jude Regional"
                            className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Universal Slug</label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text"
                            placeholder="e.g. st-jude"
                            className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono"
                            value={formData.slug}
                            onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        />
                    </div>
                    <p className="text-[10px] text-slate-600 ml-1 italic font-mono">Url: amisigenuine.com/{formData.slug || 'slug'}</p>
                </div>

                <div className="space-y-2 pt-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="email"
                            placeholder="admin@hospital.com"
                            className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            value={formData.adminEmail}
                            onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="password"
                            placeholder="Minimum 8 characters"
                            className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            value={formData.adminPassword}
                            onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleNextStep}
                    disabled={!formData.name || !formData.slug || !formData.adminEmail || formData.adminPassword.length < 8}
                    className="w-full mt-6 group flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                    Continue to Payment
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <CreditCard className="h-32 w-32" />
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setStep(1)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h3 className="text-xl font-black italic uppercase">Secure Checkout</h3>
                        <p className="text-sm text-neutral-500">Payments are encrypted and processed by PayPal.</p>
                    </div>
                </div>

                {isProcessing && (
                    <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[40px]">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">Provisioning Hospital...</p>
                    </div>
                )}

                {/* PayPal Integration */}
                <div className="space-y-6 relative z-0">
                    <PayPalScriptProvider options={{ clientId, currency: "USD" }}>
                        <PayPalButtons 
                        style={{ layout: "vertical", shape: "pill", label: "pay" }}
                        disabled={isProcessing}
                        createOrder={(data, actions) => {
                            return actions.order.create({
                            intent: 'CAPTURE',
                            purchase_units: [{
                                amount: {
                                currency_code: "USD",
                                value: price.toString(),
                                },
                                description: `AmisiMedOS ${plan.name} (${isAnnual ? 'Yearly' : 'Monthly'})`
                            }],
                            });
                        }}
                        onApprove={async (data, actions) => {
                            setIsProcessing(true);
                            try {
                                const details = await actions.order?.capture();
                                if (details?.status === 'COMPLETED') {
                                    // Payment successful! Now provision the hospital.
                                    onboard.mutate({
                                        ...formData,
                                        adminName: formData.adminName || 'Admin' // Fallback if name not provided
                                    });
                                } else {
                                    setIsProcessing(false);
                                }
                            } catch (error) {
                                console.error('Payment/Provisioning failed', error);
                                setIsProcessing(false);
                            }
                        }}
                        />
                    </PayPalScriptProvider>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600 mt-8">
                    <Lock className="h-3 w-3" />
                    PCI-DSS Compliant Infrastructure
                    </div>
                </div>
            </div>
          )}

        </div>

      </main>

      {/* Trust Badges */}
      <div className="max-w-5xl mx-auto px-6 mt-20 flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-150">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
          <div className="flex items-center gap-2">
             <ShieldCheck className="h-5 w-5" />
             <span className="font-black italic uppercase tracking-tighter text-sm">256-bit Encryption</span>
          </div>
      </div>

    </div>
  );
}
