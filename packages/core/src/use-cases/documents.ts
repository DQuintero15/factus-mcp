import type { FactusCredentials, FactusDownloadResponse } from '@factus-mcp/factus-sdk';
import {
  sanitizeDeep,
  type DownloadKind,
  type DownloadReference,
  type McpSafeResult,
} from '@factus-mcp/shared';

import type { FactusPort } from '../ports/factus.port.js';
import {
  createAdjustmentNoteSchema,
  createCreditNoteSchema,
  createSupportDocumentSchema,
  deleteUnvalidatedFiscalDocumentSchema,
  documentFileSchema,
  getFiscalDocumentSchema,
  listFiscalDocumentsSchema,
} from '../schemas/documents.js';

type DocumentType = 'bill' | 'credit_note' | 'support_document' | 'adjustment_note';

export async function createCreditNote(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const payload = createCreditNoteSchema.parse(input);
  const result = await port.createCreditNote(creds, payload);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function getCreditNote(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const { number } = getFiscalDocumentSchema.parse(input);
  const result = await port.getCreditNote(creds, number);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function listCreditNotes(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const filters = listFiscalDocumentsSchema.parse(input);
  const result = await port.listCreditNotes(creds, filters);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function deleteUnvalidatedCreditNote(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const { reference_code } = deleteUnvalidatedFiscalDocumentSchema.parse(input);
  const result = await port.deleteUnvalidatedCreditNote(creds, reference_code);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function createSupportDocument(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const payload = createSupportDocumentSchema.parse(input);
  const result = await port.createSupportDocument(creds, payload);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function getSupportDocument(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const { number } = getFiscalDocumentSchema.parse(input);
  const result = await port.getSupportDocument(creds, number);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function listSupportDocuments(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const filters = listFiscalDocumentsSchema.parse(input);
  const result = await port.listSupportDocuments(creds, filters);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function deleteUnvalidatedSupportDocument(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const { reference_code } = deleteUnvalidatedFiscalDocumentSchema.parse(input);
  const result = await port.deleteUnvalidatedSupportDocument(creds, reference_code);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function createAdjustmentNote(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const payload = createAdjustmentNoteSchema.parse(input);
  const result = await port.createAdjustmentNote(creds, payload);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function getAdjustmentNote(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const { number } = getFiscalDocumentSchema.parse(input);
  const result = await port.getAdjustmentNote(creds, number);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function listAdjustmentNotes(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const filters = listFiscalDocumentsSchema.parse(input);
  const result = await port.listAdjustmentNotes(creds, filters);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function deleteUnvalidatedAdjustmentNote(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const { reference_code } = deleteUnvalidatedFiscalDocumentSchema.parse(input);
  const result = await port.deleteUnvalidatedAdjustmentNote(creds, reference_code);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function getDocumentFile(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<DownloadReference>> {
  const { document_type, number, file_type } = documentFileSchema.parse(input);
  if (file_type === 'attached_document_xml' && !['bill', 'credit_note'].includes(document_type)) {
    throw new Error('attached_document_xml solo esta disponible para bill y credit_note');
  }

  const response = await downloadDocument(port, creds, document_type, number, file_type);
  return {
    source: 'factus',
    data: toDownloadReference(document_type, number, file_type, response),
  };
}

async function downloadDocument(
  port: FactusPort,
  creds: FactusCredentials,
  documentType: DocumentType,
  number: string,
  fileType: DownloadKind,
): Promise<FactusDownloadResponse> {
  if (documentType === 'bill') {
    if (fileType === 'pdf') return port.downloadInvoicePdf(creds, number);
    if (fileType === 'xml') return port.downloadInvoiceXml(creds, number);
    return port.downloadInvoiceAttachedDocumentXml(creds, number);
  }
  if (documentType === 'credit_note') {
    if (fileType === 'pdf') return port.downloadCreditNotePdf(creds, number);
    if (fileType === 'xml') return port.downloadCreditNoteXml(creds, number);
    return port.downloadCreditNoteAttachedDocumentXml(creds, number);
  }
  if (documentType === 'support_document') {
    if (fileType === 'pdf') return port.downloadSupportDocumentPdf(creds, number);
    return port.downloadSupportDocumentXml(creds, number);
  }
  if (fileType === 'pdf') return port.downloadAdjustmentNotePdf(creds, number);
  return port.downloadAdjustmentNoteXml(creds, number);
}

function toDownloadReference(
  documentType: DocumentType,
  number: string,
  type: DownloadKind,
  response: FactusDownloadResponse,
): DownloadReference {
  const data = response?.data ?? {};
  const base64 = getBase64(data, type);
  const available = typeof base64 === 'string' && base64.length > 0;
  const sizeBytes = available ? Math.floor(base64.length * 0.75) : undefined;
  const source = `${resourcePath(documentType)}/${number}/${downloadSegment(type)}`;

  return {
    number,
    documentType,
    type,
    available,
    fileName: typeof data.file_name === 'string' ? data.file_name : `${number}.${extension(type)}`,
    source,
    sizeBytes,
    hint: available
      ? `El archivo ${type} esta disponible en Factus. Descargalo con tus credenciales desde GET ${source}. El MCP no reenvia binarios.`
      : `Factus no reporto contenido ${type} descargable para ${documentType} ${number}.`,
  };
}

function getBase64(data: FactusDownloadResponse['data'], type: DownloadKind): string | undefined {
  if (!data) return undefined;
  if (type === 'pdf') return data.pdf_base_64_encoded;
  if (type === 'xml') return data.xml_base_64_encoded;
  return data.attached_document_base_64_encoded ?? data.xml_base_64_encoded;
}

function resourcePath(documentType: DocumentType): string {
  const paths: Record<DocumentType, string> = {
    bill: '/v2/bills',
    credit_note: '/v2/credit-notes',
    support_document: '/v2/support-documents',
    adjustment_note: '/v2/adjustment-notes',
  };
  return paths[documentType];
}

function downloadSegment(type: DownloadKind): string {
  return type === 'attached_document_xml' ? 'download-attached-document-xml' : `download-${type}`;
}

function extension(type: DownloadKind): string {
  return type === 'pdf' ? 'pdf' : 'xml';
}
