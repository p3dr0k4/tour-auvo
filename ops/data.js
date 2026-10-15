// ============================================================
// Cenário fictício único do tour do Auvo OPS.
// Prestadora: Vértice Engenharia de Manutenção (gestora Paula Andrade).
// O Chiller 01 do Hospital Santa Aurora atravessa o tour inteiro (quinta, 15/10/2026):
// chamado no Portal (SR-0128) -> OS-00412 com SLA -> rotas do dia -> técnico em campo ->
// assinatura no aplicativo -> histórico do ativo -> indicadores -> pergunta ao Jonas.
// ============================================================
const CO = { name: 'Vértice Manutenção', user: 'Paula', full: 'Paula Andrade', role: 'Gestora' };
const TEC = ['Carlos Mendes', 'Juliana Rocha', 'Rafael Souza'];
const HSA = 'Hospital Santa Aurora';

// status da OS (mesmos nomes do OPS)
const WST = {
  aberta: { l: 'Aberta', c: 'info' },
  atribuida: { l: 'Atribuída', c: 'pur' },
  andamento: { l: 'Em andamento', c: 'warn' },
  peca: { l: 'Aguardando peça', c: 'mute' },
  concluida: { l: 'Concluída', c: 'ok' },
};
const PRIO = { critica: { l: 'Crítica', c: 'bad' }, urgente: { l: 'Urgente', c: 'bad' }, alta: { l: 'Alta', c: 'org' }, media: { l: 'Média', c: 'mute' }, baixa: { l: 'Baixa', c: 'mute' } };

// a OS principal muda conforme a história avança (tour.js usa story())
const MAIN = {
  sr: 'SR-0128', code: 'OS-00412', title: 'Chiller 01 desarmando por alta pressão', cli: HSA, local: 'Casa de Máquinas', asset: 'Chiller 01 - Água Gelada 150 TR', assetCode: 'CHL-001',
  st: 'aberta', prio: 'alta', tech: null, srSt: 'pendente', signed: false, mat: false, summary: false,
  desc: 'O Chiller 01 desarmou duas vezes desde as 6h por alta pressão de descarga. O centro cirúrgico está com a temperatura subindo. Precisamos de alguém hoje cedo.',
  by: 'Renata Prado', byRole: 'Engenharia clínica',
};

// [código, título, status, prioridade, ativo, técnico, prazo, cliente]
const WOS = [
  ['OS-00411', 'Elevador Social 02 com ruído na subida', 'atribuida', 'media', 'Elevador Social 02', 'Juliana Rocha', '16/10/2026', 'Shopping Vale Verde'],
  ['OS-00410', 'Preventiva mensal - Chiller Central 400 TR', 'andamento', 'media', 'Chiller Central 400 TR', 'Rafael Souza', '15/10/2026', 'Corporate Tower Paulista'],
  ['OS-00409', 'Câmara fria de congelados com degelo irregular', 'peca', 'alta', 'Câmara Fria Congelados', 'Juliana Rocha', '17/10/2026', 'Rede Bom Preço Supermercados'],
  ['OS-00408', 'PMOC mensal - Climatização Centro Cirúrgico', 'atribuida', 'media', '2 ativos', 'Carlos Mendes', '20/10/2026', HSA],
  ['OS-00407', 'Bomba de incêndio principal não parte no teste', 'concluida', 'critica', 'Bomba de Incêndio Principal', 'Rafael Souza', '14/10/2026', 'Corporate Tower Paulista'],
  ['OS-00406', 'Preventiva trimestral - Grupo Gerador 500 kVA', 'concluida', 'media', 'Grupo Gerador 500 kVA', 'Carlos Mendes', '14/10/2026', HSA],
  ['OS-00405', 'Compressor de ar com vazamento na linha', 'concluida', 'alta', 'Compressor de Ar 40 hp', 'Rafael Souza', '13/10/2026', 'Ferrobras Industrial'],
  ['OS-00404', 'Nobreak do laboratório com bateria em fim de vida', 'peca', 'media', 'Nobreak 40 kVA - Laboratório', 'Juliana Rocha', '21/10/2026', 'Vitallis Diagnósticos'],
];

