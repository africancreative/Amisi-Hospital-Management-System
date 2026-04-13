import { TRPCLink, httpBatchLink } from '@trpc/client';
import { sentinel } from '@amisimedos/sync/connectivity/status';

/**
 * Hybrid tRPC Link
 * 
 * An intelligent proxy link that routes requests between the Edge and Cloud
 * based on real-time connectivity state and procedure metadata.
 */
export const hybridLink: TRPCLink<any> = (opts) => {
  return (props) => {
    return (next) => {
      const { op } = props;
      
      // 1. Identify if this procedure is Cloud-Only
      // We check the 'meta' property which we will define in the routers
      const isCloudOnly = (op.meta as any)?.cloudOnly === true;

      // 2. Resolve the current target URL from the Sentinel
      const baseUrl = sentinel.getResolvedUrl(isCloudOnly);
      const url = baseUrl.endsWith('/api/trpc') ? baseUrl : `${baseUrl}/api/trpc`;

      // 3. Delegate to the standard httpBatchLink logic with the resolved URL
      // Since we want batching, we re-use the httpBatchLink logic but with dynamic URL resolution
      return httpBatchLink({
        url,
        headers() {
           const slug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
           return {
              'x-tenant-slug': slug,
           };
        },
      })(opts)(props)(next);
    };
  };
};
