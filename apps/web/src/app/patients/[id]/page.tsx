import Link from 'next/link';
import {
    ArrowLeft,
    User,
    HeartPulse,
    Calendar,
    ClipboardList,
    Plus,
    ArrowUpRight,
    FlaskConical,
    Thermometer,
    Scale,
    Heart,
    Activity,
    Stethoscope,
    FileText,
    MessageCircle
} from 'lucide-react';
import { getPatientById } from '@/app/actions/ehr-actions';
import { getHospitalSettings } from '@/app/actions/hospital-actions';
import { notFound } from 'next/navigation';
import ClinicalChat from '@/components/ClinicalChat';
import ExportPatientButton from '@/components/ExportPatientButton';

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
    const patient = await getPatientById(params.id);
    const hospitalSettings = await getHospitalSettings();

    if (!patient) {
        notFound();
    }

    // Combine encounters and chats for a unified timestamped timeline
    const timelineEvents = [
        ...patient.encounters.map((e: any) => ({ ...e, eventType: 'ENCOUNTER' })),
        ...(patient.chats || []).map((c: any) => ({ ...c, eventType: 'CHAT', createdAt: c.timestamp }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative">
            {/* Clinical Chat Overlay */}
            <ClinicalChat
                patientId={patient.id}
                authorName="Dr. Sarah Amisi"
                authorRole="Senior Clinician"
            />

            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <Link
                            href="/patients"
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Directory
                        </Link>
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <User className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight">{patient.lastName}, {patient.firstName}</h1>
                                <div className="flex items-center gap-3 mt-1 text-gray-500 font-medium">
                                    <span suppressHydrationWarning>{new Date(patient.dob).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="uppercase">{patient.gender || 'N/A'}</span>
                                    <span>•</span>
                                    <span className="text-xs font-mono">ID: {patient.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ExportPatientButton patient={patient} timelineEvents={timelineEvents} hospitalSettings={hospitalSettings} />
                        <Link
                            href={`/patients/${patient.id}/encounters/new`}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:-translate-y-0.5"
                        >
                            <Plus className="h-5 w-5" />
                            New Encounter
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Clinical History */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Vitals Summary */}
                        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <VitalsCard icon={Heart} label="Heart Rate" value={patient.vitals[0]?.heartRate?.toString() || '--'} unit="bpm" />
                            <VitalsCard icon={Activity} label="BP" value={patient.vitals[0]?.bloodPressure || '--'} unit="mmHg" />
                            <VitalsCard icon={Thermometer} label="Temp" value={patient.vitals[0]?.temperature?.toString() || '--'} unit="°C" />
                            <VitalsCard icon={Scale} label="Weight" value={patient.vitals[0]?.weight?.toString() || '--'} unit="kg" />
                        </section>

                        {/* Encounter Timeline */}
                        <section className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-emerald-500" />
                                    Clinical Timeline
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {timelineEvents.map((event: any, idx: number) => (
                                    <div key={event.id} className="relative pl-8 pb-8 last:pb-0">
                                        {idx !== timelineEvents.length - 1 && (
                                            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                                        )}
                                        <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 flex items-center justify-center overflow-hidden">
                                            {event.eventType === 'ENCOUNTER' ? (
                                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                            ) : (
                                                <MessageCircle className="h-3 w-3 text-emerald-500" />
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                            <div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${event.eventType === 'CHAT' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                                    {event.eventType === 'CHAT' ? 'Communication' : event.type}
                                                </span>
                                                <h3 className="text-lg font-bold mt-1" suppressHydrationWarning>{new Date(event.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</h3>
                                                <p className="text-sm text-gray-500 mt-1 font-medium italic">
                                                    {event.eventType === 'CHAT' ? event.authorName : `Dr. ${event.doctorName}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`mt-4 p-4 rounded-xl border ${event.eventType === 'CHAT' ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-900'}`}>
                                            {event.content || event.notes ? (
                                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                                    {event.notes || event.content}
                                                </p>
                                            ) : null}

                                            {/* Media Attachments in Timeline */}
                                            {event.attachments && event.attachments.length > 0 && (
                                                <div className="grid grid-cols-2 gap-3 mt-4">
                                                    {event.attachments.map((att: any) => (att.type === 'image' ? (
                                                        <div key={att.id} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                                                            <img src={att.url} alt="Clinical Attachment" className="w-full h-40 object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div key={att.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
                                                            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                                {att.type === 'voice' ? <HeartPulse className="h-5 w-5 text-emerald-500" /> : <FileText className="h-5 w-5 text-gray-400" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold truncate max-w-[120px]">{att.fileName || 'Attachment'}</p>
                                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{att.type}</p>
                                                            </div>
                                                        </div>
                                                    )))}
                                                </div>
                                            )}

                                            {!event.notes && !event.content && !event.attachments?.length && (
                                                <p className="text-sm leading-relaxed text-gray-400 italic">
                                                    No clinical notes recorded.
                                                </p>
                                            )}

                                            {event.plan && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Management Plan</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{event.plan}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {timelineEvents.length === 0 && (
                                    <div className="text-center py-10 text-gray-500 italic">
                                        No clinical history recorded yet.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Recent Lab Results */}
                        <section className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                        <FlaskConical className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        Recent Lab Results
                                    </h2>
                                </div>
                                <Link
                                    href={`/patients/${patient.id}/lab`}
                                    className="text-xs font-black text-blue-500 hover:underline flex items-center gap-1"
                                >
                                    Full History
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </div>
                            <div className="p-0">
                                {patient.labOrders.length > 0 ? (
                                    <table className="w-full text-left">
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                                            {patient.labOrders.slice(0, 3).map((order: any) => (
                                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{order.testName}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20' : 'text-orange-500 bg-orange-100 dark:bg-orange-900/20'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-xs text-gray-500" suppressHydrationWarning>
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-6 space-y-3"> {/* Added a div wrapper for the buttons */}
                                        <button className="w-full py-4 px-6 border border-emerald-500/30 text-emerald-500 rounded-2xl font-black text-sm hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Issue Prescription
                                        </button>
                                        <button className="w-full py-4 px-6 border border-blue-500/30 text-blue-500 rounded-2xl font-black text-sm hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2">
                                            <FlaskConical className="h-4 w-4" />
                                            Order Lab Test
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        {/* Allergies */}
                        <section className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                            <h3 className="text-lg font-black uppercase tracking-widest text-red-500 flex items-center gap-2 mb-4">
                                <ClipboardList className="h-5 w-5" />
                                Allergies
                            </h3>
                            <div className="space-y-3">
                                {patient.allergies.map((allergy: any) => (
                                    <div key={allergy.id} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                        <p className="text-sm font-black text-red-700 dark:text-red-400">{allergy.substance}</p>
                                        <p className="text-xs text-red-600/80 dark:text-red-400/60 mt-0.5">{allergy.reaction} ({allergy.severity})</p>
                                    </div>
                                ))}
                                {patient.allergies.length === 0 && (
                                    <p className="text-sm text-gray-500 italic">No documented allergies.</p>
                                )}
                            </div>
                        </section>

                        {/* Quick Stats */}
                        <section className="bg-emerald-950 text-white rounded-2xl p-6 shadow-xl shadow-emerald-500/10">
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-6">Patient Stats</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm opacity-80">Total Visits</span>
                                    <span className="text-2xl font-black">{patient.encounters.length}</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VitalsCard({ icon: Icon, label, value, unit }: { icon: any, label: string, value: string, unit: string }) {
    return (
        <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{value}</span>
                <span className="text-xs font-bold text-gray-500">{unit}</span>
            </div>
        </div>
    )
}
