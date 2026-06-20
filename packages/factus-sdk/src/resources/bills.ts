import type { FactusClient } from '../client.js';
import type {
  CreateBillRequest,
  FactusBill,
  FactusCredentials,
  FactusDownloadResponse,
  FactusEnvelope,
  ListBillsFilters,
} from '../types.js';

export class BillsResource {
  constructor(private readonly client: FactusClient) {}

  async validate(
    creds: FactusCredentials,
    payload: CreateBillRequest,
  ): Promise<FactusEnvelope<unknown>> {
    return this.client.authedRequest(creds, {
      method: 'POST',
      path: '/v2/bills/validate',
      body: payload,
    });
  }

  async get(creds: FactusCredentials, number: string): Promise<FactusEnvelope<FactusBill>> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: `/v2/bills/${encodeURIComponent(number)}`,
    });
  }

  async list(creds: FactusCredentials, filters: ListBillsFilters = {}): Promise<unknown> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: '/v2/bills',
      query: {
        'filter[identification]': filters.identification,
        'filter[names]': filters.names,
        'filter[number]': filters.number,
        'filter[prefix]': filters.prefix,
        'filter[reference_code]': filters.reference_code,
        'filter[status]': filters.status,
        'filter[per_page]': filters.per_page,
        'filter[created_at][start_date]': filters.start_date,
        'filter[created_at][end_date]': filters.end_date,
        page: filters.page,
      },
    });
  }

  async sendEmail(
    creds: FactusCredentials,
    number: string,
    email: string,
  ): Promise<FactusEnvelope<unknown>> {
    return this.client.authedRequest(creds, {
      method: 'POST',
      path: `/v2/bills/${encodeURIComponent(number)}/send-email`,
      body: { email },
    });
  }

  async downloadPdf(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: `/v2/bills/${encodeURIComponent(number)}/download-pdf`,
    });
  }

  async downloadXml(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: `/v2/bills/${encodeURIComponent(number)}/download-xml`,
    });
  }

  async downloadAttachedDocumentXml(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: `/v2/bills/${encodeURIComponent(number)}/download-attached-document-xml`,
    });
  }
}
