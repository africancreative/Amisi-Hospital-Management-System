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
  Stethoscope,
  Activity,
  Pill,
  Microscope,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { getPayPalClientId, notifyCheckoutAttempt } from '@/app/actions/system-actions';
import { trpc } from '@/trpc/client';
import { DeploymentTier, FacilityType } from '@amisimedos/constants';

const PLANS = {
  ESSENTIAL: {
    key: 'ESSENTIAL',
    name: 'Essential Plan',
    monthlyPrice: 24.50,
    yearlyPrice: 245,
    features: ['Patient Registration', 'OPD Management', 'Basic Billing', 'Pharmacy (Basic)'],
    tier: DeploymentTier.CLINIC
  },
  PROFESSIONAL: {
    key: 'PROFESSIONAL',
    name: 'Professional Plan',
    monthlyPrice: 64.50,
    yearlyPrice: 645,
    features: ['Everything in Essential', 'Full Billing', 'Lab & Diagnostics', 'IPD & Ward Mgmt'],
    tier: DeploymentTier.HOSPITAL
  },
  ENTERPRISE: {
    key: 'ENTERPRISE',
    name: 'Enterprise Plan',
    monthlyPrice: 149.50,
    yearlyPrice: 1495,
    features: ['Multi-Branch', 'Custom Workflows', 'API Integrations', 'Dedicated Server'],
    tier: DeploymentTier.NETWORK
  }
};

