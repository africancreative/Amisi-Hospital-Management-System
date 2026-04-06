import { redirect } from 'next/navigation';
import { getControlDb } from '@/lib/db';
import { Activity, Pill, Beaker, Stethoscope, Users, Box, BedDouble, ShieldCheck, Home } from 'lucide-react';
import Link from 'next/link';

// Map generic system codes to UI routes and icons
const MODULE_REGISTRY: Record<string, { name: string, href: string, icon: any }> = {
    'CLINICAL': { name: 'Clinics', href: '/clinical', icon: Stethoscope },
    'WARD': { name: 'Admissions & ADT', href: '/ward', icon: BedDouble },
    'PHARMACY': { name: 'PharmOS', href: '/pharmacy', icon: Pill },
    'SCM': { name: 'Procurement', href: '/procurement', icon: Box },
    'LAB': { name: 'Laboratory', href: '/lab', icon: Beaker },
    'RADIO': { name: 'Radiology PACS', href: '/radiology', icon: Activity },
    'HR': { name: 'HR & Staff', href: '/hr', icon: Users },
    'HIM': { name: 'Records & HIPAA', href: '/him', icon: ShieldCheck }
};

export default async function TenantLayout({
    children,
    params: paramsPromise,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const params = await paramsPromise;
    const slug = params.slug;

    // VERY IMPORTANT: Read the control matrix for this specific branch
    const controlDb = getControlDb();
    const tenant = await controlDb.tenant.findUnique({
        where: { slug }
    });

    if (!tenant || tenant.status !== 'active') {
        redirect('/system/suspended');
    }

    // enabledModules is stored as Json, e.g. ["PHARMACY", "LAB", "SCM"]
    const activeModCodes = tenant.enabledModules as string[] || [];

    // Filter available links securely based on the Tenant's purchased entitlements
    const navLinks = activeModCodes
        .filter(code => MODULE_REGISTRY[code])
        .map(code => MODULE_REGISTRY[code]);

    return (
        <div className="flex h-screen bg-[#0a0a0b] text-white selection:bg-blue-500/30">
            {/* Dynamic RBAC Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-black/40 flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">
                        {tenant.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm truncate">{tenant.name}</span>
                        <span className="text-[10px] text-blue-400 font-mono">[{tenant.tier}]</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <Link href={`/${slug}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold">
                        <Home className="h-4 w-4" /> Dashboard
                    </Link>
                    
                    <div className="pt-6 pb-2 px-4 text-xs font-bold text-neutral-600 uppercase tracking-widest">Active Modules</div>
                    
                    {navLinks.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-neutral-500">No enterprise modules bounded.</div>
                    ) : (
                        navLinks.map((link, idx) => {
                            const Icon = link.icon;
                            return (
                                <Link key={idx} href={`/${slug}${link.href}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold group">
                                    <Icon className="h-4 w-4 text-neutral-500 group-hover:text-blue-400 transition-colors" /> {link.name}
                                </Link>
                            )
                        })
                    )}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold cursor-pointer hover:bg-red-500/20 transition-colors">
                        Logout Session
                    </div>
                </div>
            </aside>

            {/* Main Hospital Working Area */}
            <main className="flex-1 overflow-y-auto relative">
                {children}
            </main>
        </div>
    );
}
