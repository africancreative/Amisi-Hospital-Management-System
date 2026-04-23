'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Zap, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { getTenantSubscription } from '@/app/actions/dashboard-actions';

export default function SubscriptionModule({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTenantSubscription().then(sub => {
            setSubscription(sub);
            setLoading(false);
        });
    }, []);

    const plans = [
        { name: 'Essential', price: '$49', features: ['PMI', 'OPD', 'Basic Pharmacy'] },
        { name: 'Professional', price: '$129', features: ['Everything in Essential', 'IPD / Wards', 'Lab & Rad'] },
        { name: 'Enterprise', price: '$299', features: ['Everything in Professional', 'Multi-Branch', 'Audit Logs'] }
    ];

    if (loading) return <div className="p-8 text-white">Verifying license...</div>;

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0a0a0b] text-white selection:bg-blue-500/30">
            <div className="mx-auto max-w-7xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <CreditCard className="h-10 w-10 text-blue-500" /> Subscription & Licensing
                    </h1>
                    <p className="text-neutral-500 mt-2 text-lg">Manage your hospital's commitment and scale.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Current Plan Status */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-neutral-900 border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5"><Zap className="h-24 w-24" /></div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mb-6">Active Plan</h2>
                            <div className="mb-8">
                                <span className="text-4xl font-black text-white">{subscription?.plan?.name || 'TRIAL'}</span>
                                <p className="text-blue-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Hospital Deployment Tier</p>
                            </div>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm"><span className="text-neutral-400">Status</span><span className="text-emerald-500 font-bold uppercase">Active</span></div>
                                <div className="flex justify-between text-sm"><span className="text-neutral-400">Renews On</span><span className="text-white font-mono">{subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</span></div>
                            </div>
                            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Download Receipt</button>
                        </div>
                    </div>

                    {/* Upgrade/Change Plan */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.map(p => (
                            <div key={p.name} className="bg-neutral-900/50 border border-white/5 p-8 rounded-[40px] hover:border-blue-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-white">{p.name}</h3>
                                        <p className="text-neutral-500 text-sm">{p.price} / month</p>
                                    </div>
                                    <CheckCircle2 className="h-6 w-6 text-neutral-700 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {p.features.map(f => (
                                        <li key={f} className="text-xs text-neutral-400 flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-blue-500" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest transition-all">Select Plan</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
