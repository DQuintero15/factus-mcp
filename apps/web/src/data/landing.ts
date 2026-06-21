export const tools = [
  { name: 'create_invoice', method: 'POST', group: 0, confirm: true, risk: 'high' },
  { name: 'get_invoice', method: 'GET', group: 0, confirm: false, risk: 'read' },
  { name: 'list_invoices', method: 'GET', group: 0, confirm: false, risk: 'read' },
  { name: 'send_invoice_email', method: 'POST', group: 0, confirm: true, risk: 'send' },
  { name: 'create_credit_note', method: 'POST', group: 1, confirm: true, risk: 'high' },
  { name: 'get_credit_note', method: 'GET', group: 1, confirm: false, risk: 'read' },
  { name: 'list_credit_notes', method: 'GET', group: 1, confirm: false, risk: 'read' },
  { name: 'delete_unvalidated_credit_note', method: 'DEL', group: 1, confirm: true, risk: 'danger' },
  { name: 'create_support_document', method: 'POST', group: 2, confirm: true, risk: 'high' },
  { name: 'get_support_document', method: 'GET', group: 2, confirm: false, risk: 'read' },
  { name: 'list_support_documents', method: 'GET', group: 2, confirm: false, risk: 'read' },
  { name: 'delete_unvalidated_support_document', method: 'DEL', group: 2, confirm: true, risk: 'danger' },
  { name: 'create_adjustment_note', method: 'POST', group: 3, confirm: true, risk: 'high' },
  { name: 'get_adjustment_note', method: 'GET', group: 3, confirm: false, risk: 'read' },
  { name: 'list_adjustment_notes', method: 'GET', group: 3, confirm: false, risk: 'read' },
  { name: 'delete_unvalidated_adjustment_note', method: 'DEL', group: 3, confirm: true, risk: 'danger' },
  { name: 'get_document_file', method: 'GET', group: 4, confirm: false, risk: 'file' },
  { name: 'list_numbering_ranges', method: 'GET', group: 4, confirm: false, risk: 'catalog' },
  { name: 'get_company_info', method: 'GET', group: 4, confirm: false, risk: 'company' },
  { name: 'catalogs', method: 'GET', group: 4, confirm: false, risk: 'catalog' },
] as const;

