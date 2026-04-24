import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProvisioningForm } from "@/components/system/provisioning-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function OnboardHospitalPage() {
    const cookieStore = await cookies();
    const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    if (!isSystemAdmin) {
        redirect('/system/login');
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div className="space-y-4">
                        <Link href="/system/dashboard" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">Back to Infrastructure</span>
                        </Link>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic">
                            Onboard <span className="text-blue-500">Hospital</span>
                        </h1>
                        <p className="text-neutral-500 max-w-xl text-lg">
                            Initialize a new isolated instance of the AmisiMedOS. 
                            This will automate database provisioning and security seeding.
                        </p>
                    </div>
                </header>

                <main>
                    <ProvisioningForm />
                </main>
            </div>
        </div>
    );
}
