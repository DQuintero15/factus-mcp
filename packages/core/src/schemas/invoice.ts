import { z } from 'zod';

const numericString = z.union([z.string(), z.number()]);
const requiredText = (field: string) =>
  z
    .string({
      required_error: `${field} is required; ask the user if it was not provided`,
    })
    .trim()
    .min(1, `${field} cannot be empty; ask the user if it was not provided`);
const requiredNumber = (field: string) =>
  z.number({
    required_error: `${field} is required; ask the user if it was not provided`,
  });
const requiredNumericString = (field: string) =>
  z.union([z.string().trim().min(1, `${field} cannot be empty`), z.number()], {
    required_error: `${field} is required; ask the user if it was not provided`,
  });

export const billPaymentDetailSchema = z
  .object({
    payment_form: numericString.describe('1 = cash/immediate payment, 2 = credit'),
    payment_method_code: z
      .string()
      .describe(
        'DIAN payment method code, for example 10 or 42. Do not invent it; ask the user or verify the official code.',
      ),
    reference_code: z.string().optional(),
    amount: numericString,
    due_date: z
      .string()
      .optional()
      .describe('YYYY-MM-DD. Required when payment_form = 2 (credit). Do not invent it.'),
  })
  .strict('Unsupported parameter in payment_details; omit it or ask the user for the correct data');

export const billCustomerSchema = z
  .object({
    identification_document_code: z.string().optional(),
    identification: requiredText('customer.identification').describe(
      'Customer identification number. Do not invent it; ask the user if missing.',
    ),
    dv: z.string().optional(),
    company: z
      .string()
      .optional()
      .describe('Legal company name for a legal entity. Do not invent it.'),
    trade_name: z.string().optional(),
    names: z
      .string()
      .optional()
      .describe('Customer names for a natural person. Do not invent them.'),
    address: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    legal_organization_code: z
      .string()
      .optional()
      .describe('1 = legal entity, 2 = natural person. Do not invent it.'),
    tribute_code: z
      .string()
      .optional()
      .describe('Tax tribute code. Do not invent it; omit it or ask if missing.'),
    municipality_code: z
      .string()
      .optional()
      .describe(
        'Municipality code from the static catalog. Use get_municipalities or ask the user; do not invent it.',
      ),
  })
  .strict('Unsupported parameter in customer; omit it or ask the user for the correct data');

export const billItemTaxSchema = z
  .object({
    code: z.string().optional().describe('Tax code, for example 01 for VAT. Do not invent it.'),
    rate: z.string().optional().describe('Tax rate, for example "19.00". Do not invent it.'),
    is_excluded: z.boolean().optional().describe('true when the item is tax-excluded.'),
  })
  .strict('Unsupported parameter in taxes; omit it or ask the user for the correct data');

export const billItemSchema = z
  .object({
    code_reference: requiredText('items[].code_reference').describe(
      'Item code/reference. Do not invent it; ask the user if missing.',
    ),
    name: requiredText('items[].name').describe(
      'Product or service name. Do not invent it; ask the user if missing.',
    ),
    quantity: requiredNumericString('items[].quantity').describe(
      'Item quantity. Do not invent it; ask the user if missing.',
    ),
    discount_rate: numericString.optional(),
    price: requiredNumericString('items[].price').describe(
      'NET price before taxes (Factus V2 rule). Do not use tax-included pricing unless the user confirms the value is already net.',
    ),
    unit_measure_code: requiredText('items[].unit_measure_code').describe(
      'Unit-measure code from the static catalog. Use get_unit_measures or ask the user; do not invent it.',
    ),
    standard_code: z
      .string()
      .optional()
      .describe('Standard code. Do not invent it; omit it or ask if missing.'),
    is_excluded: z.boolean().optional(),
    taxes: z.array(billItemTaxSchema).optional(),
    withholding_taxes: z.array(z.object({ code: z.string(), rate: z.string() })).optional(),
  })
  .strict('Unsupported parameter in items; omit it or ask the user for the correct data');

export const createInvoiceSchema = z
  .object({
    reference_code: requiredText('reference_code').describe(
      'Unique invoice reference code. Do not invent it; ask the user if missing.',
    ),
    document: z
      .string()
      .optional()
      .describe('Document type. "01" is a sales invoice. Do not invent it.'),
    numbering_range_id: requiredNumber('numbering_range_id')
      .int()
      .describe(
        'Numbering range ID to use. Use list_numbering_ranges and ask the user to choose; do not invent or auto-select it.',
      ),
    operation_type: z
      .string()
      .optional()
      .describe('Operation type. "10" is standard. Do not invent it.'),
    send_email: z.boolean().optional(),
    cash_rounding_amount: z.string().optional(),
    observation: z.string().optional(),
    order_reference: z
      .object({
        reference_code: z.string().optional(),
        issue_date: z.string().optional(),
      })
      .optional(),
    payment_details: z.array(billPaymentDetailSchema).optional(),
    customer: billCustomerSchema,
    items: z.array(billItemSchema).min(1, 'At least one item is required'),
  })
  .strict('Unsupported parameter in the invoice; omit it or ask the user for the correct data');

export const getInvoiceSchema = z.object({
  number: z.string().describe('Invoice number, for example SETP990001103. Do not invent it.'),
});

export const listInvoicesSchema = z.object({
  identification: z.string().optional().describe('Filter by customer identification.'),
  names: z.string().optional().describe('Filter by customer name.'),
  number: z.string().optional().describe('Filter by invoice number.'),
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

export const sendInvoiceEmailSchema = z.object({
  number: z
    .string()
    .describe('Invoice number to send. Do not invent it; show it and confirm before sending.'),
  email: z
    .string()
    .email()
    .describe('Destination email address. Do not invent it; show it and confirm before sending.'),
});

export const invoiceDownloadRefSchema = z.object({
  number: z.string().describe('Invoice number. Do not invent it.'),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type GetInvoiceInput = z.infer<typeof getInvoiceSchema>;
export type ListInvoicesInput = z.infer<typeof listInvoicesSchema>;
export type SendInvoiceEmailInput = z.infer<typeof sendInvoiceEmailSchema>;
export type InvoiceDownloadRefInput = z.infer<typeof invoiceDownloadRefSchema>;
