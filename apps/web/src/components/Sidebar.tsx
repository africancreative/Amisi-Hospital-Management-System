'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Settings,
    Activity,
    Building2,
    FileText,
    DollarSign,
    Microscope,
    Pill,
    Package,
    Briefcase,
    BookOpen,
    LogOut,
    Lock,
    Shield
} from 'lucide-react';
import { BillingResilienceWidget } from './BillingResilienceWidget';
import { api } from '@/trpc/react';
import { logout } from '@/app/actions/auth-actions';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users, module: 'EHR', roles: ['DOCTOR', 'NURSE', 'ADMIN'] },
    { name: 'Billing', href: '/billing', icon: DollarSign, module: 'BILLING', roles: ['ACCOUNTANT', 'ADMIN'] },
    { name: 'Laboratory', href: '/lab', icon: Microscope, module: 'LAB', roles: ['LAB_TECH', 'DOCTOR', 'ADMIN'] },
    { name: 'Pharmacy', href: '/pharmacy', icon: Pill, module: 'PHARMACY', roles: ['PHARMACIST', 'DOCTOR', 'ADMIN'] },
    { name: 'Inventory', href: '/inventory', icon: Package, module: 'INVENTORY', roles: ['PHARMACIST', 'ADMIN'] },
    { name: 'HR & Payroll', href: '/hr', icon: Briefcase, module: 'HR', roles: ['HR', 'ADMIN'] },
    { name: 'Accounting', href: '/accounting', icon: BookOpen, module: 'ACCOUNTING', roles: ['ACCOUNTANT', 'ADMIN'] },
    
    // System Level Routes (SuperAdmin)
    { name: 'Hospitals', href: '/admin/hospitals', icon: Building2, system: true },
    { name: 'Platform Users', href: '/admin/users', icon: Users, system: true },
    { name: 'Security', href: '/admin/security', icon: Lock, system: true },
    { name: 'Analytics', href: '/admin/analytics', icon: Activity, system: true },
    { name: 'Platform Settings', href: '/admin/settings', icon: Settings, system: true },
];

export default function Sidebar({
    enabledModules = [],
    userRole = 'ADMIN',
    userName = 'User',
    userEmail = '',
    isSystemAdmin = false
}: {
    enabledModules?: string[],
    userRole?: string,
    userName?: string,
    userEmail?: string,
    isSystemAdmin?: boolean
}) {
    const pathname = usePathname();
    const params = useParams();
    const slug = params?.slug as string;

    // Fetch Billing Status via tRPC
    const { data: billing } = api.nursing.getBillingStatus.useQuery(undefined, {
      enabled: !!slug && !isSystemAdmin
    });

    const filteredNavigation = navigation.filter(item => {
        // 1. Module check
        if (item.module && !enabledModules.includes(item.module)) return false;

        // 2. Role check
        if (item.roles && !item.roles.includes(userRole)) return false;

        // 3. System Admin routes check
        if (item.system && !isSystemAdmin) return false;

        // Users page logic
        if (item.href === '/users' && !isSystemAdmin && userRole !== 'ADMIN') return false;

        return true;
    });

    return (
        <div className="flex h-screen w-64 flex-col bg-gray-950 text-white border-r border-gray-800 transition-all duration-300 shrink-0">
            <div className="flex bg-gray-950 border-b border-gray-900 h-20 shrink-0 items-center px-6">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-emerald-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex h-10 w-10 items-center justify-center bg-gray-900 border border-emerald-500/50 font-black text-emerald-500 shadow-2xl">
                            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight text-white uppercase">
                            Amisi <span className="text-emerald-500">AmisiMedOS</span>
                        </span>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] -mt-1">
                            Enterprise Core
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-3">
                <div className="px-3 mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {isSystemAdmin ? 'System Admin' : userRole}
                    </p>
                    {slug && <span className="text-[10px] text-amber-500 font-bold uppercase">{slug}</span>}
                </div>
                
                {/* Billing Resilience Health Check */}
                {billing && (
                  <div className="px-3 mb-6">
                    <BillingResilienceWidget 
                      isExpired={billing.isExpired}
                      isLockout={billing.isLockout}
                      isWithinGrace={billing.isWithinGrace}
                      gracePeriodRemaining={billing.gracePeriodRemaining}
                      planCode={billing.planCode}
                    />
                  </div>
                )}

                <nav className="flex-1 space-y-1">
                    {filteredNavigation.map((item) => {
                        // Resolve actual href
                        let targetHref = item.href;
                        if (item.name === 'Dashboard') {
                            targetHref = isSystemAdmin ? '/system/dashboard' : (slug ? `/${slug}` : '/');
                        } else if (!item.system && slug) {
                            targetHref = `/${slug}${item.href}`;
                        } else if (item.system) {
                            targetHref = item.href;
                        }

                        const isActive = pathname === targetHref;
                        return (
                            <Link
                                key={item.name}
                                href={targetHref}
                                className={`
                  group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? 'bg-blue-600/10 text-blue-400'
                                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'}
                `}
                            >
                                <item.icon
                                    className={`
                    h-5 w-5 shrink-0 transition-colors duration-200
                    ${isActive ? 'text-emerald-500' : 'text-gray-500 group-hover:text-gray-300'}
                  `}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-800 space-y-3">
                <div className="flex items-center gap-3 rounded-md bg-gray-900/50 p-2 border border-gray-800">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-medium text-white shadow-inner">
                        {userName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white truncate">{userName}</span>
                        <span className="text-[10px] text-gray-500 truncate">{userEmail}</span>
                    </div>
                </div>

                <form action={logout}>
                    <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </form>
            </div>
        </div>
    );
}
