import { z } from 'zod';

import { billCustomerSchema, billItemSchema, billPaymentDetailSchema } from './invoice.js';

const requiredText = (field: string) =>
  z
    .string({
      required_error: `${field} es requerido; pidelo al usuario si no fue informado`,
    })
    .trim()
    .min(1, `${field} no puede estar vacio; pidelo al usuario si no fue informado`);

const looseObject = z.record(z.unknown());

export const createCreditNoteSchema = z
  .object({
    reference_code: requiredText('reference_code').describe(
      'Codigo de referencia unico de la nota credito. No lo inventes; si falta, preguntalo.',
    ),
    bill_id: z.number().int().positive().optional(),
    bill_number: z.string().trim().min(1).optional(),
    numbering_range_id: z.number().int().positive().optional(),
    correction_concept_code: requiredText('correction_concept_code').describe(
      'Codigo oficial del concepto de correccion. No lo inventes; si falta, preguntalo.',
    ),
    customization_id: z.string().optional(),
    payment_details: z
      .array(billPaymentDetailSchema)
      .min(1, 'payment_details requiere al menos un detalle de pago'),
    cash_rounding_amount: z.string().optional(),
    health: looseObject.optional(),
    observation: z.string().optional(),
    establishment: looseObject.optional(),
    billing_period: looseObject.optional(),
    allowance_charges: z.array(looseObject).optional(),
    customer: billCustomerSchema.optional(),
    items: z.array(billItemSchema).min(1, 'Se requiere al menos un item'),
  })
  .strict('Parametro no soportado en la nota credito; omitelo o pide el dato correcto al usuario');

export const createSupportDocumentSchema = z
  .object({
    reference_code: requiredText('reference_code').describe(
      'Codigo de referencia unico del documento soporte. No lo inventes; si falta, preguntalo.',
    ),
    numbering_range_id: z.number().int().positive().optional(),
    created_time: z.string().optional().describe('HH:mm:ss'),
    observation: z.string().optional(),
    payment_details: z
      .array(billPaymentDetailSchema)
      .min(1, 'payment_details requiere al menos un detalle de pago'),
    cash_rounding_amount: z.string().optional(),
    establishment: looseObject.optional(),
    provider: billCustomerSchema.describe(
      'Proveedor del documento soporte. No inventes identificacion ni datos legales.',
    ),
    items: z.array(billItemSchema).min(1, 'Se requiere al menos un item'),
  })
  .strict(
    'Parametro no soportado en el documento soporte; omitelo o pide el dato correcto al usuario',
  );

export const createAdjustmentNoteSchema = z
  .object({
    reference_code: requiredText('reference_code').describe(
      'Codigo de referencia unico de la nota de ajuste. No lo inventes; si falta, preguntalo.',
    ),
    support_document_number: requiredText('support_document_number').describe(
      'Numero del documento soporte a ajustar. No lo inventes; si falta, preguntalo.',
    ),
    correction_concept_code: requiredText('correction_concept_code').describe(
      'Codigo oficial del concepto de correccion. No lo inventes; si falta, preguntalo.',
    ),
    numbering_range_id: z.number().int().positive().optional(),
    created_time: z.string().optional().describe('HH:mm:ss'),
    observation: z.string().optional(),
    payment_details: z
      .array(billPaymentDetailSchema)
      .min(1, 'payment_details requiere al menos un detalle de pago'),
    cash_rounding_amount: z.string().optional(),
    provider: billCustomerSchema.describe(
      'Proveedor de la nota de ajuste. No inventes identificacion ni datos legales.',
    ),
    items: z.array(billItemSchema).min(1, 'Se requiere al menos un item'),
  })
  .strict('Parametro no soportado en la nota de ajuste; omitelo o pide el dato correcto al usuario');

export const getFiscalDocumentSchema = z.object({
  number: z.string().trim().min(1).describe('Numero del documento'),
});

export const listFiscalDocumentsSchema = z.object({
  identification: z.string().optional().describe('Filtrar por identificacion'),
  names: z.string().optional().describe('Filtrar por nombre'),
  number: z.string().optional().describe('Filtrar por numero'),
  prefix: z.string().optional().describe('Filtrar por prefijo del rango'),
  reference_code: z.string().optional(),
  status: z
    .union([z.literal(0), z.literal(1)])
    .optional()
    .describe('1 = validado, 0 = no validado'),
  per_page: z.number().int().positive().optional(),
  start_date: z.string().optional().describe('YYYY-MM-DD'),
  end_date: z.string().optional().describe('YYYY-MM-DD'),
  page: z.number().int().positive().optional(),
});

export const deleteUnvalidatedFiscalDocumentSchema = z.object({
  reference_code: requiredText('reference_code').describe(
    'Codigo de referencia del documento no validado a eliminar.',
  ),
});

export const documentFileSchema = z.object({
  document_type: z.enum(['bill', 'credit_note', 'support_document', 'adjustment_note']),
  number: z.string().trim().min(1).describe('Numero del documento'),
  file_type: z.enum(['pdf', 'xml', 'attached_document_xml']),
});

export type CreateCreditNoteInput = z.infer<typeof createCreditNoteSchema>;
export type CreateSupportDocumentInput = z.infer<typeof createSupportDocumentSchema>;
export type CreateAdjustmentNoteInput = z.infer<typeof createAdjustmentNoteSchema>;
export type GetFiscalDocumentInput = z.infer<typeof getFiscalDocumentSchema>;
export type ListFiscalDocumentsInput = z.infer<typeof listFiscalDocumentsSchema>;
export type DeleteUnvalidatedFiscalDocumentInput = z.infer<
  typeof deleteUnvalidatedFiscalDocumentSchema
>;
export type DocumentFileInput = z.infer<typeof documentFileSchema>;
