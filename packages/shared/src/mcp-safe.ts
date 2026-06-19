export type DownloadKind = 'pdf' | 'xml';

export interface DownloadReference {
  number: string;
  type: DownloadKind;
  available: boolean;
  fileName: string;
  source: string;
  sizeBytes?: number;
  hint: string;
}

export interface McpSafeResult<T> {
  source: 'factus' | 'catalog';
  data: T;
}
