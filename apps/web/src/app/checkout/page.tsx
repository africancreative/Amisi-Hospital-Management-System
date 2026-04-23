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
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@amisimedos/ui';
import { getPayPalClientId } from '@/app/actions/system-actions';

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

        {/* Right Side: Payment Interface */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <CreditCard className="h-32 w-32" />
          </div>

          <div className="text-center mb-10">
            <div className="h-16 w-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-black italic uppercase mb-2">Secure Checkout</h3>
            <p className="text-sm text-neutral-500">Payments are encrypted and processed by PayPal.</p>
          </div>

          {/* PayPal Integration */}
          <div className="space-y-6">
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
                    const details = await actions.order?.capture();
                    if (details?.status === 'COMPLETED') {
                      // Redirect to success
                      router.push('/checkout/success');
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
