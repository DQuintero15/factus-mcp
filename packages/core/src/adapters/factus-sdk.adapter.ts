import type {
  CreateBillRequest,
  FactusClient,
  FactusCredentials,
  FactusDownloadResponse,
  ListBillsFilters,
  ListNumberingRangesFilters,
} from '@factus-mcp/factus-sdk';

import type { FactusPort } from '../ports/factus.port.js';

export class FactusSdkAdapter implements FactusPort {
  constructor(private readonly client: FactusClient) {}

  createInvoice(creds: FactusCredentials, payload: CreateBillRequest): Promise<unknown> {
    return this.client.bills.validate(creds, payload);
  }

  getInvoice(creds: FactusCredentials, number: string): Promise<unknown> {
    return this.client.bills.get(creds, number);
  }

  listInvoices(creds: FactusCredentials, filters: ListBillsFilters): Promise<unknown> {
    return this.client.bills.list(creds, filters);
  }

  sendInvoiceEmail(creds: FactusCredentials, number: string, email: string): Promise<unknown> {
    return this.client.bills.sendEmail(creds, number, email);
  }

  downloadInvoicePdf(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse> {
    return this.client.bills.downloadPdf(creds, number);
  }

  downloadInvoiceXml(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse> {
    return this.client.bills.downloadXml(creds, number);
  }

  listNumberingRanges(
    creds: FactusCredentials,
    filters: ListNumberingRangesFilters,
  ): Promise<unknown> {
    return this.client.numberingRanges.list(creds, filters);
  }

  getCompanyInfo(creds: FactusCredentials): Promise<unknown> {
    return this.client.companies.get(creds);
  }
}
