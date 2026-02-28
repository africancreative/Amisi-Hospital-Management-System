import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    FlaskConical,
    CheckCircle2,
    AlertCircle,
    Calendar,
    User,
    Clock,
    Printer,
    FileText
} from 'lucide-react';
import { getPatientById } from '../../actions/ehr-actions';

export default async function PatientLabHistoryPage({ params }: { params: { id: string } }) {
    const patient = await getPatientById(params.id);

    if (!patient) {
        notFound();
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="mx-auto max-w-5xl">
                <header className="mb-10">
                    <Link
                        href={`/patients/${patient.id}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Clinical Profile
                    </Link>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                <FlaskConical className="h-10 w-10 text-blue-500" />
                                Laboratory History
                            </h1>
                            <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">
                                {patient.lastName}, {patient.firstName} • Clinical Records
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm">
                            <Printer className="h-4 w-4" />
                            Print Report
                        </button>
                    </div>
                </header>

                <div className="space-y-8">
                    {patient.labOrders.map((order: any) => (
                        <div key={order.id} className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                        <FlaskConical className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">{order.testName}</h3>
                                        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> Ref: Dr. {order.orderedBy}</span>
                                        </div>
                                    </div>
                                </div>
                                <StatusPill status={order.status} />
                            </div>

                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                            <th className="px-8 py-4">Parameter</th>
                                            <th className="px-4 py-4 text-center">Result</th>
                                            <th className="px-4 py-4 text-center">Flag</th>
                                            <th className="px-4 py-4">Reference Range</th>
                                            <th className="px-8 py-4 text-right">Performed By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                                        {order.results.map((res: any) => (
                                            <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                                <td className="px-8 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    {res.parameter}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="text-sm font-black dark:text-white">
                                                        {res.value} <span className="text-[10px] lowercase text-gray-500">{res.unit}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {res.flag && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${res.flag === 'Normal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {res.flag}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-xs font-medium text-gray-500">
                                                    {res.referenceRange}
                                                </td>
                                                <td className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    {res.performedBy}
                                                </td>
                                            </tr>
                                        ))}
                                        {order.results.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-10 text-center text-gray-500 italic font-medium">
                                                    Results are pending processing...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {patient.labOrders.length === 0 && (
                        <div className="bg-white dark:bg-gray-950 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-20 text-center">
                            <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-gray-400">Clean Laboratory History</h3>
                            <p className="text-gray-500">No laboratory test orders or results found for this patient.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const isCompleted = status === 'completed';
    const isPending = status === 'pending';

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                isPending ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
            {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {status}
        </span>
    );
}
