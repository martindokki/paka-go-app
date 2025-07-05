import { Platform } from 'react-native';

// Base64 encoding function for React Native
function base64Encode(str: string): string {
  // For React Native, we'll use a simple base64 implementation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
  }
  
  return result;
}

// M-Pesa API Configuration
const MPESA_CONFIG = {
  clientId: 'c0ShysKAT4YHFg63LCC1ihKZrAUg-fWYOp3v_BF3_xc',
  clientSecret: 'fgNXPNXzQwQuwQcjklj-1FwT8SCi8enuTxIGd6kO348',
  apiKey: '1f21d5f2c00510756b2bec75fac74aa7de379ad3',
  baseUrl: 'https://sandbox.safaricom.co.ke', // Use production URL for live
  businessShortCode: '174379', // Test shortcode
  passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919', // Test passkey
  callbackUrl: 'https://your-app.com/api/mpesa/callback', // Your callback URL
};

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
  description?: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  error?: string;
}

export interface MpesaCallbackData {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
}

class MpesaService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get OAuth access token from M-Pesa API
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const credentials = base64Encode(
        `${MPESA_CONFIG.clientId}:${MPESA_CONFIG.clientSecret}`
      );

      const response = await fetch(
        `${MPESA_CONFIG.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Token expires in 1 hour, we'll refresh 5 minutes early
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      if (!this.accessToken) {
        throw new Error('Failed to get access token from M-Pesa API');
      }

      return this.accessToken;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error);
      throw new Error('Failed to authenticate with M-Pesa API');
    }
  }

  /**
   * Generate timestamp for M-Pesa API
   */
  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Generate password for STK push
   */
  private generatePassword(timestamp: string): string {
    const data = `${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`;
    return base64Encode(data);
  }

  /**
   * Format phone number to M-Pesa format (254XXXXXXXXX)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
      // Convert 0712345678 to 254712345678
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      // Convert 712345678 to 254712345678
      cleaned = '254' + cleaned;
    } else if (!cleaned.startsWith('254')) {
      // Add 254 if not present
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Initiate STK Push payment
   */
  async initiateSTKPush(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    try {
      // For web platform, return mock response
      if (Platform.OS === 'web') {
        return this.mockSTKPush(request);
      }

      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);
      const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

      const stkPushData = {
        BusinessShortCode: MPESA_CONFIG.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(request.amount), // M-Pesa requires integer amounts
        PartyA: phoneNumber,
        PartyB: MPESA_CONFIG.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: MPESA_CONFIG.callbackUrl,
        AccountReference: request.orderId,
        TransactionDesc: request.description || `Payment for order ${request.orderId}`,
      };

      const response = await fetch(
        `${MPESA_CONFIG.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stkPushData),
        }
      );

      if (!response.ok) {
        throw new Error(`STK Push failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.ResponseCode === '0') {
        return {
          success: true,
          checkoutRequestId: data.CheckoutRequestID,
          responseCode: data.ResponseCode,
          responseDescription: data.ResponseDescription,
          customerMessage: data.CustomerMessage,
        };
      } else {
        return {
          success: false,
          responseCode: data.ResponseCode,
          responseDescription: data.ResponseDescription,
          error: data.errorMessage || 'STK Push failed',
        };
      }
    } catch (error) {
      console.error('Error initiating STK Push:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Mock STK Push for testing/web platform
   */
  private async mockSTKPush(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success response
    return {
      success: true,
      checkoutRequestId: `ws_CO_${Date.now()}`,
      responseCode: '0',
      responseDescription: 'Success. Request accepted for processing',
      customerMessage: `A payment request has been sent to ${request.phoneNumber}. Please enter your M-Pesa PIN to complete the transaction.`,
    };
  }

  /**
   * Query STK Push transaction status
   */
  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      if (Platform.OS === 'web') {
        // Mock successful payment for web
        return {
          success: true,
          resultCode: 0,
          resultDesc: 'The service request is processed successfully.',
        };
      }

      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const queryData = {
        BusinessShortCode: MPESA_CONFIG.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await fetch(
        `${MPESA_CONFIG.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(queryData),
        }
      );

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: data.ResultCode === '0',
        resultCode: data.ResultCode,
        resultDesc: data.ResultDesc,
        ...data,
      };
    } catch (error) {
      console.error('Error querying STK Push status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed',
      };
    }
  }

  /**
   * Process M-Pesa callback data
   */
  processCallback(callbackData: any): MpesaCallbackData {
    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    const result: MpesaCallbackData = {
      merchantRequestId: stkCallback.MerchantRequestID,
      checkoutRequestId: stkCallback.CheckoutRequestID,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc,
    };

    // If payment was successful, extract additional data
    if (stkCallback.ResultCode === 0 && stkCallback.CallbackMetadata) {
      const metadata = stkCallback.CallbackMetadata.Item;
      
      metadata.forEach((item: any) => {
        switch (item.Name) {
          case 'Amount':
            result.amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            result.mpesaReceiptNumber = item.Value;
            break;
          case 'TransactionDate':
            result.transactionDate = item.Value;
            break;
          case 'PhoneNumber':
            result.phoneNumber = item.Value;
            break;
        }
      });
    }

    return result;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): { valid: boolean; message?: string } {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length < 9) {
      return { valid: false, message: 'Phone number is too short' };
    }
    
    if (cleaned.length > 12) {
      return { valid: false, message: 'Phone number is too long' };
    }
    
    // Check if it's a valid Kenyan number
    const formatted = this.formatPhoneNumber(phoneNumber);
    if (!formatted.startsWith('254')) {
      return { valid: false, message: 'Please enter a valid Kenyan phone number' };
    }
    
    // Check if it's a valid mobile number (starts with 254 followed by 7 or 1)
    if (!formatted.match(/^254[71]\d{8}$/)) {
      return { valid: false, message: 'Please enter a valid mobile number' };
    }
    
    return { valid: true };
  }
}

// Export singleton instance
export const mpesaService = new MpesaService();
export default mpesaService;