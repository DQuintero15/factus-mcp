import type {
  CreateAdjustmentNoteRequest,
  CreateBillRequest,
  CreateCreditNoteRequest,
  CreateSupportDocumentRequest,
  FactusClient,
  FactusCredentials,
  FactusDownloadResponse,
  ListBillsFilters,
  ListDocumentFilters,
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

  downloadInvoiceAttachedDocumentXml(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse> {
    return this.client.bills.downloadAttachedDocumentXml(creds, number);
  }

  createCreditNote(creds: FactusCredentials, payload: CreateCreditNoteRequest): Promise<unknown> {
    return this.client.creditNotes.validate(creds, payload);
  }

  getCreditNote(creds: FactusCredentials, number: string): Promise<unknown> {
    return this.client.creditNotes.get(creds, number);
  }

  listCreditNotes(creds: FactusCredentials, filters: ListDocumentFilters): Promise<unknown> {
    return this.client.creditNotes.list(creds, filters);
  }

  deleteUnvalidatedCreditNote(creds: FactusCredentials, referenceCode: string): Promise<unknown> {
    return this.client.creditNotes.deleteUnvalidated(creds, referenceCode);
  }

  downloadCreditNotePdf(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse> {
    return this.client.creditNotes.downloadPdf(creds, number);
  }

  downloadCreditNoteXml(creds: FactusCredentials, number: string): Promise<FactusDownloadResponse> {
    return this.client.creditNotes.downloadXml(creds, number);
  }

  downloadCreditNoteAttachedDocumentXml(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse> {
    return this.client.creditNotes.downloadAttachedDocumentXml(creds, number);
  }

  createSupportDocument(
    creds: FactusCredentials,
    payload: CreateSupportDocumentRequest,
  ): Promise<unknown> {
    return this.client.supportDocuments.validate(creds, payload);
  }

  getSupportDocument(creds: FactusCredentials, number: string): Promise<unknown> {
    return this.client.supportDocuments.get(creds, number);
  }

  listSupportDocuments(creds: FactusCredentials, filters: ListDocumentFilters): Promise<unknown> {
    return this.client.supportDocuments.list(creds, filters);
  }

  deleteUnvalidatedSupportDocument(
    creds: FactusCredentials,
    referenceCode: string,
  ): Promise<unknown> {
    return this.client.supportDocuments.deleteUnvalidated(creds, referenceCode);
  }

  downloadSupportDocumentPdf(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse> {
    return this.client.supportDocuments.downloadPdf(creds, number);
  }

  downloadSupportDocumentXml(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse> {
    return this.client.supportDocuments.downloadXml(creds, number);
  }

  createAdjustmentNote(
    creds: FactusCredentials,
    payload: CreateAdjustmentNoteRequest,
  ): Promise<unknown> {
    return this.client.adjustmentNotes.validate(creds, payload);
  }

  getAdjustmentNote(creds: FactusCredentials, number: string): Promise<unknown> {
    return this.client.adjustmentNotes.get(creds, number);
  }

  listAdjustmentNotes(creds: FactusCredentials, filters: ListDocumentFilters): Promise<unknown> {
    return this.client.adjustmentNotes.list(creds, filters);
  }

  deleteUnvalidatedAdjustmentNote(
    creds: FactusCredentials,
    referenceCode: string,
  ): Promise<unknown> {
    return this.client.adjustmentNotes.deleteUnvalidated(creds, referenceCode);
  }

  downloadAdjustmentNotePdf(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse> {
    return this.client.adjustmentNotes.downloadPdf(creds, number);
  }

  downloadAdjustmentNoteXml(
    creds: FactusCredentials,
    number: string,
  ): Promise<FactusDownloadResponse> {
    return this.client.adjustmentNotes.downloadXml(creds, number);
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
