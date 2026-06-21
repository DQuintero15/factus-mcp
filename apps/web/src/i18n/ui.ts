export const defaultLang = 'es';
export const languages = {
  es: 'ES',
  en: 'EN',
} as const;

export type Lang = keyof typeof languages;

export const ui = {
  es: {
    metaTitle: 'Factus MCP - Facturacion electronica DIAN para LLMs',
    metaDescription: 'Servidor MCP remoto para facturacion electronica DIAN via Factus V2',
    navTools: 'Herramientas',
    navDemo: 'Demo',
    navConnect: 'Conectar',
    navDash: 'Dashboard',
    heroBadge: '20 TOOLS MCP / FACTUS V2 / DIAN',
    heroTitle: 'Facturacion electronica DIAN',
    heroTitle2: 'para agentes LLM.',
    heroSub:
      'Conecta Claude, Codex o cualquier cliente MCP con Factus V2 para emitir, consultar y descargar documentos electronicos sin persistir credenciales sensibles.',
    heroCta1: 'Conectar mi cliente',
    heroCta2: 'Ver repositorio',
    heroTerminal: 'Instalacion en Claude Code',
    demoKicker: 'Demo interactiva',
    demoTitle: 'Ejecuta flujos fiscales como llamadas MCP reales.',
    demoSub:
      'Escribe una solicitud normal y mira que tool Factus MCP se llama, sin que el agente invente datos fiscales.',
    demoIdle: 'Selecciona un caso para ver al agente trabajar.',
    demoTerminalTitle: 'Terminal demo / Factus MCP',
    demoThinking: 'Ejecutando',
    flowKicker: 'Arquitectura',
    flowTitle: 'De lenguaje natural a factura electronica validada.',
    flowSub:
      'El usuario aporta los datos; el agente ordena el flujo, el servidor revisa campos y catalogos oficiales, y Factus/DIAN devuelven el documento electronico.',
    flowAria: 'Flujo de datos desde el agente hasta DIAN',
    flowNodeAgent: 'Agente o app',
    flowNodeAgentText: 'Recibe la solicitud en lenguaje natural con datos proporcionados por el usuario.',
    flowNodeMcp: 'Tool MCP',
    flowNodeMcpText: 'Convierte la intencion en una llamada explicita, con confirmacion para operaciones sensibles.',
    flowNodeValidation: 'Validacion y catalogos',
    flowNodeValidationText: 'Ordena el payload confirmado, revisa campos requeridos, precios netos y codigos oficiales sin inventarlos.',
    flowNodeFactus: 'Factus API',
    flowNodeFactusText: 'Envia el payload confirmado a Factus V2 para validacion del documento.',
    flowNodeDian: 'DIAN / resultado',
    flowNodeDianText: 'Devuelve numero, estado, CUFE, total y archivos electronicos disponibles para consulta o descarga.',
    flowProofLabel: 'Control fiscal',
    flowProofTitle: 'Datos confirmados, trazabilidad y resultado auditable.',
    flowProofText: 'La capa MCP no persiste credenciales Factus ni completa datos fiscales por su cuenta.',
    toolsKicker: 'Herramientas',
    toolsTitle: 'Tool cards estilo Vercel, listas para fiscalidad real.',
    toolsSub:
      'Cada tool expone su operacion, riesgo y validacion de forma escaneable, con grupos compactos que funcionan en desktop y mobile.',
    connectKicker: 'Conectar',
    connectTitle: 'Agrega Factus MCP a tu cliente en minutos.',
    connectSub:
      'Las credenciales Factus viajan por headers en cada request y nunca se persisten. Solo tu API Key MCP se valida contra su hash.',
    connectNote:
      'Usa variables de entorno para mantener tus headers secretos fuera del codigo fuente.',
    copy: 'Copiar',
    copied: 'Copiado',
    footer:
      'No guardamos credenciales Factus ni datos de negocio. El panel solo administra autenticacion y API Keys MCP.',
  },
  en: {
    metaTitle: 'Factus MCP - DIAN e-invoicing for LLMs',
    metaDescription: 'Remote MCP server for DIAN e-invoicing through Factus V2',
    navTools: 'Tools',
    navDemo: 'Demo',
    navConnect: 'Connect',
    navDash: 'Dashboard',
    heroBadge: '20 MCP TOOLS / FACTUS V2 / DIAN',
    heroTitle: 'DIAN e-invoicing',
    heroTitle2: 'for LLM agents.',
    heroSub:
      'Connect Claude, Codex or any MCP client with Factus V2 to issue, query and download electronic documents without storing sensitive credentials.',
    heroCta1: 'Connect my client',
    heroCta2: 'View repository',
    heroTerminal: 'Install in Claude Code',
    demoKicker: 'Interactive demo',
    demoTitle: 'Run fiscal workflows as real MCP tool calls.',
    demoSub:
      'Write a normal request and see which Factus MCP tool is called, without the agent inventing fiscal data.',
    demoIdle: 'Select a use case to watch the agent work.',
    demoTerminalTitle: 'Terminal demo / Factus MCP',
    demoThinking: 'Executing',
    flowKicker: 'Architecture',
    flowTitle: 'From natural language to a validated e-invoice.',
    flowSub:
      'The user provides the data; the agent sequences the workflow, the server checks required fields and official catalogs, and Factus/DIAN return the electronic document.',
    flowAria: 'Data flow from the agent to DIAN',
    flowNodeAgent: 'Agent or app',
    flowNodeAgentText: 'Receives the natural-language request with user-provided invoice details.',
    flowNodeMcp: 'MCP tool',
    flowNodeMcpText: 'Turns intent into an explicit tool call, with confirmation for sensitive operations.',
    flowNodeValidation: 'Validation and catalogs',
    flowNodeValidationText: 'Orders the confirmed payload, checks required fields, net prices and official codes without inventing them.',
    flowNodeFactus: 'Factus API',
    flowNodeFactusText: 'Sends the confirmed payload to Factus V2 for document validation.',
    flowNodeDian: 'DIAN / result',
    flowNodeDianText: 'Returns number, status, CUFE, total and electronic files available to query or download.',
    flowProofLabel: 'Fiscal control',
    flowProofTitle: 'Confirmed data, traceability and auditable result.',
    flowProofText: 'The MCP layer does not persist Factus credentials or complete fiscal data on its own.',
    toolsKicker: 'Tools',
    toolsTitle: 'Vercel-inspired tool cards for real fiscal workflows.',
    toolsSub:
      'Every tool exposes its operation, risk and validation status in a scannable layout that works on desktop and mobile.',
    connectKicker: 'Connect',
    connectTitle: 'Add Factus MCP to your client in minutes.',
    connectSub:
      'Factus credentials travel in headers on every request and are never persisted. Only your MCP API Key is checked against its hash.',
    connectNote: 'Use environment variables to keep secret headers out of source code.',
    copy: 'Copy',
    copied: 'Copied',
    footer:
      'We never store Factus credentials or business data. The panel only manages auth and MCP API Keys.',
  },
} as const;

export function useTranslations(lang: Lang = defaultLang) {
  return ui[lang];
}
