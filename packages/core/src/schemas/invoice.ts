import { z } from 'zod';

const numericString = z.union([z.string(), z.number()]);
const requiredText = (field: string) =>
  z
    .string({
      required_error: `${field} es requerido; pidelo al usuario si no fue informado`,
    })
    .trim()
    .min(1, `${field} no puede estar vacio; pidelo al usuario si no fue informado`);
const requiredNumber = (field: string) =>
  z.number({
    required_error: `${field} es requerido; pidelo al usuario si no fue informado`,
  });
const requiredNumericString = (field: string) =>
  z.union([z.string().trim().min(1, `${field} no puede estar vacio`), z.number()], {
    required_error: `${field} es requerido; pidelo al usuario si no fue informado`,
  });

export const billPaymentDetailSchema = z
  .object({
    payment_form: numericString.describe('1 = contado, 2 = credito'),
    payment_method_code: z.string().describe('Codigo del medio de pago DIAN (p.ej. 10, 42)'),
    reference_code: z.string().optional(),
    amount: numericString,
    due_date: z
      .string()
      .optional()
      .describe('YYYY-MM-DD. Requerido cuando payment_form = 2 (credito)'),
  })
  .strict('Parametro no soportado en payment_details; omitelo o pide el dato correcto al usuario');

export const billCustomerSchema = z
  .object({
    identification_document_code: z.string().optional(),
    identification: requiredText('customer.identification').describe(
      'Numero de identificacion del adquirente. No lo inventes; si falta, preguntalo.',
    ),
    dv: z.string().optional(),
    company: z.string().optional().describe('Razon social (persona juridica)'),
    trade_name: z.string().optional(),
    names: z.string().optional().describe('Nombres (persona natural)'),
    address: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    legal_organization_code: z
      .string()
      .optional()
      .describe('1 = persona juridica, 2 = persona natural'),
    tribute_code: z
      .string()
      .optional()
      .describe('Codigo tributario. No lo inventes; omitelo si falta.'),
    municipality_code: z
      .string()
      .optional()
      .describe('Codigo del municipio (catalogo estatico). Usa get_municipalities o preguntalo.'),
  })
  .strict('Parametro no soportado en customer; omitelo o pide el dato correcto al usuario');

export const billItemTaxSchema = z
  .object({
    code: z.string().optional().describe('Codigo del tributo (01 = IVA). No lo inventes.'),
    rate: z.string().optional().describe('Tarifa, p.ej. "19.00". No la inventes.'),
    is_excluded: z.boolean().optional().describe('true para item excluido de impuestos'),
  })
  .strict('Parametro no soportado en taxes; omitelo o pide el dato correcto al usuario');

export const billItemSchema = z
  .object({
    code_reference: requiredText('items[].code_reference').describe(
      'Codigo/referencia del item. No lo inventes; si falta, preguntalo.',
    ),
    name: requiredText('items[].name').describe(
      'Nombre del producto o servicio. No lo inventes; si falta, preguntalo.',
    ),
    quantity: requiredNumericString('items[].quantity').describe(
      'Cantidad del item. No la inventes; si falta, preguntala.',
    ),
    discount_rate: numericString.optional(),
    price: requiredNumericString('items[].price').describe(
      'Precio NETO antes de impuestos (regla V2). No uses precio con IVA incluido salvo que el usuario confirme que ya es neto.',
    ),
    unit_measure_code: requiredText('items[].unit_measure_code').describe(
      'Codigo de unidad de medida (catalogo estatico). Usa get_unit_measures o preguntalo; no lo inventes.',
    ),
    standard_code: z
      .string()
      .optional()
      .describe('Codigo estandar. No lo inventes; omitelo si falta.'),
    is_excluded: z.boolean().optional(),
    taxes: z.array(billItemTaxSchema).optional(),
    withholding_taxes: z.array(z.object({ code: z.string(), rate: z.string() })).optional(),
  })
  .strict('Parametro no soportado en items; omitelo o pide el dato correcto al usuario');

export const createInvoiceSchema = z
  .object({
    reference_code: requiredText('reference_code').describe(
      'Codigo de referencia unico de la factura. No lo inventes; si falta, preguntalo.',
    ),
    document: z.string().optional().describe('Tipo de documento. "01" factura de venta'),
    numbering_range_id: requiredNumber('numbering_range_id')
      .int()
      .describe(
        'ID del rango de numeracion a usar. Usa list_numbering_ranges o preguntalo; no lo inventes.',
      ),
    operation_type: z.string().optional().describe('Tipo de operacion. "10" estandar'),
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
    items: z.array(billItemSchema).min(1, 'Se requiere al menos un item'),
  })
  .strict('Parametro no soportado en la factura; omitelo o pide el dato correcto al usuario');

export const getInvoiceSchema = z.object({
  number: z.string().describe('Numero de la factura (p.ej. SETP990001103)'),
});

export const listInvoicesSchema = z.object({
  identification: z.string().optional().describe('Filtrar por identificacion del cliente'),
  names: z.string().optional().describe('Filtrar por nombre del cliente'),
  number: z.string().optional().describe('Filtrar por numero de factura'),
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

export const sendInvoiceEmailSchema = z.object({
  number: z.string().describe('Numero de la factura'),
  email: z.string().email().describe('Correo destino'),
});

export const invoiceDownloadRefSchema = z.object({
  number: z.string().describe('Numero de la factura'),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type GetInvoiceInput = z.infer<typeof getInvoiceSchema>;
export type ListInvoicesInput = z.infer<typeof listInvoicesSchema>;
export type SendInvoiceEmailInput = z.infer<typeof sendInvoiceEmailSchema>;
export type InvoiceDownloadRefInput = z.infer<typeof invoiceDownloadRefSchema>;
