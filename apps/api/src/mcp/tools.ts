import type { ZodRawShape } from 'zod';

import {
  catalogQuerySchema,
  createAdjustmentNoteSchema,
  createCreditNoteSchema,
  createInvoiceSchema,
  createSupportDocumentSchema,
  deleteUnvalidatedFiscalDocumentSchema,
  documentFileSchema,
  documentUseCases,
  getCompanyInfoSchema,
  getFiscalDocumentSchema,
  getInvoiceSchema,
  invoiceUseCases,
  listFiscalDocumentsSchema,
  listInvoicesSchema,
  listNumberingRangesSchema,
  sendInvoiceEmailSchema,
  utilityUseCases,
  type FactusPort,
} from '@factus-mcp/core';
import type { FactusCredentials } from '@factus-mcp/factus-sdk';

export interface ToolContext {
  port: FactusPort;
  logger?: ToolLogger;
  requestId?: string;
  getCredentials: () => FactusCredentials;
}

export interface ToolLogger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodRawShape;
  requiresFactus: boolean;
  handler: (args: unknown, ctx: ToolContext) => Promise<unknown> | unknown;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'create_invoice',
    title: 'Crear y validar factura',
    description:
      'Crea y valida una factura electronica en Factus (POST /v2/bills/validate) con el payload completo. ' +
      'Operacion fiscal sensible: antes de invocarla, valida completitud, resuelve catalogos con tools, muestra resumen estructurado y pide confirmacion explicita. ' +
      'No inventes, infieras, autocompletes, selecciones ni asumas datos fiscales, legales, contables, cliente, producto, pago, impuestos, catalogos, autorizacion o numeracion. ' +
      'Si cualquier requerido falta, detente y pregunta. Nunca selecciones automaticamente un numbering_range_id, ni siquiera si hay uno solo. ' +
      'El precio de cada item debe ser NETO antes de impuestos.',
    inputSchema: createInvoiceSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => invoiceUseCases.createInvoice(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'get_invoice',
    title: 'Ver factura',
    description: 'Consulta una factura por su numero (GET /v2/bills/{number}).',
    inputSchema: getInvoiceSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => invoiceUseCases.getInvoice(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'list_invoices',
    title: 'Listar facturas',
    description: 'Lista facturas con filtros soportados (GET /v2/bills).',
    inputSchema: listInvoicesSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => invoiceUseCases.listInvoices(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'send_invoice_email',
    title: 'Enviar factura por correo',
    description: 'Reenvia una factura por correo (POST /v2/bills/{number}/send-email).',
    inputSchema: sendInvoiceEmailSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => invoiceUseCases.sendInvoiceEmail(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'create_credit_note',
    title: 'Crear y validar nota credito',
    description:
      'Crea y valida una nota credito en Factus (POST /v2/credit-notes/validate). ' +
      'Operacion fiscal sensible: valida completitud, muestra resumen estructurado y pide confirmacion explicita antes de invocarla. ' +
      'No inventes, infieras ni autocompletes datos fiscales, legales, contables, cliente, items, pagos, impuestos, catalogos, autorizacion o numeracion.',
    inputSchema: createCreditNoteSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => documentUseCases.createCreditNote(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'get_credit_note',
    title: 'Ver nota credito',
    description: 'Consulta una nota credito por su numero (GET /v2/credit-notes/{number}).',
    inputSchema: getFiscalDocumentSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => documentUseCases.getCreditNote(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'list_credit_notes',
    title: 'Listar notas credito',
    description: 'Lista notas credito con filtros soportados (GET /v2/credit-notes).',
    inputSchema: listFiscalDocumentsSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => documentUseCases.listCreditNotes(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'delete_unvalidated_credit_note',
    title: 'Eliminar nota credito no validada',
    description:
      'Elimina una nota credito no validada por reference_code (DELETE /v2/credit-notes/reference/{reference_code}). ' +
      'Operacion destructiva: requiere confirmacion explicita del usuario antes de invocarla.',
    inputSchema: deleteUnvalidatedFiscalDocumentSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) =>
      documentUseCases.deleteUnvalidatedCreditNote(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'create_support_document',
    title: 'Crear y validar documento soporte',
    description:
      'Crea y valida un documento soporte en Factus (POST /v2/support-documents/validate). ' +
      'Operacion fiscal sensible: valida completitud, muestra resumen estructurado y pide confirmacion explicita antes de invocarla. ' +
      'No inventes, infieras ni autocompletes datos fiscales, legales, contables, proveedor, items, pagos, impuestos, catalogos, autorizacion o numeracion.',
    inputSchema: createSupportDocumentSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) =>
      documentUseCases.createSupportDocument(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'get_support_document',
    title: 'Ver documento soporte',
    description:
      'Consulta un documento soporte por su numero (GET /v2/support-documents/{number}).',
    inputSchema: getFiscalDocumentSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) =>
      documentUseCases.getSupportDocument(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'list_support_documents',
    title: 'Listar documentos soporte',
    description: 'Lista documentos soporte con filtros soportados (GET /v2/support-documents).',
    inputSchema: listFiscalDocumentsSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) =>
      documentUseCases.listSupportDocuments(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'delete_unvalidated_support_document',
    title: 'Eliminar documento soporte no validado',
    description:
      'Elimina un documento soporte no validado por reference_code (DELETE /v2/support-documents/reference/{reference_code}). ' +
      'Operacion destructiva: requiere confirmacion explicita del usuario antes de invocarla.',
    inputSchema: deleteUnvalidatedFiscalDocumentSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) =>
      documentUseCases.deleteUnvalidatedSupportDocument(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'create_adjustment_note',
    title: 'Crear y validar nota de ajuste',
    description:
      'Crea y valida una nota de ajuste en Factus (POST /v2/adjustment-notes/validate). ' +
      'Operacion fiscal sensible: valida completitud, muestra resumen estructurado y pide confirmacion explicita antes de invocarla. ' +
      'No inventes, infieras ni autocompletes datos fiscales, legales, contables, proveedor, items, pagos, impuestos, catalogos, autorizacion o numeracion.',
    inputSchema: createAdjustmentNoteSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) =>
      documentUseCases.createAdjustmentNote(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'get_adjustment_note',
    title: 'Ver nota de ajuste',
    description:
      'Consulta una nota de ajuste por su numero (GET /v2/adjustment-notes/{number}).',
    inputSchema: getFiscalDocumentSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => documentUseCases.getAdjustmentNote(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'list_adjustment_notes',
    title: 'Listar notas de ajuste',
    description: 'Lista notas de ajuste con filtros soportados (GET /v2/adjustment-notes).',
    inputSchema: listFiscalDocumentsSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) =>
      documentUseCases.listAdjustmentNotes(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'delete_unvalidated_adjustment_note',
    title: 'Eliminar nota de ajuste no validada',
    description:
      'Elimina una nota de ajuste no validada por reference_code (DELETE /v2/adjustment-notes/reference/{reference_code}). ' +
      'Operacion destructiva: requiere confirmacion explicita del usuario antes de invocarla.',
    inputSchema: deleteUnvalidatedFiscalDocumentSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) =>
      documentUseCases.deleteUnvalidatedAdjustmentNote(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'get_document_file',
    title: 'Referencia segura de archivo de documento',
    description:
      'Devuelve metadata/referencia MCP-safe para descargar PDF, XML o attached_document_xml de facturas, notas credito, documentos soporte o notas de ajuste. ' +
      'No devuelve base64 ni binarios crudos. attached_document_xml solo aplica a bill y credit_note.',
    inputSchema: documentFileSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => documentUseCases.getDocumentFile(ctx.port, ctx.getCredentials(), args),
  },

  {
    name: 'list_numbering_ranges',
    title: 'Listar rangos de numeracion',
    description:
      'Lista los rangos de numeracion de la empresa (GET /v2/numbering-ranges). Necesario para emitir documentos.',
    inputSchema: listNumberingRangesSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) =>
      utilityUseCases.listNumberingRanges(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'get_company_info',
    title: 'Informacion de la empresa',
    description: 'Devuelve la informacion de la empresa emisora (GET /v2/companies).',
    inputSchema: getCompanyInfoSchema.shape,
    requiresFactus: true,
    handler: (_args, ctx) => utilityUseCases.getCompanyInfo(ctx.port, ctx.getCredentials()),
  },

  {
    name: 'get_countries',
    title: 'Catalogo de paises',
    description: 'Catalogo estatico de paises (codigo/nombre). Filtro opcional por texto.',
    inputSchema: catalogQuerySchema.shape,
    requiresFactus: false,
    handler: (args) => utilityUseCases.listCountries(args),
  },
  {
    name: 'get_currencies',
    title: 'Catalogo de monedas',
    description: 'Catalogo estatico de monedas (codigo/nombre). Filtro opcional por texto.',
    inputSchema: catalogQuerySchema.shape,
    requiresFactus: false,
    handler: (args) => utilityUseCases.listCurrencies(args),
  },
  {
    name: 'get_unit_measures',
    title: 'Catalogo de unidades de medida',
    description: 'Catalogo estatico de unidades de medida (codigo/nombre). Filtro opcional.',
    inputSchema: catalogQuerySchema.shape,
    requiresFactus: false,
    handler: (args) => utilityUseCases.listUnitMeasures(args),
  },
  {
    name: 'get_municipalities',
    title: 'Catalogo de municipios',
    description:
      'Catalogo estatico de municipios de Colombia (codigo/nombre/departamento). Filtro opcional.',
    inputSchema: catalogQuerySchema.shape,
    requiresFactus: false,
    handler: (args) => utilityUseCases.listMunicipalities(args),
  },
];
