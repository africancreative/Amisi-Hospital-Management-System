import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // IP Whitelisting Logic for LAN security
  // In Next.js App Router, the client IP can be retrieved from headers
  
  // Note: For local Next.js servers, X-Forwarded-For might be empty if directly accessed
  let ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
           request.headers.get('x-real-ip') || 
           '127.0.0.1';
  
  // Handle ipv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  // Strip port if present
  if (ip.includes(':')) {
    ip = ip.split(':')[0];
  }

  const isLocalhost = ip === '127.0.0.1';
  
  // Allow common private IP ranges (LAN)
  // 10.0.0.0 - 10.255.255.255
  // 172.16.0.0 - 172.31.255.255
  // 192.168.0.0 - 192.168.255.255
  const isPrivateLAN = 
    ip.startsWith('192.168.') || 
    ip.startsWith('10.') || 
    (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31);

  if (!isLocalhost && !isPrivateLAN) {
    console.warn(`[Security] Blocked unauthorized access attempt from IP: ${ip}`);
    return new NextResponse('Unauthorized: Access denied outside of Hospital LAN', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all API routes and internal pages
    '/api/:path*',
    '/dashboard/:path*',
  ],
};
