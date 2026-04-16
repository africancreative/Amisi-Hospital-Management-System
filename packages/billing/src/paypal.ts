import crypto from 'crypto';

export interface PayPalConfig {
    clientId: string;
    clientSecret: string;
    webhookId: string;
    environment: 'sandbox' | 'production';
}

export interface PayPalPayment {
    amount: number;
    currency: string;
    description: string;
    customId?: string;
}

export interface PayPalSubscription {
    planId: string;
    subscriber: {
        email_address: string;
        name?: { given_name?: string; surname?: string };
    };
    application_context?: {
        brand_name?: string;
        landing_page?: 'NO_PREFERENCE' | 'BILLING' | 'LOGIN';
        user_action?: 'SUBSCRIBE_NOW' | 'CONTINUE';
        return_url: string;
        cancel_url: string;
    };
}

export interface PayPalResponse {
    success: boolean;
    id?: string;
    status?: string;
    links?: Array<{ rel: string; href: string }>;
    error?: string;
}

export class PayPalService {
    private config: PayPalConfig;
    private accessToken: string | null = null;
    private tokenExpiry: Date | null = null;

    constructor(config: PayPalConfig) {
        this.config = config;
    }

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        const baseUrl = this.config.environment === 'production'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

        const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();

        if (data.access_token) {
            this.accessToken = data.access_token;
            this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);
            return this.accessToken!;
        }

        throw new Error('Failed to get PayPal access token');
    }

    async createOrder(payment: PayPalPayment): Promise<PayPalResponse> {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.config.environment === 'production'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

            const payload = {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: payment.currency || 'USD',
                        value: payment.amount.toFixed(2)
                    },
                    description: payment.description,
                    custom_id: payment.customId
                }]
            };

            const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.id) {
                return {
                    success: true,
                    id: data.id,
                    status: data.status,
                    links: data.links
                };
            }

            return { success: false, error: data.message };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async captureOrder(orderId: string): Promise<PayPalResponse> {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.config.environment === 'production'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

            const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.status === 'COMPLETED') {
                return {
                    success: true,
                    id: data.id,
                    status: data.status
                };
            }

            return { success: false, error: data.message };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async createSubscription(subscription: PayPalSubscription): Promise<PayPalResponse> {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.config.environment === 'production'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

            const payload = {
                plan_id: subscription.planId,
                subscriber: subscription.subscriber,
                application_context: subscription.application_context
            };

            const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.id) {
                return {
                    success: true,
                    id: data.id,
                    status: data.status,
                    links: data.links
                };
            }

            return { success: false, error: data.message };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async activateSubscription(subscriptionId: string): Promise<PayPalResponse> {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.config.environment === 'production'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

            const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/activate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: 'Customer activated subscription' })
            });

            const data = await response.json();

            return { success: response.ok, error: data.message };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async getSubscription(subscriptionId: string): Promise<PayPalResponse & { subscription?: any }> {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.config.environment === 'production'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

            const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.id) {
                return {
                    success: true,
                    id: data.id,
                    status: data.status,
                    subscription: data
                };
            }

            return { success: false, error: data.message };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    verifyWebhookSignature(payload: string, transmissionId: string, signature: string): boolean {
        const message = transmissionId + payload.length + payload;
        const expectedSignature = crypto
            .createHmac('sha256', this.config.clientSecret)
            .update(message)
            .digest('hex');

        return signature === expectedSignature;
    }
}

export const createPayPalService = (config: PayPalConfig) => new PayPalService(config);