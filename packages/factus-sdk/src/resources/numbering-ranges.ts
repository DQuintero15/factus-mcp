import type { FactusClient } from '../client.js';
import type {
  FactusCredentials,
  FactusNumberingRange,
  ListNumberingRangesFilters,
} from '../types.js';

export class NumberingRangesResource {
  constructor(private readonly client: FactusClient) {}

  async list(
    creds: FactusCredentials,
    filters: ListNumberingRangesFilters = {},
  ): Promise<FactusNumberingRange[] | unknown> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: '/v2/numbering-ranges',
      query: {
        'filter[id]': filters.id,
        'filter[document]': filters.document,
        'filter[resolution_number]': filters.resolution_number,
        'filter[technical_key]': filters.technical_key,
        'filter[is_active]': filters.is_active,
      },
    });
  }
}
