import { FactusTokenManager, type FactusTokenCache } from './auth.js';
import { FactusError } from './errors.js';
import { FactusHttpClient, type HttpClientOptions } from './http.js';
import { AdjustmentNotesResource } from './resources/adjustment-notes.js';
import { BillsResource } from './resources/bills.js';
import { CompaniesResource } from './resources/companies.js';
import { CreditNotesResource } from './resources/credit-notes.js';
import { NumberingRangesResource } from './resources/numbering-ranges.js';
import { SupportDocumentsResource } from './resources/support-documents.js';
import type { FactusCredentials } from './types.js';

export interface FactusClientOptions {
  tokenTtlSeconds: number;
  tokenCache: FactusTokenCache;
  http?: HttpClientOptions;
}

export interface AuthedRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

/**
 * Cliente Factus V2 propio. Maneja OAuth por request (con cache inyectada),
 * resiliencia y mapeo de errores. Las credenciales se reciben por llamada y
 * nunca se persisten.
 */
export class FactusClient {
  private readonly tokenManager: FactusTokenManager;
  private readonly http: FactusHttpClient;

  readonly bills: BillsResource;
  readonly creditNotes: CreditNotesResource;
  readonly supportDocuments: SupportDocumentsResource;
  readonly adjustmentNotes: AdjustmentNotesResource;
  readonly numberingRanges: NumberingRangesResource;
  readonly companies: CompaniesResource;

  constructor(options: FactusClientOptions) {
    this.tokenManager = new FactusTokenManager({
      ttlSeconds: options.tokenTtlSeconds,
      cache: options.tokenCache,
    });
    this.http = new FactusHttpClient(options.http);

    this.bills = new BillsResource(this);
    this.creditNotes = new CreditNotesResource(this);
    this.supportDocuments = new SupportDocumentsResource(this);
    this.adjustmentNotes = new AdjustmentNotesResource(this);
    this.numberingRanges = new NumberingRangesResource(this);
    this.companies = new CompaniesResource(this);
  }

  async authedRequest<T>(creds: FactusCredentials, opts: AuthedRequestOptions): Promise<T> {
    const secrets = [creds.clientSecret, creds.password, creds.clientId];
    const token = await this.tokenManager.getAccessToken(creds);

    try {
      return await this.http.request<T>({
        ...opts,
        baseUrl: creds.baseUrl,
        accessToken: token,
        secrets,
      });
    } catch (err) {
      if (err instanceof FactusError && err.kind === 'auth') {
        await this.tokenManager.invalidate(creds);
        const fresh = await this.tokenManager.getAccessToken(creds);
        return this.http.request<T>({
          ...opts,
          baseUrl: creds.baseUrl,
          accessToken: fresh,
          secrets,
        });
      }
      throw err;
    }
  }
}