// [nome, código, status, criticidade, preventiva, localização]
const ASSETS = [
  ['Chiller 01 - Água Gelada 150 TR', 'CHL-001', 'Ativo', 'Crítica', 'Coberto pelo local', 'Casa de Máquinas'],
  ['Chiller 02 - Água Gelada 150 TR', 'CHL-002', 'Ativo', 'Crítica', 'Coberto pelo local', 'Casa de Máquinas'],
  ['Autoclave Central de Material 360L', 'AUT-001', 'Ativo', 'Crítica', 'Coberto', 'Centro Cirúrgico - 3º andar'],
  ['Fancoil Centro Cirúrgico - Salas 1 a 4', 'AHU-014', 'Ativo', 'Crítica', 'Coberto', 'Centro Cirúrgico - 3º andar'],
  ['Grupo Gerador 500 kVA', 'GER-001', 'Ativo', 'Crítica', 'Coberto', 'Casa de Geradores'],
  ['Nobreak 80 kVA - Centro Cirúrgico', 'UPS-002', 'Ativo', 'Crítica', 'Coberto', 'Subestação e Geradores'],
  ['Bomba de Água Gelada Primária', 'BAG-001', 'Ativo', 'Alta', 'Coberto pelo local', 'Casa de Máquinas'],
  ['Chiller Central 400 TR', 'CHL-101', 'Ativo', 'Crítica', 'Coberto', 'Central de Água Gelada'],
  ['Câmara Fria Congelados - Loja Vila Mariana', 'CFR-302', 'Em manutenção', 'Crítica', 'Coberto', 'Bom Preço - Loja Vila Mariana'],
  ['Compressor de Ar Parafuso 40 hp', 'CMP-202', 'Ativo', 'Alta', 'Sem plano', 'Utilidades - Ar Comprimido'],
  ['Elevador Social 02', 'ELV-102', 'Ativo', 'Alta', 'Coberto pelo local', 'Torre de Elevadores'],
  ['Bomba de Incêndio Principal', 'BIN-401', 'Ativo', 'Crítica', 'Coberto', 'Subsolo - Bombas e Incêndio'],
  ['Nobreak 40 kVA - Laboratório', 'UPS-501', 'Em manutenção', 'Alta', 'Coberto', 'Laboratório Central'],
];

// clientes: [nome, cidade, unidades, ativos, OS abertas]
const CLIENTS = [
  [HSA, 'São Paulo/SP', 1, 9, 2], ['Rede Bom Preço Supermercados', 'São Paulo/SP', 3, 8, 1], ['Shopping Vale Verde', 'Campinas/SP', 1, 7, 1],
  ['Corporate Tower Paulista', 'São Paulo/SP', 1, 8, 1], ['Ferrobras Industrial', 'Jundiaí/SP', 1, 7, 0], ['Vitallis Diagnósticos', 'São Paulo/SP', 1, 5, 1],
  ['Residencial Parque das Águas', 'Santo André/SP', 1, 4, 0], ['Café Express Vending', 'São Paulo/SP', 4, 6, 0],
];

// planos de preventiva: [código, quando, título, cliente/local]
const PMS = [
  ['PM-002', '20 de out.', 'PMOC mensal - Climatização Centro Cirúrgico', HSA],
  ['PM-004', '28 de out.', 'Quinzenal - Refrigeração comercial Rede Bom Preço', 'Rede Bom Preço Supermercados'],
  ['PM-011', '05 de nov.', 'Preventiva mensal - Chiller Central 400 TR', 'Corporate Tower Paulista'],
  ['PM-014', '16 de nov.', 'Trimestral - Fancoil Centro Cirúrgico', HSA],
];
// dias de outubro com preventivas agendadas -> quantidade
const PMCAL = { 6: 2, 9: 1, 14: 3, 15: 2, 20: 4, 22: 1, 28: 3, 30: 1 };

// rotas montadas pelo Jonas: técnico -> [hora, local · OS — título, deslocamento, principal?]
const ROUTES = [
  ['Carlos Mendes', '3 visitas · 34 km', [['08:40', HSA + ' · OS-00412 — Chiller 01 desarmando por alta pressão', '22 min de deslocamento', 1], ['13:30', HSA + ' · OS-00408 — PMOC mensal - Climatização', 'mesmo local', 0], ['16:10', 'Vitallis Diagnósticos · OS-00404 — Nobreak do laboratório', '18 min de deslocamento', 0]]],
  ['Juliana Rocha', '3 visitas · 29 km', [['08:30', 'Shopping Vale Verde · OS-00411 — Elevador Social 02 com ruído', '26 min de deslocamento', 0], ['11:20', 'Rede Bom Preço · OS-00409 — Câmara fria com degelo irregular', '31 min de deslocamento', 0], ['15:00', 'Rede Bom Preço · PM-004 — Refrigeração comercial', '12 min de deslocamento', 0]]],
  ['Rafael Souza', '3 visitas · 23 km', [['08:15', 'Corporate Tower · OS-00410 — Preventiva Chiller Central', '15 min de deslocamento', 0], ['11:00', 'Ferrobras Industrial · Inspeção compressor de ar', '34 min de deslocamento', 0], ['14:40', 'Corporate Tower · Teste semanal bomba de incêndio', '33 min de deslocamento', 0]]],
];

const SALES = {
  proof: [['Convite', 'acesso para clientes selecionados'], ['Jonas', 'IA integrada à operação'], ['Web + app', 'para gestão e técnicos'], ['Ativos', 'SLA e preventiva no centro']],
  proofSrc: 'Dados de exemplo',
  trust: ['Acesso por convite, para clientes selecionados', 'Ambiente de testes com dados de exemplo antes de decidir', 'Migração dos seus dados do Auvo por planilha ou importação'],
  waText: 'Olá, Pedro! Fiz o tour do Auvo OPS e quero conversar sobre o acesso.',
  demoBase: 'https://www.auvo.com/demonstracao-gratis',
  waNumber: '5562981522273',
};
function demoUrl(content) {
  const q = new URLSearchParams({ utm_source: 'tour-auvo-ops', utm_medium: 'tour-interativo', utm_campaign: 'tour-auvo-ops', utm_content: content || 'geral' });
  return SALES.demoBase + '?' + q.toString();
}
