import axios from 'axios';

/**
 * PayPal Checkout — Subscription & Order Implementation
 * 
 * Provides global payment bridging for AmisiMedOS SaaS tenants.
 */

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  env: 'sandbox' | 'live';
}

export class PayPalGateway {
  private config: PayPalConfig;
  private baseUrl: string;

  constructor(config: PayPalConfig) {
    this.config = config;
    this.baseUrl = config.env === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';
  }

  /**
   * Generates OAuth2 Access Token for PayPal API
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
    const response = await axios.post(
      `${this.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
  }

  /**
   * Creates a PayPal checkout order for a subscription plan.
   */
  public async createOrder(amount: number, currency: string = 'USD', referenceId: string) {
    const token = await this.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: referenceId,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: 'AmisiMedOS SaaS Subscription'
      }],
      application_context: {
        brand_name: 'AmisiMedOS',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      }
    };

    const response = await axios.post(
      `${this.baseUrl}/v2/checkout/orders`,
      payload,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    return response.data;
  }
}
