import type { FactusClient } from '../client.js';
import type {
  CreateSupportDocumentRequest,
  FactusCredentials,
  FactusDownloadResponse,
  FactusEnvelope,
  ListDocumentFilters,
} from '../types.js';

export class SupportDocumentsResource {
  constructor(private readonly client: FactusClient) {}

  async validate(
    creds: FactusCredentials,
    payload: CreateSupportDocumentRequest,
  ): Promise<FactusEnvelope<unknown>> {
    return this.client.authedRequest(creds, {
      method: 'POST',
      path: '/v2/support-documents/validate',
      body: payload,
    });
  }

  async get(creds: FactusCredentials, number: string): Promise<FactusEnvelope<unknown>> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: `/v2/support-documents/${encodeURIComponent(number)}`,
    });
  }

  async list(creds: FactusCredentials, filters: ListDocumentFilters = {}): Promise<unknown> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: '/v2/support-documents',
      query: toListQuery(filters),
    });
  }

  async deleteUnvalidated(
    creds: FactusCredentials,
    referenceCode: string,
  ): Promise<FactusEnvelope<unknown>> {
    return this.client.authedRequest(creds, {
      method: 'DELETE',
      path: `/v2/support-documents/reference/${encodeURIComponent(referenceCode)}`,
    });
  }

  async downloadPdf(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: `/v2/support-documents/${encodeURIComponent(number)}/download-pdf`,
    });
  }

  async downloadXml(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: `/v2/support-documents/${encodeURIComponent(number)}/download-xml`,
    });
  }
}

function toListQuery(filters: ListDocumentFilters): Record<string, string | number | undefined> {
  return {
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
  };
}
