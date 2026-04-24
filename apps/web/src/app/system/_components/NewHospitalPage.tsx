import { fetchModules } from '@/app/actions/system-actions';
import OnboardingForm from './OnboardingForm';

export default async function NewHospitalPage() {
    // 1. Fetch available enterprise modules from the control database
    const modules = await fetchModules();

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-amber-500/30 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tighter mb-2 italic">Provision Tenant</h1>
                    <p className="text-neutral-500">Deploy a highly-available Next.js isolated database cluster and assign enterprise modules.</p>
                </div>

                {/* Secure Client Side Form Engine */}
                <OnboardingForm availableModules={modules} />
            </div>
        </div>
    );
}
