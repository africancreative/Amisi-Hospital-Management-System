import { TRPCLink, httpBatchLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import { sentinel } from '@amisimedos/sync/connectivity/status';

/**
 * Hybrid tRPC Link with Automatic Failover Retry
 * 
 * Routes requests based on real-time connectivity. If a request fails due to 
 * a network transition, it forces a heartbeat check and retries on the new endpoint.
 */
export const hybridLink: TRPCLink<any> = (opts) => {
  return ({ op, next }) => {
    return observable((observer) => {
      const isCloudOnly = (op.context as any)?.cloudOnly === true;
      
      const execute = (targetUrl: string) => {
        const url = targetUrl.endsWith('/api/trpc') ? targetUrl : `${targetUrl}/api/trpc`;
        
        return httpBatchLink({
          url,
          fetch(url, options) {
            return fetch(url, { ...options, credentials: 'include' });
          },
          headers() {
             const slug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
             return {
                'x-tenant-slug': slug,
             };
          },
        })(opts)({ op, next });
      };

      const initialUrl = sentinel.getResolvedUrl(isCloudOnly);
      
      const subscription = execute(initialUrl).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err) {
          // If it's a network error and we aren't already locked to cloud
          const isNetworkError = err.name === 'TypeError' || err.message?.includes('fetch');
          
          if (isNetworkError && !isCloudOnly) {
            console.warn('[HybridLink] Network error detected. Forcing failover probe...');
            
            sentinel.forceCheck().then(() => {
                const nextUrl = sentinel.getResolvedUrl(isCloudOnly);
                if (nextUrl !== initialUrl) {
                    console.info(`[HybridLink] Failing over to ${nextUrl}. Retrying operation...`);
                    execute(nextUrl).subscribe(observer);
                } else {
                    observer.error(err);
                }
            });
          } else {
            observer.error(err);
          }
        },
        complete() {
          observer.complete();
        },
      });

      return () => subscription.unsubscribe();
    });
  };
};
