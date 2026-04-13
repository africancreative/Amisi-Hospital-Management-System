import axios from 'axios';

/**
 * Safaricom Daraja API — M-Pesa STK Push Implementation
 * 
 * Allows direct mobile billing for AmisiMedOS SaaS subscriptions.
 */

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passKey: string;
  callbackUrl: string;
}

export class MpesaGateway {
  private config: MpesaConfig;

  constructor(config: MpesaConfig) {
    this.config = config;
  }

  /**
   * Generates OAuth2 Access Token for Daraja API
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    return response.data.access_token;
  }

  /**
   * Triggers an STK Push (LNM Online) to the user's phone.
   */
  public async initiateStkPush(phoneNumber: string, amount: number, accountReference: string) {
    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${this.config.shortCode}${this.config.passKey}${timestamp}`
    ).toString('base64');

    const payload = {
      BusinessShortCode: this.config.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phoneNumber, // Format: 2547XXXXXXXX
      PartyB: this.config.shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.config.callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: 'AmisiMedOS Subscription'
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  }
}
