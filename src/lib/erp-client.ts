import axios, { AxiosInstance } from "axios";

export interface ErpOrderPayload {
  orderNumber: string;
  supplierName: string;
  supplierEmail: string;
  amount: number;
  currency: string;
  orderDate: string;
  reference: string;
  customFields?: Record<string, unknown>;
}

export interface ErpSyncResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export class ErpClient {
  private client: AxiosInstance;
  private type: string;

  constructor(config: {
    type: string;
    baseUrl: string;
    apiKey?: string;
    username?: string;
    password?: string;
    customHeaders?: Record<string, string>;
  }) {
    this.type = config.type;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.customHeaders,
    };

    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
      headers["X-API-Key"] = config.apiKey;
    }

    this.client = axios.create({
      baseURL: config.baseUrl,
      headers,
      timeout: 30000,
      auth:
        config.username && config.password
          ? { username: config.username, password: config.password }
          : undefined,
    });
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = this.getHealthEndpoint();
      await this.client.get(endpoint);
      return { success: true, message: "Verbindung erfolgreich" };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Verbindungsfehler",
      };
    }
  }

  async syncOrderConfirmation(payload: ErpOrderPayload): Promise<ErpSyncResult> {
    try {
      const endpoint = this.getSyncEndpoint();
      const body = this.transformPayload(payload);
      const response = await this.client.post(endpoint, body);

      return {
        success: true,
        reference: response.data?.id || response.data?.reference || response.data?.orderId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Synchronisation fehlgeschlagen",
      };
    }
  }

  private getHealthEndpoint(): string {
    const endpoints: Record<string, string> = {
      LEXOFFICE: "/v1/profile",
      SEVDESK: "/v2/Contact?limit=1",
      CUSTOM_REST: "/health",
      DEFAULT: "/",
    };
    return endpoints[this.type] || endpoints.DEFAULT;
  }

  private getSyncEndpoint(): string {
    const endpoints: Record<string, string> = {
      LEXOFFICE: "/v1/vouchers",
      SEVDESK: "/v2/Voucher",
      CUSTOM_REST: "/api/order-confirmations",
      DEFAULT: "/orders",
    };
    return endpoints[this.type] || endpoints.DEFAULT;
  }

  private transformPayload(payload: ErpOrderPayload): Record<string, unknown> {
    switch (this.type) {
      case "LEXOFFICE":
        return {
          type: "purchaseInvoice",
          voucherDate: payload.orderDate,
          totalGrossAmount: payload.amount,
          currency: payload.currency,
          remark: `AB ${payload.orderNumber} - ${payload.supplierName}`,
          voucherNumber: payload.orderNumber,
        };
      case "SEVDESK":
        return {
          objectName: "Voucher",
          voucherDate: payload.orderDate,
          sum: payload.amount,
          currency: payload.currency,
          description: payload.orderNumber,
          status: 50,
          voucherType: "VOU",
        };
      default:
        return {
          orderNumber: payload.orderNumber,
          supplierName: payload.supplierName,
          supplierEmail: payload.supplierEmail,
          amount: payload.amount,
          currency: payload.currency,
          orderDate: payload.orderDate,
          externalReference: payload.reference,
          ...payload.customFields,
        };
    }
  }
}
