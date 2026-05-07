'use client';

import React from 'react';
import { 
    CreditCard, 
    Plus,
    Check,
    Edit3
} from 'lucide-react';

export function WebPricingView() {
    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between pb-8 border-b border-gray-800 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-cyan-500" />
                        Pricing & Plans
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Configure subscription tiers and feature access for the public website.</p>
                </div>
                <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        name: 'Starter Clinic',
                        price: 99,
                        code: 'STARTER_CLINIC',
                        billingCycle: 'MONTHLY',
                        patients: 1000,
                        users: 5,
                        features: ['Basic EHR', 'Appointment Scheduling', 'Billing Integration', 'Email Support'],
                        isPopular: false
                    },
                    {
                        name: 'Professional',
                        price: 299,
                        code: 'PRO_HOSPITAL',
                        billingCycle: 'MONTHLY',
                        patients: 5000,
                        users: 25,
                        features: ['Everything in Starter', 'Advanced Analytics', 'Pharmacy Module', 'Priority Support', 'Custom Branding'],
                        isPopular: true
                    },
                    {
                        name: 'Enterprise',
                        price: 899,
                        code: 'ENTERPRISE_NET',
                        billingCycle: 'MONTHLY',
                        patients: 'Unlimited',
                        users: 'Unlimited',
                        features: ['Everything in Pro', 'Multi-tenant Architecture', 'Dedicated Account Manager', 'Custom Integrations', 'SLA Guarantee'],
                        isPopular: false
                    }
                ].map((plan, i) => (
                    <div key={i} className={`relative p-8 rounded-3xl border transition-all ${plan.isPopular ? 'bg-gray-900 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'}`}>
                        {plan.isPopular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                                Most Popular
                            </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                <p className="text-xs text-gray-500 font-mono mt-1">{plan.code}</p>
                            </div>
                            <button className="w-8 h-8 rounded-lg border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-white">${plan.price}</span>
                            <span className="text-gray-500 font-medium ml-2">/ month</span>
                        </div>
                        
                        <div className="space-y-4 mb-8 pb-8 border-b border-gray-800">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Max Patients</span>
                                <span className="font-bold text-white">{plan.patients}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Max Staff Users</span>
                                <span className="font-bold text-white">{plan.users}</span>
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
