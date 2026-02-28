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
import { getEmployees } from '../actions/hr-actions';

export default async function HRDashboardPage() {
    const employees = await getEmployees();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <Briefcase className="h-10 w-10 text-indigo-500" />
                            HR Control Center
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">
                            Unified Hospital Workforce Management
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link
                            href="/hr/payroll"
                            className="flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-950 px-6 py-4 border border-gray-200 dark:border-gray-800 font-black text-gray-700 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all uppercase text-xs tracking-widest"
                        >
                            <DollarSign className="h-4 w-4" />
                            Payroll System
                        </Link>
                        <button className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-4 font-black text-white shadow-2xl shadow-indigo-500/20 hover:bg-indigo-600 transition-all hover:-translate-y-1 active:scale-95 uppercase text-xs tracking-widest">
                            <UserPlus className="h-4 w-4" />
                            Onboard Staff
                        </button>
                    </div>
                </header>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Name, Role or Department..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select className="bg-gray-50 dark:bg-gray-900 border-0 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all">
                            <option>All Departments</option>
                            <option>Clinical</option>
                            <option>Administration</option>
                            <option>Laboratory</option>
                            <option>Pharmacy</option>
                        </select>
                        <button className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <Filter className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Employee Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {employees.map((emp) => (
                        <div key={emp.id} className="bg-white dark:bg-gray-950 rounded-[40px] border border-gray-200 dark:border-gray-800 p-8 shadow-sm hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Building className="h-24 w-24" />
                            </div>

                            <div className="flex items-start justify-between mb-8">
                                <div className="h-20 w-20 rounded-[30px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
                                    <Users className="h-10 w-10 text-indigo-500" />
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {emp.status}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black tracking-tight">{emp.firstName} {emp.lastName}</h3>
                                <p className="text-sm font-black text-indigo-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    {emp.role}
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                                    <Building className="h-4 w-4 opacity-40" />
                                    {emp.department}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                                    <Mail className="h-4 w-4 opacity-40" />
                                    {emp.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                                    <Calendar className="h-4 w-4 opacity-40" />
                                    Joined {new Date(emp.dateJoined).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100 dark:border-gray-900 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Base Salary</span>
                                    <span className="text-lg font-black tracking-tight">${Number(emp.baseSalary).toLocaleString()}</span>
                                </div>
                                <button className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {employees.length === 0 && (
                        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-950 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800 p-20 text-center">
                            <Users className="h-20 w-20 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-gray-400">No Employees Found</h3>
                            <p className="text-gray-500 font-medium">Start onboarding your clinical and administrative staff.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
