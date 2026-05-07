import React from 'react';
import { getEmployees } from '@/app/actions/core-actions';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@amisimedos/ui';
import { Users, UserPlus, Trash2, Shield, Briefcase, Mail } from 'lucide-react';

export default async function UsersModule({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const employees = await getEmployees();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0a0a0b]">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Staff Management</h1>
                    <p className="text-neutral-500 mt-2 text-lg">Manage your hospital employees for <span className="text-amber-500 font-bold uppercase">{slug.replace('-', ' ')}</span>.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="bg-neutral-900/50 border-white/5 rounded-3xl h-fit">
                        <CardHeader><CardTitle className="text-white">Add New Employee</CardTitle></CardHeader>
                        <CardContent><form className="space-y-4"><Input name="firstName" placeholder="First Name" /><Button className="w-full">Register</Button></form></CardContent>
                    </Card>
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {employees.map((emp: any) => (
                            <Card key={emp.id} className="bg-neutral-900/50 border-white/5"><CardContent className="p-6">
                                <h3 className="text-xl font-bold text-white">{emp.firstName} {emp.lastName}</h3>
                                <div className="space-y-3 text-neutral-400"><p>{emp.role}</p><p>{emp.department}</p></div>
                            </CardContent></Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
