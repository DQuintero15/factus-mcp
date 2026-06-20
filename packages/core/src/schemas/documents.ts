import { z } from 'zod';

import { billCustomerSchema, billItemSchema, billPaymentDetailSchema } from './invoice.js';

const requiredText = (field: string) =>
  z
    .string({
      required_error: `${field} is required; ask the user if it was not provided`,
    })
    .trim()
    .min(1, `${field} cannot be empty; ask the user if it was not provided`);

const looseObject = z.record(z.unknown());

const providerSchema = billCustomerSchema.extend({
  identification_document_code: z
    .string()
    .optional()
    .describe('Provider identification document code. Do not invent it; ask the user if missing.'),
  identification: requiredText('provider.identification').describe(
    'Provider identification number. Do not invent it; ask the user if missing.',
  ),
  dv: z.string().optional().describe('Provider verification digit. Do not invent it.'),
  company: z
    .string()
    .optional()
    .describe('Provider legal company name for a legal entity. Do not invent it.'),
  trade_name: z.string().optional().describe('Provider trade name. Do not invent it.'),
  names: z.string().optional().describe('Provider names for a natural person. Do not invent them.'),
  address: z.string().optional().describe('Provider address. Do not invent it.'),
  email: z.string().email().optional().describe('Provider email address. Do not invent it.'),
  phone: z.string().optional().describe('Provider phone number. Do not invent it.'),
  legal_organization_code: z
    .string()
    .optional()
    .describe(
      'Provider legal organization code. 1 = legal entity, 2 = natural person. Do not invent it.',
    ),
  tribute_code: z
    .string()
    .optional()
    .describe('Provider tax tribute code. Do not invent it; omit it or ask if missing.'),
  municipality_code: z
    .string()
    .optional()
    .describe(
      'Provider municipality code from the static catalog. Use get_municipalities or ask the user; do not invent it.',
    ),
  country_code: z
    .string()
    .optional()
    .describe(
      'Provider country code from the official country catalog. Use get_countries or ask the user; do not invent it.',
    ),
});

export const createCreditNoteSchema = z
  .object({
    reference_code: requiredText('reference_code').describe(
      'Unique credit note reference code. Do not invent it; ask the user if missing.',
    ),
    bill_id: z.number().int().positive().optional(),
    bill_number: z.string().trim().min(1).optional(),
    numbering_range_id: z.number().int().positive().optional(),
    correction_concept_code: requiredText('correction_concept_code').describe(
      'Official correction concept code. Do not invent it; ask the user if missing.',
    ),
    customization_id: z.string().optional(),
    payment_details: z
      .array(billPaymentDetailSchema)
      .min(1, 'payment_details requires at least one payment detail'),
    cash_rounding_amount: z.string().optional(),
    health: looseObject.optional(),
    observation: z.string().optional(),
    establishment: looseObject.optional(),
    billing_period: looseObject.optional(),
    allowance_charges: z.array(looseObject).optional(),
    customer: billCustomerSchema.optional(),
    items: z.array(billItemSchema).min(1, 'At least one item is required'),
  })
  .strict('Unsupported parameter in the credit note; omit it or ask the user for the correct data');

export const createSupportDocumentSchema = z
  .object({
    reference_code: requiredText('reference_code').describe(
      'Unique support document reference code. Do not invent it; ask the user if missing.',
    ),
    numbering_range_id: z.number().int().positive().optional(),
    created_time: z.string().optional().describe('HH:mm:ss'),
    observation: z.string().optional(),
    payment_details: z
      .array(billPaymentDetailSchema)
      .min(1, 'payment_details requires at least one payment detail'),
    cash_rounding_amount: z.string().optional(),
    establishment: looseObject.optional(),
    provider: providerSchema.describe(
      'Support document provider. Never invent, infer, guess, default, autofill, or choose provider identification or legal/tax data.',
    ),
    items: z.array(billItemSchema).min(1, 'At least one item is required'),
  })
  .strict(
    'Unsupported parameter in the support document; omit it or ask the user for the correct data',
  );

export const createAdjustmentNoteSchema = z
  .object({
    reference_code: requiredText('reference_code').describe(
      'Unique adjustment note reference code. Do not invent it; ask the user if missing.',
    ),
    support_document_number: requiredText('support_document_number').describe(
      'Support document number to adjust. Do not invent it; ask the user if missing.',
    ),
    correction_concept_code: requiredText('correction_concept_code').describe(
      'Official correction concept code. Do not invent it; ask the user if missing.',
    ),
    numbering_range_id: z.number().int().positive().optional(),
    created_time: z.string().optional().describe('HH:mm:ss'),
    observation: z.string().optional(),
    payment_details: z
      .array(billPaymentDetailSchema)
      .min(1, 'payment_details requires at least one payment detail'),
    cash_rounding_amount: z.string().optional(),
    provider: providerSchema.describe(
      'Adjustment note provider. Never invent, infer, guess, default, autofill, or choose provider identification or legal/tax data.',
    ),
    items: z.array(billItemSchema).min(1, 'At least one item is required'),
  })
  .strict(
    'Unsupported parameter in the adjustment note; omit it or ask the user for the correct data',
  );

export const getFiscalDocumentSchema = z.object({
  number: z.string().trim().min(1).describe('Fiscal document number. Do not invent it.'),
});

export const listFiscalDocumentsSchema = z.object({
  identification: z.string().optional().describe('Filter by identification.'),
  names: z.string().optional().describe('Filter by name.'),
  number: z.string().optional().describe('Filter by document number.'),
  prefix: z.string().optional().describe('Filter by numbering range prefix.'),
  reference_code: z.string().optional(),
  status: z
    .union([z.literal(0), z.literal(1)])
    .optional()
    .describe('1 = validated, 0 = unvalidated'),
  per_page: z.number().int().positive().optional(),
  start_date: z.string().optional().describe('YYYY-MM-DD'),
  end_date: z.string().optional().describe('YYYY-MM-DD'),
  page: z.number().int().positive().optional(),
});

export const deleteUnvalidatedFiscalDocumentSchema = z.object({
  reference_code: requiredText('reference_code').describe(
    'Reference code of the unvalidated document to delete. Do not invent it; show it and confirm before deleting.',
  ),
});

export const documentFileSchema = z.object({
  document_type: z.enum(['bill', 'credit_note', 'support_document', 'adjustment_note']),
  number: z.string().trim().min(1).describe('Document number. Do not invent it.'),
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
