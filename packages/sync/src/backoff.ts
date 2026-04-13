/**
 * Improved Backoff Strategy for Sync Engine
 * Implements Exponential Backoff with Jitter
 */
export class SyncBackoff {
    private retryCount = 0;
    private maxDelay = 5 * 60 * 1000; // 5 minutes max
    private baseDelay = 1000; // 1 second base

    constructor(initialRetryCount = 0) {
        this.retryCount = initialRetryCount;
    }

    /**
     * Get the next delay in milliseconds
     */
    getNextDelay(): number {
        const delay = Math.min(
            Math.pow(2, this.retryCount) * this.baseDelay,
            this.maxDelay
        );
        
        // Add jitter (up to 20% randomization)
        const jitter = delay * 0.2 * Math.random();
        this.retryCount++;
        
        return delay + jitter;
    }

    reset() {
        this.retryCount = 0;
    }

    get count() {
        return this.retryCount;
    }
}
