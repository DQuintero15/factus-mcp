export type DownloadKind = 'pdf' | 'xml' | 'attached_document_xml';
export type SafeDocumentType = 'bill' | 'credit_note' | 'support_document' | 'adjustment_note';

export interface DownloadReference {
  number: string;
  documentType?: SafeDocumentType;
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
