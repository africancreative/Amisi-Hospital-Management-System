import type { Metadata } from 'next';

import './globals.css';
import Sidebar from '@/components/Sidebar';
import { cookies, headers } from 'next/headers';
import { getTenantModules } from '@/lib/modules';
import RoleSwitcher from '@/components/RoleSwitcher';
import { TrpcProvider } from '@/trpc/Provider';
import InternalChatSidebar from '@/components/InternalChatSidebar';
import PWARegistration from '@/components/PWARegistration';
import { getTenantLicense } from './actions/core-actions';
import { TenantLockout } from '@/components/TenantLockout';
import Navbar from '@/components/Navbar';
import ConnectionStatus from '@/components/ConnectionStatus';
import { EventSystemInitializer } from '@/components/events/EventSystemInitializer';
import { RealtimeProvider } from '@/lib/realtime-provider';




export const metadata: Metadata = {
  title: 'AmisiMedOS | Enterprise Hospital Management for Africa',
  description: 'AmisiMedOS is a hybrid-cloud hospital operating system built for African healthcare providers. Cloud-first, offline-resilient, SOP-compliant.',
  keywords: ['Hospital Management System', 'EMR Africa', 'Healthcare OS', 'Offline-first Clinic', 'AmisiMedOS', 'Pharmacy Management', 'Lab Management'],
  openGraph: {
    title: 'AmisiMedOS | Enterprise Hospital Management for Africa',
    description: 'A cloud-first platform with optional on-premise local nodes — ensuring clinical continuity even when the internet goes down.',
    url: 'https://amisigenuine.com',
    siteName: 'AmisiMedOS',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AmisiMedOS | Enterprise Hospital Management for Africa',
    description: 'Hybrid-cloud hospital operating system built for African healthcare providers.',
    images: ['/logo.png'],
  },
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    shortcut: [{ url: '/logo.png', type: 'image/png' }],
    apple: [{ url: '/logo.png', type: 'image/png' }],
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let enabledModules: string[] = [];
  let userRole = 'ADMIN';
  let isLoggedIn = false;
  let userName = 'User';
  let isSystemAdmin = false;

  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    
    // 1. Resolve Identity and Context
    const tenantId = headersList.get('x-tenant-id') || cookieStore.get('amisi-tenant-id')?.value;
    const userRoleObj = cookieStore.get('amisi-user-role');
    
    userName = cookieStore.get('amisi-user-name')?.value || 'User';
    userRole = userRoleObj?.value || 'ADMIN';
    isLoggedIn = !!userRoleObj;
    isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    // 2. Resolve Module Entitlements (only if tenant is known)
    if (tenantId) {
      try {
        const license = await getTenantLicense(tenantId);
        
        // 3. License Check (Skip for System Admins)
        if (!isSystemAdmin && license && license.isBlocked) {
          return (
            <html lang="en" className="dark">
              <body>
                <TenantLockout reason={license.isSuspended ? 'SUSPENDED' : 'DEMO_EXPIRED'} />
              </body>
            </html>
          );
        }

        const moduleSet = await getTenantModules(tenantId);
        enabledModules = Array.from(moduleSet);
      } catch (modErr) {
        console.warn(`[RootLayout] Module resolution failed for ${tenantId}:`, modErr);
      }
    }

    return (
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex min-h-screen" suppressHydrationWarning>
          <TrpcProvider>
            <PWARegistration />
            {isLoggedIn ? (
              <RealtimeProvider tenantId={tenantId ?? 'default'} userId={userName} roles={[userRole]} department="">
                <>
                  <Sidebar
                    enabledModules={enabledModules}
                    userRole={userRole}
                    userName={userName}
                    isSystemAdmin={isSystemAdmin}
                  />
                  <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    {children}
                  </main>
                </>
              </RealtimeProvider>
            ) : (
              <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
                <Navbar />
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#07070a]">
                  {children}
                </main>
              </div>
            )}
            {isLoggedIn && process.env.NODE_ENV === 'development' && <RoleSwitcher />}
            {isLoggedIn && <InternalChatSidebar />}
            {tenantId && isLoggedIn && <EventSystemInitializer tenantId={tenantId} />}
            <ConnectionStatus />
          </TrpcProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error('[RootLayout Critical Failure]:', error);
    // Ultimate Fallback - High Reliability Shell
    return (
      <html lang="en" className="dark">
        <body className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex min-h-screen">
          <TrpcProvider>
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
              {children}
            </main>
          </TrpcProvider>
        </body>
      </html>
    );
  }
}
