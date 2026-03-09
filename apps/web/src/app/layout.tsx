'use dynamic' = 'force-dynamic';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { cookies, headers } from 'next/headers';
import { getTenantModules } from '@/lib/modules';
import RoleSwitcher from '@/components/RoleSwitcher';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Amisi Hospital SaaS | Enterprise HMS',
  description: 'Enterprise-grade Hospital Management System',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let enabledModules: string[] = [];
  let userRole = 'ADMIN';
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id') || cookieStore.get('amisi-tenant-id')?.value;
    const userRoleObj = cookieStore.get('amisi-user-role');
    const userName = cookieStore.get('amisi-user-name')?.value || 'User';
    userRole = userRoleObj?.value || 'ADMIN';
    const isLoggedIn = !!userRoleObj;
    const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    if (tenantId) {
      const moduleSet = await getTenantModules(tenantId);
      enabledModules = Array.from(moduleSet);
    }

    return (
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex min-h-screen`}
          suppressHydrationWarning
        >
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
        </body>
      </html>
    );
  } catch (error: any) {
    console.error('[RootLayout] Error Caught:', error);
    return (
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex min-h-screen`}>
          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            {children}
          </main>
        </body>
      </html>
    );
  }
}
