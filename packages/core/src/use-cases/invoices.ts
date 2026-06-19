import type { FactusCredentials, FactusDownloadResponse } from '@factus-mcp/factus-sdk';
import {
  sanitizeDeep,
  type DownloadKind,
  type DownloadReference,
  type McpSafeResult,
} from '@factus-mcp/shared';

import type { FactusPort } from '../ports/factus.port.js';
import {
  createInvoiceSchema,
  getInvoiceSchema,
  invoiceDownloadRefSchema,
  listInvoicesSchema,
  sendInvoiceEmailSchema,
} from '../schemas/invoice.js';

export async function createInvoice(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const payload = createInvoiceSchema.parse(input);
  const result = await port.createInvoice(creds, payload);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function getInvoice(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const { number } = getInvoiceSchema.parse(input);
  const result = await port.getInvoice(creds, number);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function listInvoices(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const filters = listInvoicesSchema.parse(input);
  const result = await port.listInvoices(creds, filters);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function sendInvoiceEmail(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const { number, email } = sendInvoiceEmailSchema.parse(input);
  const result = await port.sendInvoiceEmail(creds, number, email);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function getInvoicePdfRef(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<DownloadReference>> {
  const { number } = invoiceDownloadRefSchema.parse(input);
  const response = await port.downloadInvoicePdf(creds, number);
  return {
    source: 'factus',
    data: toDownloadReference(number, 'pdf', response),
  };
}

export async function getInvoiceXmlRef(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<DownloadReference>> {
  const { number } = invoiceDownloadRefSchema.parse(input);
  const response = await port.downloadInvoiceXml(creds, number);
  return {
    source: 'factus',
    data: toDownloadReference(number, 'xml', response),
  };
}

/**
 * Convierte la respuesta de descarga de Factus (que trae base64) en una
 * referencia MCP-safe con SOLO metadata. El binario nunca se reenvia.
 */
function toDownloadReference(
  number: string,
  type: DownloadKind,
  response: FactusDownloadResponse,
): DownloadReference {
  const data = response?.data ?? {};
  const base64 = type === 'pdf' ? data.pdf_base_64_encoded : data.xml_base_64_encoded;
  const available = typeof base64 === 'string' && base64.length > 0;
  const sizeBytes = available ? Math.floor((base64 as string).length * 0.75) : undefined;

  return {
    number,
    type,
    available,
    fileName: typeof data.file_name === 'string' ? data.file_name : `${number}.${type}`,
    source: `/v2/bills/${number}/download-${type}`,
    sizeBytes,
    hint: available
      ? `El documento ${type.toUpperCase()} esta disponible en Factus. Descargalo con tus credenciales desde GET ${`/v2/bills/${number}/download-${type}`}. El MCP no reenvia binarios.`
      : `Factus no reporto contenido ${type.toUpperCase()} descargable para la factura ${number}.`,
  };
}
