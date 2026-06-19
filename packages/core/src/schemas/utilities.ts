import { z } from 'zod';

export const listNumberingRangesSchema = z.object({
  document: z
    .string()
    .optional()
    .describe('Codigo de documento: 21=Factura, 22=Nota Credito, 24=Doc Soporte...'),
  resolution_number: z.string().optional(),
  is_active: z
    .union([z.literal(0), z.literal(1)])
    .optional()
    .describe('1 activo, 0 inactivo'),
});

export const getCompanyInfoSchema = z.object({});

export const catalogQuerySchema = z.object({
  query: z
    .string()
    .optional()
    .describe('Texto opcional para filtrar por codigo o nombre (case-insensitive)'),
});

export type ListNumberingRangesInput = z.infer<typeof listNumberingRangesSchema>;
export type GetCompanyInfoInput = z.infer<typeof getCompanyInfoSchema>;
export type CatalogQueryInput = z.infer<typeof catalogQuerySchema>;
