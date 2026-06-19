import type { ZodRawShape } from 'zod';

import {
  catalogQuerySchema,
  createInvoiceSchema,
  getCompanyInfoSchema,
  getInvoiceSchema,
  invoiceDownloadRefSchema,
  invoiceUseCases,
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
    name: 'get_invoice_pdf_ref',
    title: 'Referencia PDF de factura',
    description:
      'Devuelve metadata/referencia descargable del PDF de una factura (no el binario crudo).',
    inputSchema: invoiceDownloadRefSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => invoiceUseCases.getInvoicePdfRef(ctx.port, ctx.getCredentials(), args),
  },
  {
    name: 'get_invoice_xml_ref',
    title: 'Referencia XML de factura',
    description:
      'Devuelve metadata/referencia descargable del XML de una factura (no el binario crudo).',
    inputSchema: invoiceDownloadRefSchema.shape,
    requiresFactus: true,
    handler: (args, ctx) => invoiceUseCases.getInvoiceXmlRef(ctx.port, ctx.getCredentials(), args),
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
