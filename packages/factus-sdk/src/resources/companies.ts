import type { FactusClient } from '../client.js';
import type { FactusCompany, FactusCredentials, FactusEnvelope } from '../types.js';

export class CompaniesResource {
  constructor(private readonly client: FactusClient) {}

  async get(creds: FactusCredentials): Promise<FactusEnvelope<FactusCompany> | unknown> {
    return this.client.authedRequest(creds, {
      method: 'GET',
      path: '/v2/companies',
    });
  }
}
