import { OnDutyProvider } from '@/context/OnDutyContext';
import OnDutyWrapper from '@/components/clinical/OnDutyWrapper';
import { getServerRole, getServerUser } from '@/lib/auth-utils';
import { getControlDb } from '@/lib/modules';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
    Home, 
    Stethoscope, 
    Pill, 
    Beaker, 
    Wallet, 
    Package, 
    Bed, 
    MessageSquare, 
    Settings,
    LogOut,
    Shield
} from 'lucide-react';

const MODULE_REGISTRY: any = {
    'EHR': { name: 'Patients & EMR', href: '/emr', icon: Stethoscope, roles: ['DOCTOR', 'NURSE', 'ADMIN'] },
    'PHARMACY': { name: 'Pharmacy', href: '/pharmacy', icon: Pill, roles: ['PHARMACIST', 'DOCTOR', 'ADMIN'] },
    'LAB': { name: 'Laboratory', href: '/lab', icon: Beaker, roles: ['LAB_TECH', 'DOCTOR', 'ADMIN'] },
    'BILLING': { name: 'Billing', href: '/billing', icon: Wallet, roles: ['ACCOUNTANT', 'RECEPTIONIST', 'ADMIN'] },
    'INVENTORY': { name: 'Inventory', href: '/inventory', icon: Package, roles: ['ADMIN', 'PHARMACIST'] },
    'WARD': { name: 'Wards', href: '/wards', icon: Bed, roles: ['NURSE', 'DOCTOR', 'ADMIN'] },
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
    const user = await getServerUser();
    const role = user.role;

    const controlDb = getControlDb();
    const tenant = await controlDb.tenant.findUnique({
        where: { slug }
    });

    if (!tenant || tenant.status !== 'active') {
        redirect('/system/suspended');
    }

    const activeModCodes = tenant.enabledModules as string[] || [];

    // Filter by BOTH Tenant Entitlements AND User Role
    const navLinks = activeModCodes
        .filter((code: any) => MODULE_REGISTRY[code])
        .filter((code: any) => MODULE_REGISTRY[code].roles.includes(role))
        .map((code: any) => MODULE_REGISTRY[code]);

    const Sidebar = (
        <aside className="w-64 border-r border-white/5 bg-black/40 flex flex-col shrink-0">
            <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">
                    {tenant.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm truncate">{tenant.name}</span>
                    <span className="text-[10px] text-blue-400 font-mono">[{tenant.tier}]</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <Link href={`/${slug}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold">
                    <Home className="h-4 w-4" /> Overview
                </Link>

                <Link href={`/${slug}/chat`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold">
                    <MessageSquare className="h-4 w-4" /> Internal Chat
                </Link>
                
                <div className="pt-6 pb-2 px-4 text-xs font-black text-neutral-600 uppercase tracking-widest">Clinical Access</div>
                
                {navLinks.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-neutral-500 italic">No modules assigned to your role.</div>
                ) : (
                    navLinks.map((link: any, idx: any) => {
                        const Icon = link.icon;
                        return (
                            <Link key={idx} href={`/${slug}${link.href}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold group">
                                <Icon className="h-4 w-4 text-neutral-500 group-hover:text-blue-400 transition-colors" /> {link.name}
                            </Link>
                        )
                    })
                )}

                {role === 'ADMIN' && (
                    <>
                        <div className="pt-6 pb-2 px-4 text-xs font-black text-neutral-600 uppercase tracking-widest">Management</div>
                        <Link href={`/${slug}/settings`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold">
                            <Settings className="h-4 w-4" /> Hospital Config
                        </Link>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{user.name}</span>
                        <span className="text-[9px] font-bold text-blue-400 uppercase">{role}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-rose-500/20 transition-colors">
                    <LogOut className="h-4 w-4" /> Logout
                </div>
            </div>
        </aside>
    );

    return (
        <OnDutyProvider>
            <OnDutyWrapper sidebar={Sidebar}>
                {children}
            </OnDutyWrapper>
        </OnDutyProvider>
    );
}
