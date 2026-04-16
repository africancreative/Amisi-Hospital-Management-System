import crypto from 'crypto';

export interface MpesaConfig {
    consumerKey: string;
    consumerSecret: string;
    shortCode: string;
    passkey: string;
    callbackUrl: string;
    environment: 'sandbox' | 'production';
}

export interface MpesaPayment {
    phone: string;
    amount: number;
    reference: string;
    description: string;
}

export interface MpesaResponse {
    success: boolean;
    transactionId?: string;
    responseCode?: string;
    responseDescription?: string;
    checkoutRequestId?: string;
    error?: string;
}

export class MpesaService {
    private config: MpesaConfig;
    private token: string | null = null;
    private tokenExpiry: Date | null = null;

    constructor(config: MpesaConfig) {
        this.config = config;
    }

    private async getAccessToken(): Promise<string> {
        if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.token;
        }

        const baseUrl = this.config.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';

        const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');

        const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        const data = await response.json();
        
        if (data.access_token) {
            this.token = data.access_token;
            this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);
            return this.token!;
        }

        throw new Error('Failed to get M-Pesa access token');
    }

    async stkPush(payment: MpesaPayment): Promise<MpesaResponse> {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.config.environment === 'production'
                ? 'https://api.safaricom.co.ke'
                : 'https://sandbox.safaricom.co.ke';

            const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
            const password = Buffer.from(`${this.config.shortCode}${this.config.passkey}${timestamp}`).toString('base64');

            const payload = {
                BusinessShortCode: this.config.shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.round(payment.amount),
                PartyA: payment.phone,
                PartyB: this.config.shortCode,
                PhoneNumber: payment.phone,
                CallBackURL: this.config.callbackUrl,
                AccountReference: payment.reference,
                TransactionDesc: payment.description
            };

            const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.ResponseCode === '0') {
                return {
                    success: true,
                    checkoutRequestId: data.CheckoutRequestID,
                    responseCode: data.ResponseCode,
                    responseDescription: data.ResponseDescription
                };
            }

            return {
                success: false,
                responseCode: data.ResponseCode,
                responseDescription: data.ResponseDescription
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async checkTransactionStatus(checkoutRequestId: string): Promise<MpesaResponse> {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.config.environment === 'production'
                ? 'https://api.safaricom.co.ke'
                : 'https://sandbox.safaricom.co.ke';

            const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
            const password = Buffer.from(`${this.config.shortCode}${this.config.passkey}${timestamp}`).toString('base64');

            const payload = {
                BusinessShortCode: this.config.shortCode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId
            };

            const response = await fetch(`${baseUrl}/mpesa/stkquery/v1/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            return {
                success: data.ResponseCode === '0',
                transactionId: data.MpesaReceiptNumber,
                responseCode: data.ResponseCode,
                responseDescription: data.ResponseDescription
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', this.config.passkey)
            .update(payload)
            .digest('base64');
        
        return signature === expectedSignature;
    }
}

export const createMpesaService = (config: MpesaConfig) => new MpesaService(config);