import { cookies, headers } from 'next/headers';
import { EventLogPanel } from '@/components/events/EventLogPanel';

export default async function AdminEventsPage(props: { searchParams: Promise<{ tenantId?: string }> }) {
  const searchParams = await props.searchParams;
  const headerList = await headers();
  const cookieStore = await cookies();

  const tenantId =
    searchParams.tenantId ??
    headerList.get('x-tenant-id') ??
    cookieStore.get('amisi-tenant-id')?.value;

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-400">No tenant context</p>
          <p className="text-sm text-gray-500 mt-1">Select a hospital to view its event log</p>
        </div>
      </div>
    );
  }

  return <EventLogPanel tenantId={tenantId} />;
}
