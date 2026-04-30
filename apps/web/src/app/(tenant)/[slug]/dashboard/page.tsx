export const dynamic = 'force-dynamic';

import { getServerRole, getServerUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { 
    Activity, 
    Stethoscope, 
    Pill, 
    Beaker, 
    Wallet, 
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default async function RoleDashboardPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = await paramsPromise;
    const slug = params.slug;
    const user = await getServerUser();
    const role = user.role;

    // Direct Redirects for Operational Roles (Sub-second entry)
    if (role === 'RECEPTIONIST') redirect(`/${slug}/billing-on-duty`);
    if (role === 'PHARMACIST') redirect(`/${slug}/pharmacy-on-duty`);
    if (role === 'LAB_TECH') redirect(`/${slug}/lab`);

    return (
        <div className="min-h-screen bg-[#07070a] p-12 flex flex-col items-center justify-center">
            <div className="max-w-4xl w-full">
                <header className="mb-12 text-center">
                    <div className="h-20 w-20 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-900/40 mx-auto mb-8">
                        <Activity className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Welcome, {user.name}</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Operational Role: {role}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ROLE-SPECIFIC MISSION CONTROL */}
                    {(role === 'DOCTOR' || role === 'ADMIN') && (
                        <Link href={`/${slug}/doctor-on-duty`} className="group">
                            <div className="bg-blue-600/10 border border-blue-500/20 rounded-[40px] p-10 hover:bg-blue-600/20 transition-all flex flex-col h-full">
                                <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-8 shadow-xl">
                                    <Stethoscope className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-4 group-hover:text-blue-400 transition-colors">Start Clinic Duty</h3>
                                <p className="text-sm text-gray-500 font-bold leading-relaxed mb-10">Access patient queue, EMR, and clinical orders for your current shift.</p>
                                <div className="mt-auto flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                                    Launch Mission Control <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </Link>
                    )}

                    {(role === 'NURSE' || role === 'ADMIN') && (
                        <Link href={`/${slug}/triage-on-duty`} className="group">
                            <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-[40px] p-10 hover:bg-emerald-600/20 transition-all flex flex-col h-full">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center mb-8 shadow-xl">
                                    <Activity className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-4 group-hover:text-emerald-400 transition-colors">Start Triage Duty</h3>
                                <p className="text-sm text-gray-500 font-bold leading-relaxed mb-10">Manage patient intake, vitals recording, and ESI severity classification.</p>
                                <div className="mt-auto flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                    Open Intake Hub <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </Link>
                    )}

                    {(role === 'ADMIN') && (
                        <>
                            <Link href={`/${slug}/inventory`} className="group">
                                <div className="bg-purple-600/10 border border-purple-500/20 rounded-[40px] p-10 hover:bg-purple-600/20 transition-all flex flex-col h-full">
                                    <div className="h-14 w-14 rounded-2xl bg-purple-600 flex items-center justify-center mb-8 shadow-xl">
                                        <ShieldCheck className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase mb-4 group-hover:text-purple-400 transition-colors">Supply Management</h3>
                                    <p className="text-sm text-gray-500 font-bold leading-relaxed mb-10">Monitor central warehouse stock, expiry alerts, and procurement status.</p>
                                    <div className="mt-auto flex items-center gap-2 text-purple-500 text-[10px] font-black uppercase tracking-widest">
                                        Open Inventory <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </Link>

                            <Link href={`/${slug}/finance`} className="group">
                                <div className="bg-amber-600/10 border border-amber-500/20 rounded-[40px] p-10 hover:bg-amber-600/20 transition-all flex flex-col h-full">
                                    <div className="h-14 w-14 rounded-2xl bg-amber-600 flex items-center justify-center mb-8 shadow-xl">
                                        <Wallet className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase mb-4 group-hover:text-amber-400 transition-colors">Hospital Finance</h3>
                                    <p className="text-sm text-gray-500 font-bold leading-relaxed mb-10">Review revenue summaries, expenses, and P&L statements across all centers.</p>
                                    <div className="mt-auto flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                        Open Financials <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </Link>
                        </>
                    )}
                </div>

                <footer className="mt-16 pt-8 border-t border-gray-800 flex justify-center gap-12">
                    <div className="text-center">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">Authenticated As</span>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="text-xs font-bold text-gray-400">{user.name}</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">Access Level</span>
                        <span className="text-xs font-black text-blue-500 uppercase">{role} PRIVILEGED</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
