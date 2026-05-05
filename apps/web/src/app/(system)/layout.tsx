import type { Metadata } from 'next';
import '../globals.css';
import { cookies, headers } from 'next/headers';
import { TrpcProvider } from '@/trpc/Provider';
import { RealtimeProvider } from '@/lib/realtime-provider';
import SystemAdminLayout from '@/components/system-admin/SystemAdminLayout';
import { getControlDb } from '@amisimedos/db/client';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'AmisiMedOS | System Admin',
  description: 'Global SaaS Control Plane',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
  },
};

export const dynamic = 'force-dynamic';

export default async function SystemAdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';
  const userRole = cookieStore.get('amisi-user-role')?.value;
  const userName = cookieStore.get('amisi-user-name')?.value || 'System Admin';

  // Check if user is authenticated as system admin
  // The cookie is set with httpOnly: true, so we need to verify differently
  // For now, check if the cookie exists (it will be present if set)
  if (!isSystemAdmin) {
    // Try to verify from the request headers as fallback
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie') || '';
    const hasSystemAdmin = cookieHeader.includes('amisi-is-system-admin=true');
    
    if (!hasSystemAdmin) {
      redirect('/system/login');
    }
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans bg-gray-950 text-gray-100 h-screen overflow-hidden" suppressHydrationWarning>
        <TrpcProvider>
          <RealtimeProvider tenantId="system" userId={userName} roles={[userRole || 'SUPER_ADMIN']} department="" enabled={false}>
            <SystemAdminLayout userName={userName} userRole={userRole || 'SUPER_ADMIN'}>
              {children}
            </SystemAdminLayout>
          </RealtimeProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
