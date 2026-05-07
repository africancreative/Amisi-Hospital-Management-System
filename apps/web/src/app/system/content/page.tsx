import { ensureSuperAdmin } from '@/lib/auth-utils';
import { getGlobalSettings } from '@/app/actions/system-actions';
import LandingContentAdmin from './LandingContentAdmin';

export const dynamic = 'force-dynamic';

export default async function LandingContentPage() {
    await ensureSuperAdmin();
    const settings = await getGlobalSettings();

    return (
        <div className="p-8">
            <LandingContentAdmin initialSettings={settings} />
        </div>
    );
}
