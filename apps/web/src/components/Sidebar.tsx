'use client';

import React, { useState, useEffect } from 'react';
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
    CreditCard,
    Microscope,
    Pill,
    Package,
    Briefcase,
    BookOpen,
    LogOut,
    Lock,
    Shield,
    Globe,
    Search,
    MessageSquare,
    Repeat,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { BillingResilienceWidget } from './BillingResilienceWidget';
import { api } from '@/trpc/react';
import { logout } from '@/app/actions/auth-actions';

const tenantNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users, module: 'EHR', roles: ['DOCTOR', 'NURSE', 'ADMIN'] },
    { name: 'Billing', href: '/billing', icon: DollarSign, module: 'BILLING', roles: ['ACCOUNTANT', 'ADMIN'] },
    { name: 'Laboratory', href: '/lab', icon: Microscope, module: 'LAB', roles: ['LAB_TECH', 'DOCTOR', 'ADMIN'] },
    { name: 'Pharmacy', href: '/pharmacy', icon: Pill, module: 'PHARMACY', roles: ['PHARMACIST', 'DOCTOR', 'ADMIN'] },
    { name: 'Inventory', href: '/inventory', icon: Package, module: 'INVENTORY', roles: ['PHARMACIST', 'ADMIN'] },
    { name: 'HR & Payroll', href: '/hr', icon: Briefcase, module: 'HR', roles: ['HR', 'ADMIN'] },
    { name: 'Accounting', href: '/accounting', icon: BookOpen, module: 'ACCOUNTING', roles: ['ACCOUNTANT', 'ADMIN'] },
];

const SYSTEM_ADMIN_NAV = {
    system: [
        { name: 'Dashboard', href: '/system/dashboard', icon: LayoutDashboard },
        { name: 'Hospitals', href: '/system/tenants', icon: Building2 },
        { name: 'Platform Users', href: '/system/users', icon: Users },
        { name: 'Security', href: '/system/security', icon: Shield },
        { name: 'Analytics', href: '/system/analytics', icon: Activity },
        { name: 'Platform Settings', href: '/system/settings', icon: Settings },
    ],
    web: [
        { name: 'Landing Content', href: '/system/content', icon: Globe },
        { name: 'Blog & News', href: '/system/web/blog', icon: FileText },
        { name: 'SEO Config', href: '/system/web/seo', icon: Search },
        { name: 'Pricing Plans', href: '/system/web/pricing', icon: CreditCard },
        { name: 'Contact Forms', href: '/system/web/contact', icon: MessageSquare },
    ],
    crm: [
        { name: 'CRM Dashboard', href: '/system/crm/dashboard', icon: LayoutDashboard },
        { name: 'Leads & Pipeline', href: '/system/crm/leads', icon: Users },
        { name: 'Automations', href: '/system/crm/automation', icon: Repeat },
        { name: 'Analytics', href: '/system/crm/analytics', icon: Activity },
    ]
};

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
    const [adminMode, setAdminMode] = useState<'system' | 'web' | 'crm'>('system');

    // Sync admin mode with URL
    useEffect(() => {
        if (isSystemAdmin) {
            if (pathname.includes('/system/web') || pathname.includes('/system/content')) {
                setAdminMode('web');
            } else if (pathname.includes('/system/crm')) {
                setAdminMode('crm');
            } else {
                setAdminMode('system');
            }
        }
    }, [pathname, isSystemAdmin]);

    // Fetch Billing Status via tRPC
    const { data: billing } = api.nursing.getBillingStatus.useQuery(undefined, {
      enabled: !!slug && !isSystemAdmin
    });

    const filteredNavigation = isSystemAdmin 
        ? SYSTEM_ADMIN_NAV[adminMode] 
        : tenantNavigation.filter((item: any) => {
            if (item.module && !enabledModules.includes(item.module)) return false;
            if (item.roles && !item.roles.includes(userRole)) return false;
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
                {/* Admin Mode Toggle (Only for System Admins) */}
                {isSystemAdmin && (
                    <div className="px-3 mb-6">
                        <div className="bg-gray-900 rounded-xl p-1 flex items-center relative border border-gray-800">
                            <button
                                onClick={() => setAdminMode('system')}
                                className={`flex-1 py-2 text-[9px] uppercase tracking-wider font-black rounded-lg transition-all relative z-10 ${adminMode === 'system' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                            >
                                System
                            </button>
                            <button
                                onClick={() => setAdminMode('web')}
                                className={`flex-1 py-2 text-[9px] uppercase tracking-wider font-black rounded-lg transition-all relative z-10 ${adminMode === 'web' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                            >
                                Web
                            </button>
                            <button
                                onClick={() => setAdminMode('crm')}
                                className={`flex-1 py-2 text-[9px] uppercase tracking-wider font-black rounded-lg transition-all relative z-10 ${adminMode === 'crm' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                            >
                                CRM
                            </button>
                            <div 
                                className="absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-blue-600 rounded-lg transition-all duration-300 shadow-lg shadow-blue-600/20"
                                style={{ left: adminMode === 'system' ? '4px' : adminMode === 'web' ? 'calc(33.33% + 2px)' : 'calc(66.66%)' }}
                            />
                        </div>
                    </div>
                )}

                <div className="px-3 mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                        {isSystemAdmin ? `${adminMode.toUpperCase()} ADMIN` : userRole.replace('_', ' ')}
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
                    {filteredNavigation.map((item: any) => {
                        // Resolve actual href
                        let targetHref = item.href;
                        if (!isSystemAdmin) {
                            if (item.name === 'Dashboard') {
                                targetHref = slug ? `/${slug}` : '/';
                            } else if (slug) {
                                targetHref = `/${slug}${item.href}`;
                            }
                        }

                        const isActive = pathname === targetHref || (targetHref !== '/system/dashboard' && pathname.startsWith(targetHref));
                        
                        return (
                            <Link
                                key={item.name}
                                href={targetHref}
                                className={`
                                    group flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold transition-all duration-300
                                    ${isActive
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                                        : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300 border border-transparent'}
                                `}
                            >
                                <item.icon
                                    className={`
                                        h-4 w-4 shrink-0 transition-colors duration-300
                                        ${isActive ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}
                                    `}
                                    aria-hidden="true"
                                />
                                <span className="flex-1 uppercase tracking-wider">{item.name}</span>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-900 space-y-4 bg-gray-950/50">
                <div className="flex items-center gap-3 rounded-xl bg-gray-900/40 p-3 border border-gray-800/50 backdrop-blur-sm">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg">
                        {userName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-white truncate uppercase tracking-tight">{userName}</span>
                        <span className="text-[10px] text-gray-500 truncate font-bold uppercase tracking-wider">{isSystemAdmin ? 'System Admin' : userRole}</span>
                    </div>
                </div>

                <form action={logout}>
                    <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 border border-gray-800 px-3 py-2.5 text-[10px] font-black text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all duration-300 uppercase tracking-widest"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Logout
                    </button>
                </form>
            </div>
        </div>
    );
}
