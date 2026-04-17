import type { Metadata } from 'next';

import './globals.css';
import Sidebar from '@/components/Sidebar';
import { cookies, headers } from 'next/headers';
import { getTenantModules } from '@/lib/modules';
import RoleSwitcher from '@/components/RoleSwitcher';
import { TrpcProvider } from '@/trpc/Provider';
import InternalChatSidebar from '@/components/InternalChatSidebar';
import PWARegistration from '@/components/PWARegistration';




export const metadata: Metadata = {
  title: 'AmisiMedOS | Hospital Management System',
  description: 'Enterprise Hybrid-Cloud Hospital Management System',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
            {isLoggedIn && (
              <Sidebar

                enabledModules={enabledModules}
                userRole={userRole}
                userName={userName}
                isSystemAdmin={isSystemAdmin}
              />
            )}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
              {children}
            </main>
            {isLoggedIn && <RoleSwitcher />}
            {isLoggedIn && <InternalChatSidebar />}
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
