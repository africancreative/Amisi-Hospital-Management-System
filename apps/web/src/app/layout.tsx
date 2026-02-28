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
    const headerList = await headers();
    const tenantId = headerList.get('x-tenant-id') || cookieStore.get('amisi-tenant-id')?.value;
    userRole = cookieStore.get('amisi-user-role')?.value || 'ADMIN';

    if (tenantId) {
      const moduleSet = await getTenantModules(tenantId);
      enabledModules = Array.from(moduleSet);
    }
  } catch (error: any) {
    console.error('[RootLayout] Error Caught:', error);
    // Fallback
  }

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex min-h-screen`}>
        <Sidebar enabledModules={enabledModules} userRole={userRole} />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {children}
        </main>
        <RoleSwitcher />
      </body>
    </html>
  );
}
