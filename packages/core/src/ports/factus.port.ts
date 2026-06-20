import type {
  CreateAdjustmentNoteRequest,
  CreateBillRequest,
  CreateCreditNoteRequest,
  CreateSupportDocumentRequest,
  FactusCredentials,
  FactusDownloadResponse,
  ListBillsFilters,
  ListDocumentFilters,
  ListNumberingRangesFilters,
} from '@factus-mcp/factus-sdk';

export interface FactusPort {
  createInvoice(creds: FactusCredentials, payload: CreateBillRequest): Promise<unknown>;
  getInvoice(creds: FactusCredentials, number: string): Promise<unknown>;
  listInvoices(creds: FactusCredentials, filters: ListBillsFilters): Promise<unknown>;
  sendInvoiceEmail(creds: FactusCredentials, number: string, email: string): Promise<unknown>;
  downloadInvoicePdf(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse>;
  downloadInvoiceXml(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse>;
  downloadInvoiceAttachedDocumentXml(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse>;
  createCreditNote(creds: FactusCredentials, payload: CreateCreditNoteRequest): Promise<unknown>;
  getCreditNote(creds: FactusCredentials, number: string): Promise<unknown>;
  listCreditNotes(creds: FactusCredentials, filters: ListDocumentFilters): Promise<unknown>;
  deleteUnvalidatedCreditNote(creds: FactusCredentials, referenceCode: string): Promise<unknown>;
  downloadCreditNotePdf(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse>;
  downloadCreditNoteXml(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse>;
  downloadCreditNoteAttachedDocumentXml(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse>;
  createSupportDocument(
    creds: FactusCredentials,
    payload: CreateSupportDocumentRequest,
  ): Promise<unknown>;
  getSupportDocument(creds: FactusCredentials, number: string): Promise<unknown>;
  listSupportDocuments(creds: FactusCredentials, filters: ListDocumentFilters): Promise<unknown>;
  deleteUnvalidatedSupportDocument(
    creds: FactusCredentials,
    referenceCode: string,
  ): Promise<unknown>;
  downloadSupportDocumentPdf(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse>;
  downloadSupportDocumentXml(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse>;
  createAdjustmentNote(
    creds: FactusCredentials,
    payload: CreateAdjustmentNoteRequest,
  ): Promise<unknown>;
  getAdjustmentNote(creds: FactusCredentials, number: string): Promise<unknown>;
  listAdjustmentNotes(creds: FactusCredentials, filters: ListDocumentFilters): Promise<unknown>;
  deleteUnvalidatedAdjustmentNote(
    creds: FactusCredentials,
    referenceCode: string,
  ): Promise<unknown>;
  downloadAdjustmentNotePdf(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse>;
  downloadAdjustmentNoteXml(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse>;
  listNumberingRanges(
    creds: FactusCredentials,
    filters: ListNumberingRangesFilters,
  ): Promise<unknown>;
  getCompanyInfo(creds: FactusCredentials): Promise<unknown>;
}