export const landingData = {
  es: {
    toolGroups: [
      {
        label: 'Facturas electronicas',
        description: 'Emision, consulta, listado y envio de facturas DIAN.',
        descs: [
          'Valida una factura contra Factus V2 con payload fiscal completo.',
          'Recupera una factura por su numero fiscal.',
          'Filtra facturas por estado, fecha, prefijo o cliente.',
          'Envia una factura validada por correo con confirmacion explicita.',
        ],
      },
      {
        label: 'Notas credito',
        description: 'Correcciones y anulaciones sobre facturas emitidas.',
        descs: [
          'Crea una nota credito con concepto oficial de correccion.',
          'Consulta la nota credito por numero.',
          'Lista notas credito con filtros seguros.',
          'Elimina solo notas credito no validadas.',
        ],
      },
      {
        label: 'Documentos soporte',
        description: 'Soporte electronico para proveedores y compras.',
        descs: [
          'Crea y valida un documento soporte.',
          'Consulta el documento soporte por numero.',
          'Lista documentos soporte por rango o proveedor.',
          'Elimina documentos soporte no validados.',
        ],
      },
      {
        label: 'Notas de ajuste',
        description: 'Ajustes fiscales sobre documentos soporte.',
        descs: [
          'Crea una nota de ajuste validada.',
          'Consulta una nota de ajuste por numero.',
          'Lista notas de ajuste con filtros.',
          'Elimina notas de ajuste no validadas.',
        ],
      },
      {
        label: 'Descargas y catalogos',
        description: 'Archivos, numeracion, empresa y catalogos oficiales.',
        descs: [
          'Descarga PDF, XML o attached_document_xml en base64.',
          'Lista rangos de numeracion activos o por resolucion.',
          'Obtiene informacion de la empresa emisora.',
          'Consulta paises, monedas, unidades y municipios.',
        ],
      },
    ],
    scenarios: [
      { key: 'invoice', label: 'Crear factura', prompt: 'Crea una factura a credito para Acme S.A.S. con sus datos fiscales ya confirmados. Son dos servicios de consultoria de $150.000 netos cada uno, con IVA del 19%. El pago sera por transferencia y vence el 20 de julio.', toolName: 'create_invoice', response: 'Factura lista en Factus: SETP990000123, estado Validada, total $357.000 COP y CUFE 9f2a...6c41. PDF, XML y attached_document_xml quedaron disponibles.' },
      { key: 'query', label: 'Consultar', prompt: 'Consulta la factura validada de Acme S.A.S. y resume estado, cliente, total y archivos disponibles.', toolName: 'get_invoice', response: 'La factura SETP990000123 esta validada. Cliente Acme S.A.S., total $357.000 COP y archivos disponibles: PDF, XML y attached_document_xml.' },
      { key: 'credit', label: 'Nota credito', prompt: 'Genera una nota credito para anular por devolucion total la factura de Acme S.A.S. usando los valores de la factura original.', toolName: 'create_credit_note', response: 'Nota credito validada contra SETP990000123: NC-SETP000045, estado Validada y valor reversado por $357.000 COP. La correccion queda trazada contra la factura original.' },
      { key: 'support', label: 'Documento soporte', prompt: 'Crea un documento soporte para Luis Perez con sus datos fiscales ya confirmados, por servicios tecnicos de $420.000 netos. El pago fue en efectivo.', toolName: 'create_support_document', response: 'Documento soporte creado: DSE-000031 para Luis Perez, estado Validado y total $420.000 COP. Disponible para PDF/XML y futuras notas de ajuste.' },
    ],
  },
  en: {
    toolGroups: [
      { label: 'Electronic invoices', description: 'Issue, query, list and email DIAN invoices.', descs: ['Validates an invoice against Factus V2 with the full fiscal payload.', 'Fetches an invoice by fiscal number.', 'Filters invoices by status, date, prefix or customer.', 'Emails a validated invoice after explicit confirmation.'] },
      { label: 'Credit notes', description: 'Corrections and voids for issued invoices.', descs: ['Creates a credit note with the official correction concept.', 'Fetches a credit note by number.', 'Lists credit notes with safe filters.', 'Deletes only unvalidated credit notes.'] },
      { label: 'Support documents', description: 'Electronic support documents for suppliers and purchases.', descs: ['Creates and validates a support document.', 'Fetches a support document by number.', 'Lists support documents by range or provider.', 'Deletes unvalidated support documents.'] },
      { label: 'Adjustment notes', description: 'Fiscal adjustments over support documents.', descs: ['Creates a validated adjustment note.', 'Fetches an adjustment note by number.', 'Lists adjustment notes with filters.', 'Deletes unvalidated adjustment notes.'] },
      { label: 'Downloads and catalogs', description: 'Files, numbering, company and official catalogs.', descs: ['Downloads PDF, XML or attached_document_xml as base64.', 'Lists active numbering ranges or by resolution.', 'Gets issuing company information.', 'Queries countries, currencies, units and municipalities.'] },
    ],
    scenarios: [
      { key: 'invoice', label: 'Create invoice', prompt: 'Create a credit invoice for Acme S.A.S. with its fiscal details already confirmed. Add two consulting services at $150,000 net each, 19% VAT. Payment is by bank transfer and due on July 20.', toolName: 'create_invoice', response: 'Invoice ready in Factus: SETP990000123, status Validated, total $357,000 COP and CUFE 9f2a...6c41. PDF, XML and attached_document_xml are available.' },
      { key: 'query', label: 'Query', prompt: 'Query the validated invoice for Acme S.A.S. and summarize status, customer, total and available files.', toolName: 'get_invoice', response: 'Invoice SETP990000123 is validated. Customer Acme S.A.S., total $357,000 COP and available files: PDF, XML and attached_document_xml.' },
      { key: 'credit', label: 'Credit note', prompt: 'Create a credit note to void Acme S.A.S. invoice because of a full return, using the original invoice values.', toolName: 'create_credit_note', response: 'Credit note validated against SETP990000123: NC-SETP000045, status Validated and reversed amount $357,000 COP. The correction is linked to the original invoice.' },
      { key: 'support', label: 'Support document', prompt: 'Create a support document for Luis Perez with his fiscal details already confirmed, for technical services worth $420,000 net. It was paid in cash.', toolName: 'create_support_document', response: 'Support document created: DSE-000031 for Luis Perez, status Validated and total $420,000 COP. Available for PDF/XML and future adjustment notes.' },
    ],
  },
} as const;

export const snippets = {
  claude: `claude mcp add --transport http factus "$FACTUS_MCP_URL" \\
  --header "Authorization: Bearer $FACTUS_MCP_API_KEY" \\
  --header "x-factus-base-url: $FACTUS_BASE_URL" \\
  --header "x-factus-client-id: $FACTUS_CLIENT_ID" \\
  --header "x-factus-client-secret: $FACTUS_CLIENT_SECRET" \\
  --header "x-factus-email: $FACTUS_EMAIL" \\
  --header "x-factus-password: $FACTUS_PASSWORD"`,
  desktop: `{
  "mcpServers": {
    "factus": {
      "command": "npx",
        "args": ["-y", "mcp-remote", "\${FACTUS_MCP_URL}"]
    }
  }
}`,
  codex: `{
  "servers": {
    "factus": {
      "transport": "http",
      "url": "\${FACTUS_MCP_URL}",
      "headers": { "Authorization": "Bearer \${FACTUS_MCP_API_KEY}" }
    }
  }
}`,
  curl: `curl -X POST "$FACTUS_MCP_URL" \\
  -H "Authorization: Bearer $FACTUS_MCP_API_KEY" \\
  -H "Content-Type: application/json" \\
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`,
} as const;
