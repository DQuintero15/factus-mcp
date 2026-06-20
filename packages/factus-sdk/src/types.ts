export interface FactusCredentials {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  email: string;
  password: string;
}

export interface FactusTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface FactusEnvelope<T> {
  status: string;
  message?: string;
  data: T;
}

export interface BillPaymentDetail {
  payment_form: number | string;
  payment_method_code: string;
  reference_code?: string;
  amount: number | string;
  due_date?: string;
}

export interface BillCustomer {
  identification_document_code?: string;
  identification: string;
  dv?: string;
  company?: string;
  trade_name?: string;
  names?: string;
  address?: string;
  email?: string;
  phone?: string;
  legal_organization_code?: string;
  tribute_code?: string;
  municipality_code?: string;
  country_code?: string;
}

export interface BillItemTax {
  code?: string;
  rate?: string;
  is_excluded?: boolean;
}

export interface BillItem {
  code_reference: string;
  name: string;
  quantity: number | string;
  discount_rate?: number | string;
  price: number | string;
  unit_measure_code: string;
  standard_code?: string;
  is_excluded?: boolean;
  taxes?: BillItemTax[];
  withholding_taxes?: Array<{ code: string; rate: string }>;
}

export interface CreateBillRequest {
  reference_code: string;
  document?: string;
  numbering_range_id: number;
  operation_type?: string;
  send_email?: boolean;
  cash_rounding_amount?: string;
  observation?: string;
  order_reference?: { reference_code?: string; issue_date?: string };
  payment_details?: BillPaymentDetail[];
  customer: BillCustomer;
  items: BillItem[];
}

export interface ListBillsFilters {
  identification?: string;
  names?: string;
  number?: string;
  prefix?: string;
  reference_code?: string;
  status?: 0 | 1 | '0' | '1';
  per_page?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
}

export interface ListDocumentFilters extends ListBillsFilters {}

export interface CreateCreditNoteRequest {
  reference_code: string;
  bill_id?: number;
  bill_number?: string;
  numbering_range_id?: number;
  correction_concept_code: string;
  customization_id?: string;
  payment_details: BillPaymentDetail[];
  cash_rounding_amount?: string;
  observation?: string;
  health?: Record<string, unknown>;
  establishment?: Record<string, unknown>;
  billing_period?: Record<string, unknown>;
  allowance_charges?: Array<Record<string, unknown>>;
  customer?: BillCustomer;
  items: BillItem[];
}

export interface CreateSupportDocumentRequest {
  reference_code: string;
  numbering_range_id?: number;
  created_time?: string;
  observation?: string;
  payment_details: BillPaymentDetail[];
  cash_rounding_amount?: string;
  establishment?: Record<string, unknown>;
  provider: BillCustomer;
  items: BillItem[];
}

export interface CreateAdjustmentNoteRequest {
  reference_code: string;
  support_document_number: string;
  correction_concept_code: string;
  numbering_range_id?: number;
  created_time?: string;
  observation?: string;
  payment_details: BillPaymentDetail[];
  cash_rounding_amount?: string;
  provider: BillCustomer;
  items: BillItem[];
}

export interface ListNumberingRangesFilters {
  id?: number;
  document?: string;
  resolution_number?: string;
  technical_key?: string;
  is_active?: 0 | 1 | '0' | '1';
}

export interface FactusBill {
  id?: number;
  number?: string;
  reference_code?: string;
  status?: number;
  cufe?: string;
  qr_image?: string;
  validated?: string;
  total?: string;
  [key: string]: unknown;
}

export interface FactusNumberingRange {
  id?: number;
  document?: string;
  prefix?: string;
  resolution_number?: string;
  technical_key?: string;
  current?: number;
  is_active?: boolean | number;
  [key: string]: unknown;
}

export interface FactusCompany {
  identification?: string;
  dv?: string;
  company?: string;
  trade_name?: string;
  email?: string;
  address?: string;
  phone?: string;
  municipality?: unknown;
  [key: string]: unknown;
}

export interface FactusDownloadResponse {
  status?: string;
  message?: string;
  data?: {
    file_name?: string;
    pdf_base_64_encoded?: string;
    xml_base_64_encoded?: string;
    attached_document_base_64_encoded?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
