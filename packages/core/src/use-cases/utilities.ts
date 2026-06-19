import type { FactusCredentials } from '@factus-mcp/factus-sdk';
import {
  getCountries,
  getCurrencies,
  getMunicipalities,
  getUnitMeasures,
  sanitizeDeep,
  type McpSafeResult,
} from '@factus-mcp/shared';

import type { FactusPort } from '../ports/factus.port.js';
import { catalogQuerySchema, listNumberingRangesSchema } from '../schemas/utilities.js';

export async function listNumberingRanges(
  port: FactusPort,
  creds: FactusCredentials,
  input: unknown,
): Promise<McpSafeResult<unknown>> {
  const filters = listNumberingRangesSchema.parse(input);
  const result = await port.listNumberingRanges(creds, filters);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export async function getCompanyInfo(
  port: FactusPort,
  creds: FactusCredentials,
): Promise<McpSafeResult<unknown>> {
  const result = await port.getCompanyInfo(creds);
  return { source: 'factus', data: sanitizeDeep(result) };
}

export function listCountries(input: unknown): McpSafeResult<unknown> {
  const { query } = catalogQuerySchema.parse(input);
  return { source: 'catalog', data: getCountries(query) };
}

export function listCurrencies(input: unknown): McpSafeResult<unknown> {
  const { query } = catalogQuerySchema.parse(input);
  return { source: 'catalog', data: getCurrencies(query) };
}

export function listUnitMeasures(input: unknown): McpSafeResult<unknown> {
  const { query } = catalogQuerySchema.parse(input);
  return { source: 'catalog', data: getUnitMeasures(query) };
}

export function listMunicipalities(input: unknown): McpSafeResult<unknown> {
  const { query } = catalogQuerySchema.parse(input);
  return { source: 'catalog', data: getMunicipalities(query) };
}
