import { NextRequest } from 'next/server';
import { realtimeHub, RealtimeEvent } from '@amisi/realtime';

export const runtime = 'nodejs'; // Required for long-running SSE connections

/**
 * HealthOS Real-Time Streaming Endpoint (SSE)
 * Provides a persistent connection for instant UI updates.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return new Response('Missing tenantId', { status: 400 });
  }

  const responseStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // 1. Initial Heartbeat
      controller.enqueue(encoder.encode('retry: 1000\n\n'));
      controller.enqueue(encoder.encode('data: {"event": "CONNECTED"}\n\n'));

      // 2. Subscribe to the Global Real-Time Hub
      const unsubscribe = realtimeHub.subscribe(tenantId, (event: RealtimeEvent) => {
        const payload = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      });

      // 3. Keep-alive heartbeat to prevent Vercel/Proxy timeouts (every 30s)
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // 4. Cleanup on connection close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
