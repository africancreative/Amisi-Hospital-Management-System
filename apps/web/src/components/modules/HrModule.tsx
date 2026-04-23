import React from 'react';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Briefcase,
    Mail,
    Phone,
    MoreHorizontal,
    BadgeCheck,
    Building,
    Calendar,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { getEmployees } from '@/app/actions/hr-actions';

export default async function HrModule({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const employees = await getEmployees();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <Briefcase className="h-10 w-10 text-indigo-500" /> HR Control Center
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">Unified Hospital Workforce Management</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href={`/${slug}/hr/payroll`} className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 border font-black text-xs tracking-widest"><DollarSign className="h-4 w-4" /> Payroll System</Link>
                        <button className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-4 font-black text-white shadow-2xl text-xs tracking-widest"><UserPlus className="h-4 w-4" /> Onboard Staff</button>
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {employees.map((emp: any) => (
                        <div key={emp.id} className="bg-white dark:bg-gray-950 rounded-[40px] border border-gray-200 p-8 shadow-sm hover:border-indigo-500/30 transition-all group relative">
                            <div className="flex items-start justify-between mb-8">
                                <div className="h-20 w-20 rounded-[30px] bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner"><Users className="h-10 w-10 text-indigo-500" /></div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{emp.status}</div>
                            </div>
                            <div className="mb-8"><h3 className="text-2xl font-black tracking-tight">{emp.firstName} {emp.lastName}</h3><p className="text-sm font-black text-indigo-500 uppercase tracking-widest mt-1 flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> {emp.role}</p></div>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-500"><Building className="h-4 w-4 opacity-40" /> {emp.department}</div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-500"><Mail className="h-4 w-4 opacity-40" /> {emp.email}</div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-500">Joined {new Date(emp.dateJoined).toLocaleDateString()}</div>
                            </div>
                            <div className="pt-8 border-t flex justify-between items-center"><div className="flex flex-col"><span className="text-[10px] font-black uppercase text-gray-400">Base Salary</span><span className="text-lg font-black tracking-tight">${Number(emp.baseSalary).toLocaleString()}</span></div><button className="p-3 rounded-2xl bg-gray-50"><MoreHorizontal className="h-5 w-5 text-gray-400" /></button></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
