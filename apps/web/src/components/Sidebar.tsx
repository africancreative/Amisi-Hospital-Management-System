'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    BookOpen
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users, module: 'EHR', roles: ['DOCTOR', 'NURSE', 'ADMIN'] },
    { name: 'Billing', href: '/billing', icon: DollarSign, module: 'BILLING', roles: ['ACCOUNTANT', 'ADMIN'] },
    { name: 'Laboratory', href: '/lab', icon: Microscope, module: 'LAB', roles: ['LAB_TECH', 'DOCTOR', 'ADMIN'] },
    { name: 'Pharmacy', href: '/pharmacy', icon: Pill, module: 'PHARMACY', roles: ['PHARMACIST', 'DOCTOR', 'ADMIN'] },
    { name: 'Inventory', href: '/inventory', icon: Package, module: 'INVENTORY', roles: ['PHARMACIST', 'ADMIN'] },
    { name: 'HR & Payroll', href: '/hr', icon: Briefcase, module: 'HR', roles: ['HR', 'ADMIN'] },
    { name: 'Accounting', href: '/accounting', icon: BookOpen, module: 'ACCOUNTING', roles: ['ACCOUNTANT', 'ADMIN'] },
    { name: 'Hospitals', href: '/hospitals', icon: Building2, roles: ['ADMIN'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Analytics', href: '/analytics', icon: Activity, roles: ['ADMIN', 'DOCTOR', 'ACCOUNTANT'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export default function Sidebar({
    enabledModules = [],
    userRole = 'ADMIN',
    userName = 'System Admin',
    userEmail = 'admin@amisi.com'
}: {
    enabledModules?: string[],
    userRole?: string,
    userName?: string,
    userEmail?: string
}) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter(item => {
        // 1. Module check
        if (item.module && !enabledModules.includes(item.module)) return false;

        // 2. Role check
        if (item.roles && !item.roles.includes(userRole)) return false;

        return true;
    });

    return (
        <div className="flex h-screen w-64 flex-col bg-gray-950 text-white border-r border-gray-800 transition-all duration-300">
            <div className="flex bg-gray-900 border-b border-gray-800 h-16 shrink-0 items-center px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/30">
                        A
                    </div>
                    <span className="text-lg font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Amisi Cloud
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-3">
                <div className="px-3 mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Super Admin</p>
                </div>
                <nav className="flex-1 space-y-1">
                    {filteredNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'}
                `}
                            >
                                <item.icon
                                    className={`
                    h-5 w-5 shrink-0 transition-colors duration-200
                    ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}
                  `}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 rounded-md bg-gray-900/50 p-2 border border-gray-800">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-medium text-white shadow-inner">
                        SA
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">System Admin</span>
                        <span className="text-xs text-gray-400">admin@amisi.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
