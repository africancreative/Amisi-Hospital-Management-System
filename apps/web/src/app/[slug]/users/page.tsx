import { getEmployees, addEmployee, removeEmployee } from '../../actions/user-actions';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@amisimedos/ui';
import { Users, UserPlus, Trash2, Shield, Briefcase, Mail } from 'lucide-react';
import { Role } from '@amisimedos/db';

export default async function UsersPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const employees = await getEmployees();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0a0a0b]">
            <div className="mx-auto max-w-7xl">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">Staff Management</h1>
                        <p className="text-neutral-500 mt-2 text-lg">
                            Manage your hospital employees and their access roles for <span className="text-amber-500 font-bold uppercase">{slug.replace('-', ' ')}</span>.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Employee Form */}
                    <Card className="bg-neutral-900/50 border-white/5 backdrop-blur-xl shadow-2xl rounded-3xl h-fit sticky top-8">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <UserPlus className="h-6 w-6 text-blue-400" />
                                <CardTitle className="text-white">Add New Employee</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form action={async (formData: FormData) => {
                                'use server';
                                const data = {
                                    employeeId: formData.get('employeeId') as string,
                                    firstName: formData.get('firstName') as string,
                                    lastName: formData.get('lastName') as string,
                                    email: formData.get('email') as string,
                                    role: formData.get('role') as Role,
                                    department: formData.get('department') as string,
                                    baseSalary: Number(formData.get('salary')),
                                };
                                await addEmployee(data);
                            }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-neutral-400">First Name</Label>
                                        <Input name="firstName" required className="bg-white/5 border-white/10 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-neutral-400">Last Name</Label>
                                        <Input name="lastName" required className="bg-white/5 border-white/10 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-400">Email Address</Label>
                                    <Input name="email" type="email" required className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-neutral-400">Employee ID</Label>
                                        <Input name="employeeId" required className="bg-white/5 border-white/10 text-white" placeholder="EMP-00X" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-neutral-400">Role</Label>
                                        <select name="role" className="w-full rounded-xl bg-white/5 border-white/10 text-white h-12 px-3 focus:ring-blue-500/20 focus:border-blue-500/50">
                                            <option value="DOCTOR">Doctor</option>
                                            <option value="NURSE">Nurse</option>
                                            <option value="ACCOUNTANT">Accountant</option>
                                            <option value="PHARMACIST">Pharmacist</option>
                                            <option value="LAB_TECH">Lab Technician</option>
                                            <option value="HR">HR Manager</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-neutral-400">Department</Label>
                                        <Input name="department" required className="bg-white/5 border-white/10 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-neutral-400">Base Salary</Label>
                                        <Input name="salary" type="number" required className="bg-white/5 border-white/10 text-white" />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl mt-4">
                                    Register Employee
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Employee List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white">Active Personnel</h2>
                            <span className="bg-blue-500/10 text-blue-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                                {employees.length} Total Staff
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {employees.map((emp: any) => (
                                <Card key={emp.id} className="bg-neutral-900/50 border-white/5 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                {emp.firstName[0]}{emp.lastName[0]}
                                            </div>
                                            <form action={async () => {
                                                'use server';
                                                await removeEmployee(emp.id);
                                            }}>
                                                <button className="p-2 text-neutral-600 hover:text-rose-500 transition-colors">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </form>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{emp.firstName} {emp.lastName}</h3>
                                        <p className="text-sm text-neutral-500 mb-4">{emp.employeeId}</p>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm text-neutral-400">
                                                <Shield className="h-4 w-4 text-emerald-500" />
                                                <span className="font-medium">{emp.role}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-neutral-400">
                                                <Briefcase className="h-4 w-4 text-blue-400" />
                                                <span>{emp.department}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-neutral-400">
                                                <Mail className="h-4 w-4 text-amber-500" />
                                                <span className="truncate">{emp.email}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {emp.status}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Base Salary</p>
                                                <p className="text-sm font-bold text-white">KES {Number(emp.baseSalary).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