const COUNTRIES = [
  "Kenya", "Nigeria", "South Africa", "Ghana", "Uganda", "Tanzania", "Rwanda", "Egypt", "Morocco", "Other"
];

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPlanKey = (searchParams.get('plan') || 'PROFESSIONAL').toUpperCase();
  const initialAnnual = searchParams.get('period') === 'yearly';

  const [clientId, setClientId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      facilityType: 'CLINIC' as FacilityType,
      name: '',
      slug: '',
      country: '',
      planKey: initialPlanKey,
      isAnnual: initialAnnual,
      selectedModuleIds: [] as string[],
  });

  const plan = PLANS[formData.planKey as keyof typeof PLANS] || PLANS.PROFESSIONAL;
  const price = formData.isAnnual ? plan.yearlyPrice : plan.monthlyPrice;

  const onboard = trpc.public.checkoutTenant.useMutation({
      onSuccess: (data: any) => {
          router.push(`/checkout/success?slug=${data.tenant?.slug || formData.slug}`);
      },
      onError: (err: any) => {
          alert(`Provisioning failed: ${err.message}`);
          setIsProcessing(false);
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

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const renderStepIndicators = () => (
    <div className="flex items-center justify-between mb-12 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 -z-10" />
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 -z-10 transition-all duration-500" 
        style={{ width: `${((step - 1) / 3) * 100}%` }} 
      />
      
      {[1, 2, 3, 4].map(num => (
        <div 
          key={num} 
          className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 border-4 border-[#07070a] ${
            step >= num 
              ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          {step > num ? <CheckCircle2 size={18} /> : num}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-blue-500/30 py-12">
      
      <main className="max-w-3xl mx-auto px-6">
        
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase mb-4">Start Your <span className="text-blue-500">Journey</span></h1>
            <p className="text-neutral-400 max-w-lg mx-auto">Create your account, configure your hospital, and go live in less than 5 minutes.</p>
        </div>

        {renderStepIndicators()}

        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 lg:p-12 relative overflow-hidden shadow-2xl">
          
          {/* STEP 1: SIGNUP */}
          {step === 1 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                    <h3 className="text-2xl font-black italic uppercase mb-2 text-white">1. Administrator Profile</h3>
                    <p className="text-sm text-neutral-500">Set up the primary administrative account.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text"
                                placeholder="Dr. John Doe"
                                className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                value={formData.adminName}
                                onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="email"
                                placeholder="john@hospital.com"
                                className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                value={formData.adminEmail}
                                onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
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

                <div className="space-y-3 pt-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Facility Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'CLINIC', icon: Stethoscope, label: 'Clinic' },
                            { id: 'HOSPITAL', icon: Activity, label: 'Hospital' },
                            { id: 'PHARMACY', icon: Pill, label: 'Pharmacy' },
                            { id: 'LAB', icon: Microscope, label: 'Laboratory' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setFormData({...formData, facilityType: type.id as FacilityType})}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                                    formData.facilityType === type.id 
                                    ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/20 text-blue-400' 
                                    : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
                                }`}
                            >
                                <type.icon size={24} className="mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleNext}
                    disabled={!formData.adminName || !formData.adminEmail || formData.adminPassword.length < 8}
                    className="w-full mt-8 group flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                    Continue to Facility Setup
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          )}

          {/* STEP 2: FACILITY SETUP */}
          {step === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={handlePrev} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase text-white">2. Facility Setup</h3>
                        <p className="text-sm text-neutral-500">Define your public identity and region.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Facility Name</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Universal Slug (URL)</label>
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
                    <p className="text-[10px] text-emerald-500 ml-1 italic font-mono font-bold flex items-center gap-1 mt-2">
                        <CheckCircle2 size={10} /> amisimedos.amisigenuine.com/{formData.slug || 'your-hospital'}
                    </p>
                </div>

                <div className="space-y-2 pt-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Country / Server Region</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <select 
                            className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                        >
                            <option value="" disabled>Select a country</option>
                            {COUNTRIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-[10px] text-slate-600 ml-1">We route your data to the nearest secure node based on country.</p>
                </div>

                <button 
                    onClick={handleNext}
                    disabled={!formData.name || !formData.slug || !formData.country}
                    className="w-full mt-8 group flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                    Continue to Plan Selection
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          )}

          {/* STEP 3: PLAN SELECTION */}
          {step === 3 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={handlePrev} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase text-white">3. Choose Subscription</h3>
                        <p className="text-sm text-neutral-500">Select the plan that fits your facility.</p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 bg-slate-900/50 p-2 rounded-full w-max mx-auto mb-6">
                    <button 
                        onClick={() => setFormData({...formData, isAnnual: false})}
                        className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!formData.isAnnual ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setFormData({...formData, isAnnual: true})}
                        className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${formData.isAnnual ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Yearly <span className="text-emerald-400 ml-1">-20%</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {Object.values(PLANS).map((p) => (
                        <div 
                            key={p.key}
                            onClick={() => setFormData({...formData, planKey: p.key})}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                formData.planKey === p.key 
                                ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
                                : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                            <div>
                                <h4 className={`text-lg font-black italic uppercase ${formData.planKey === p.key ? 'text-blue-400' : 'text-white'}`}>
                                    {p.name}
                                </h4>
                                <p className="text-xs text-neutral-400 mt-1">{p.features.slice(0, 2).join(', ')}...</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black italic tracking-tighter text-white">
                                    ${formData.isAnnual ? p.yearlyPrice : p.monthlyPrice}
                                </p>
                                <p className="text-[10px] text-neutral-500 uppercase font-bold">
                                    /{formData.isAnnual ? 'year' : 'month'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => {
                        // Optional: trigger lead generation email here before hitting payment
                        notifyCheckoutAttempt(formData, plan);
                        handleNext();
                    }}
                    className="w-full mt-8 group flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                    Proceed to Payment
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <CreditCard className="h-32 w-32" />
                </div>

                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <button onClick={handlePrev} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h3 className="text-xl font-black italic uppercase text-white">4. Secure Checkout</h3>
                        <p className="text-sm text-neutral-500">Encrypted processing by PayPal.</p>
                    </div>
                </div>

                {isProcessing && (
                    <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center rounded-[40px]">
                        <div className="h-24 w-24 relative mb-6">
                            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                            <Activity className="absolute inset-0 m-auto text-blue-500" size={32} />
                        </div>
                        <p className="text-blue-400 font-black tracking-[0.2em] uppercase text-sm animate-pulse">Provisioning System...</p>
                        <p className="text-neutral-500 text-xs mt-2">Setting up cloud infrastructure...</p>
                    </div>
                )}

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8 relative z-10 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Total Due Today</p>
                        <p className="text-4xl font-black italic text-white">${price}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-blue-400">{plan.name}</p>
                        <p className="text-[10px] text-neutral-500">{formData.isAnnual ? 'Billed Yearly' : 'Billed Monthly'}</p>
                    </div>
                </div>

                {/* PayPal Integration */}
                <div className="space-y-6 relative z-10">
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
                                description: `AmisiMedOS ${plan.name} (${formData.isAnnual ? 'Yearly' : 'Monthly'})`
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
                                        name: formData.name,
                                        slug: formData.slug,
                                        region: formData.country || 'AFRICA',
                                        tier: plan.tier,
                                        facilityType: formData.facilityType,
                                        adminName: formData.adminName,
                                        adminEmail: formData.adminEmail,
                                        adminPassword: formData.adminPassword,
                                        paypalOrderId: details.id,
                                        amountPaid: price,
                                        isAnnual: formData.isAnnual
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

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-30 grayscale contrast-150 text-neutral-500">
            <span className="font-black tracking-widest uppercase text-xs">Secured By</span>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
            <div className="flex items-center gap-2">
               <ShieldCheck className="h-4 w-4" />
               <span className="font-bold tracking-tight text-xs">256-bit AES Encryption</span>
            </div>
        </div>

      </main>
    </div>
  );
}
