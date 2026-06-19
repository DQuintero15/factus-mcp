import type {
  CreateBillRequest,
  FactusCredentials,
  FactusDownloadResponse,
  ListBillsFilters,
  ListNumberingRangesFilters,
} from '@factus-mcp/factus-sdk';

export interface FactusPort {
  createInvoice(creds: FactusCredentials, payload: CreateBillRequest): Promise<unknown>;
  getInvoice(creds: FactusCredentials, number: string): Promise<unknown>;
  listInvoices(creds: FactusCredentials, filters: ListBillsFilters): Promise<unknown>;
  sendInvoiceEmail(creds: FactusCredentials, number: string, email: string): Promise<unknown>;
  downloadInvoicePdf(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse>;
  downloadInvoiceXml(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse>;
  listNumberingRanges(
    creds: FactusCredentials,
    filters: ListNumberingRangesFilters,
  ): Promise<unknown>;
  getCompanyInfo(creds: FactusCredentials): Promise<unknown>;
}
