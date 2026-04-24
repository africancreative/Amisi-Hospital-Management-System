import { getTenantById } from "@/app/actions/tenant-actions";
import { HospitalEditForm } from "@/components/system/HospitalEditForm";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Building2, ShieldCheck } from "lucide-react";

export default async function EditHospitalPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const cookieStore = await cookies();
    const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    if (!isSystemAdmin) {
        redirect('/system/login');
    }

    const tenant = await getTenantById(id);

    if (!tenant) {
        notFound();
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0a0a0b]">
            <div className="mx-auto max-w-4xl">
                <header className="mb-12">
                    <Link 
                        href="/system/dashboard" 
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-8 group"
                    >
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Control Plane</span>
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                    Node Status: {tenant.status}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-neutral-700" />
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tier: {tenant.tier}</span>
                            </div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none flex items-center gap-4">
                                <Building2 className="h-10 w-10 text-blue-500" />
                                <span>{tenant.name}</span>
                            </h1>
                            <p className="text-neutral-500 mt-4 text-lg font-medium">Orchestration & Administrative Controls</p>
                        </div>

                        <div className="hidden md:flex h-20 w-20 rounded-3xl bg-neutral-900 border border-white/5 items-center justify-center text-blue-500/20">
                             <ShieldCheck className="h-10 w-10" />
                        </div>
                    </div>
                </header>

                <HospitalEditForm tenant={tenant} />

                <footer className="mt-12 pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">
                        System Orchestrator v4.2.0 • Security Scoped Access
                    </p>
                </footer>
            </div>
        </div>
    );
}
