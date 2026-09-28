// ============================================================
// Cenário fictício único: "Frio Total Climatização".
// O Condomínio Bela Vista atravessa o tour inteiro (quinta 24/09 -> sexta 25/09):
// WhatsApp no AuvoHub -> ticket no AuvoDesk (#0250) -> OS na Agenda (#80412) -> assinatura -> fatura (#1042) e Pix.
// ============================================================
const CLI = {
  bv: 'Condomínio Bela Vista', sn: 'Studio Nine Pilates', ap: 'Auto Peças Sul',
  sh: 'Shopping Rio Claro', cv: 'Clínica VidaPlena', pt: 'Padaria Trigo Bom', ha: 'Hotel Alvorada',
};
const TEC = ['Carlos Mendes', 'Juliana Prado', 'Rafael Souza'];

// módulos que colorem a agenda
const MOD = {
  os:   { label: 'Operação', color: '#7c3aed' },
  fin:  { label: 'Financeiro',    color: '#f59e0b' },
  pmoc: { label: 'PMOC',          color: '#16a34a' },
  desk: { label: 'AuvoDesk',      color: '#0ea5e9' },
  hub:  { label: 'AuvoHub', color: '#d946ef' },
};

// Cores da agenda = STATUS da tarefa (igual ao Auvo real). O módulo de origem aparece como barra lateral colorida.
const ST = {
  open:  { label: 'Em aberto',               color: '#f28b82' },
  run:   { label: 'Em execução',             color: '#34c759' },
  pause: { label: 'Em pausa',                color: '#f472b6' },
  pend:  { label: 'Finalizada com pendência', color: '#facc15' },
  done:  { label: 'Finalizada sem pendência', color: '#b9b6b1' },
  route: { label: 'Em deslocamento',         color: '#38bdf8' },
};

// [data, hora, módulo de origem, texto, chave, status]
const EVENTS = [
  ['2026-08-31', '09:00', 'os', 'Trigo Bom — Preventiva', '', 'done'],
  ['2026-08-31', '11:15', 'os', 'Alvorada — Troca de filtro', '', 'done'],
  ['2026-09-01', '09:51', 'os', 'Studio Nine — Instalação split', '', 'done'],
  ['2026-09-02', '08:30', 'os', 'Bela Vista — Preventiva', '', 'done'],
  ['2026-09-02', '14:00', 'desk', 'Ticket #0244 — Ruído no split', '', 'done'],
  ['2026-09-03', '10:00', 'pmoc', 'PMOC — Auto Peças Sul', '', 'done'],
  ['2026-09-03', '16:00', 'os', 'VidaPlena — Corretiva', '', 'pend'],
  ['2026-09-04', '09:00', 'os', 'Shopping — Ronda chiller', '', 'done'],
  ['2026-09-08', '08:00', 'fin', 'Cobrança — Shopping Rio Claro', '', 'pend'],
  ['2026-09-08', '11:09', 'hub', 'AuvoHub — Studio Nine', '', 'done'],
  ['2026-09-09', '15:59', 'os', 'Trigo Bom — Câmara fria', '', 'done'],
  ['2026-09-10', '10:30', 'pmoc', 'PMOC — Shopping Rio Claro', '', 'pend'],
  ['2026-09-11', '09:00', 'os', 'Alvorada — Preventiva', '', 'done'],
  ['2026-09-11', '14:00', 'os', 'Studio Nine — Higienização', '', 'done'],
  ['2026-09-14', '08:30', 'os', 'VidaPlena — Preventiva', '', 'done'],
  ['2026-09-14', '13:00', 'os', 'Auto Peças — Carga de gás', '', 'done'],
  ['2026-09-15', '09:30', 'desk', 'Ticket #0247 — Orçamento', '', 'done'],
  ['2026-09-16', '10:00', 'fin', 'Reajuste — Hotel Alvorada', '', 'done'],
  ['2026-09-17', '09:00', 'pmoc', 'PMOC — VidaPlena', '', 'done'],
  ['2026-09-18', '11:00', 'hub', 'AuvoHub — Trigo Bom', '', 'done'],
  ['2026-09-21', '08:00', 'os', 'Shopping — Preventiva', '', 'done'],
  ['2026-09-22', '09:00', 'os', 'Bela Vista — Bloco A', '', 'done'],
  ['2026-09-22', '15:00', 'os', 'Studio Nine — Preventiva', '', 'pend'],
  ['2026-09-23', '10:00', 'fin', 'Faturar OS — Auto Peças', '', 'pend'],
  ['2026-09-24', '09:00', 'pmoc', 'PMOC — Bela Vista', 'pmoc', 'done'],
  ['2026-09-24', '11:30', 'fin', 'Cobrança — Auto Peças Sul', '', 'done'],
  ['2026-09-24', '14:00', 'desk', 'Ticket #0248 — Split pingando', '', 'done'],
  ['2026-09-25', '08:30', 'os', 'Bela Vista — Ar não gela', 'main', 'pend'],
  ['2026-09-25', '09:15', 'os', 'Studio Nine — Higienização', '', 'run'],
  ['2026-09-25', '10:00', 'os', 'Trigo Bom — Câmara fria', '', 'pause'],
  ['2026-09-25', '11:00', 'os', 'Auto Peças — Carga de gás', '', 'route'],
  ['2026-09-25', '14:00', 'os', 'Alvorada — Preventiva', '', 'open'],
  ['2026-09-26', '09:00', 'hub', 'AuvoHub — Studio Nine', 'main', 'open'],
  ['2026-09-28', '08:30', 'os', 'Alvorada — Corretiva', '', 'open'],
  ['2026-09-29', '10:00', 'os', 'Trigo Bom — Preventiva', '', 'open'],
  ['2026-09-29', '14:00', 'fin', 'Cobrança — Clínica VidaPlena', '', 'open'],
  ['2026-09-30', '09:00', 'pmoc', 'PMOC — Hotel Alvorada', '', 'open'],
  ['2026-10-01', '09:00', 'desk', 'Ticket #0251 — Visita', '', 'open'],
  ['2026-10-02', '10:30', 'os', 'VidaPlena — Preventiva', '', 'open'],
];

// ------------------------------------------------------------
// Páginas de lista (o miolo é gerado por listPage em app.js).
// Células "{ok}Texto" viram chip colorido (ok, warn, bad, info, mute).
// ------------------------------------------------------------
const LISTS = {
  projetos: {
    route: 'ordemServico', menu: 'op', title: 'Projetos', btns: ['Download', 'Mais ações', '+ Novo Projeto', 'Filtrar'],
    kpis: [['Em atraso', '3', '#e11d48'], ['Visitas no dia', '4', '#0ea5e9'], ['Aguardando cobrança', '5', '#f59e0b'], ['Aguardando pagamento', '2', '#0ea5e9'], ['Pagos', '11', '#16a34a']],
    cols: ['Código', 'Cliente', 'Descrição', 'Primeira visita', 'Última visita', 'Status das visitas', 'Valor', 'Status'],
    rows: [
      ['41', CLI.bv, 'Contrato de manutenção preventiva', '02/01/2026', '18/12/2026', '9 finalizadas · 3 agendadas', 'R$ 10.680,00', '{info}Em andamento'],
      ['40', CLI.sh, 'Instalação de chiller', '10/08/2026', '30/09/2026', '6 finalizadas · 2 agendadas', 'R$ 18.500,00', '{warn}Aguardando cobrança'],
      ['39', CLI.cv, 'Contrato de manutenção mensal', '05/01/2026', '15/12/2026', '8 finalizadas · 4 agendadas', 'R$ 17.760,00', '{info}Em andamento'],
      ['38', CLI.sn, 'Instalação de 3 splits', '01/09/2026', '01/09/2026', '1 finalizada', 'R$ 4.200,00', '{ok}Pago'],
      ['37', CLI.ha, 'Preventiva — 22 apartamentos', '11/09/2026', '20/10/2026', '3 finalizadas · 5 agendadas', 'R$ 6.380,00', '{info}Em andamento'],
    ],
  },
  orcamentos: {
    route: 'Orcamentos', menu: 'op', title: 'Orçamentos', btns: ['Repor estoque', 'Filtrar', 'Download', 'Mais ações', '+ Adicionar orçamento', 'Lista', 'Kanban'],
    tabs: ['Todos · 9', 'Aguardando Ordem de Compra · 2', 'Prioridade Alta · 1', 'Em confecção · 3', 'Entregues · 2', 'Cancelados · 1'],
    cols: ['Código', 'Cliente', 'Valor', 'Solicitado em', 'Expira em', 'Responsável', 'Status de aprovação'],
    rows: [
      ['57', CLI.bv, 'R$ 890,00', '22/09/2026', '06/10/2026', 'Carlos Mendes', '{ok}Aprovado'],
      ['56', CLI.sn, 'R$ 1.350,00', '18/09/2026', '02/10/2026', 'Juliana Prado', '{warn}Aguardando cliente'],
      ['55', CLI.ap, 'R$ 2.980,00', '15/09/2026', '29/09/2026', 'Rafael Souza', '{info}Em confecção'],
      ['54', CLI.sh, 'R$ 18.500,00', '02/08/2026', '16/08/2026', 'Carlos Mendes', '{ok}Aprovado'],
      ['53', CLI.pt, 'R$ 720,00', '01/09/2026', '15/09/2026', 'Juliana Prado', '{bad}Recusado'],
    ],
  },
  clientes: {
    route: 'gerenciarClientes', menu: 'cad', title: 'Gerenciar clientes', btns: ['Filtros', 'Mais ações', '+ Adicionar cliente'],
    cols: ['Cliente', 'Endereço', 'Telefone', 'Responsável', 'Última visita', 'Status'],
    rows: [
      [CLI.bv, 'Rua das Acácias, 120 — Goiânia/GO', '(62) 3555-0101', 'Marcos Tavares (síndico)', '25/09/2026', '{ok}Ativo'],
      [CLI.sn, 'Av. T-9, 850 — Goiânia/GO', '(62) 3555-0102', 'Larissa Nunes', '08/09/2026', '{ok}Ativo'],
      [CLI.ap, 'Rod. GO-040, km 3 — Aparecida/GO', '(62) 3555-0103', 'Henrique Sul', '03/09/2026', '{ok}Ativo'],
      [CLI.sh, 'Av. Brasil, 2000 — Goiânia/GO', '(62) 3555-0104', 'Paula Dias (facilities)', '04/09/2026', '{ok}Ativo'],
      [CLI.cv, 'Rua 15, 45 — Goiânia/GO', '(62) 3555-0105', 'Dra. Helena Cruz', '14/09/2026', '{ok}Ativo'],
      [CLI.pt, 'Rua 7, 300 — Goiânia/GO', '(62) 3555-0106', 'Seu Álvaro', '29/09/2026', '{mute}Inativo'],
    ],
  },
  colaboradores: {
    route: 'gerenciarColaboradores', menu: 'cad', title: 'Gerenciar colaboradores', btns: ['Exportar usuários', '+ Adicionar colaborador', 'Filtros'],
    cols: ['Nome', 'Telefone/Login', 'Cargo', 'Tipo de usuário', 'Check in'],
    rows: [
      ['Fernanda Rocha', 'fernanda.rocha', 'Gestora de operações', 'Administrador principal', 'Manual'],
      ['Carlos Mendes', 'carlos.mendes', 'Técnico de refrigeração', 'Usuário', 'Automático'],
      ['Juliana Prado', 'juliana.prado', 'Técnica de refrigeração', 'Usuário', 'Automático'],
      ['Rafael Souza', 'rafael.souza', 'Técnico de refrigeração', 'Usuário', 'Automático'],
      ['Marcos Lima', 'marcos.lima', 'Supervisor', 'Gestor de equipe', 'Manual'],
    ],
  },
  equipes: { route: 'gerenciarEquipes', menu: 'cad', title: 'Gerenciar equipes', btns: ['+ Adicionar equipe'], cols: ['Descrição', 'Remover'], rows: [['Manutenção preventiva', '✕'], ['Instalação', '✕'], ['PMOC e laudos', '✕']] },
  tiposdespesa: { route: 'gerenciarTipoDeDespesa', menu: 'cad', title: 'Tipos de despesas', btns: ['+ Adicionar tipo'], cols: ['Tipo de despesa', 'Remover'], rows: [['Combustível', '✕'], ['Alimentação', '✕'], ['Pedágio', '✕'], ['Peças e materiais', '✕']] },
  grupos: { route: 'gerenciarGruposClientes', menu: 'cad', title: 'Grupos de clientes', btns: ['+ Adicionar grupo'], cols: ['Grupo', 'Remover'], rows: [['Contrato mensal', '✕'], ['Avulso', '✕'], ['Corporativo', '✕']] },
  fornecedores: {
    route: 'fornecedores', menu: 'cad', title: 'Gerenciar fornecedores', btns: ['Filtros', 'Mais ações', '+ Adicionar fornecedor'],
    cols: ['Fornecedor', 'CPF/CNPJ', 'Telefone', 'E-mail', 'Status'],
    rows: [['Refrio Peças Ltda', '12.345.678/0001-90', '(62) 3555-0201', 'vendas@refriopecas.example', '{ok}Ativo'], ['Gás & Cia Distribuidora', '98.765.432/0001-10', '(62) 3555-0202', 'contato@gasecia.example', '{ok}Ativo']],
  },
  segmentos: { route: 'gerenciarSegmentos', menu: 'cad', title: 'Segmentos', btns: ['+ Adicionar segmento'], cols: ['Segmento', 'Remover'], rows: [['Condomínios', '✕'], ['Saúde', '✕'], ['Varejo', '✕'], ['Hotelaria', '✕']] },
  equipamentos: {
    route: 'gerenciarEquipamentos', menu: 'cad', title: 'Equipamentos', btns: ['Comprar peças', 'Categorias', 'Filtros', 'Mais ações', '+ Adicionar equipamento'],
    cols: ['Nome', 'Identificador', 'Associação', 'Categoria', 'Garantia até', 'Status'],
    rows: [
      ['Ar-condicionado central York 30 TR', 'YK-3009', CLI.bv, 'Central', '10/03/2028', '{ok}Ativo'],
      ['Split Inverter 18000 BTUs Gree', 'GR-18-0041', CLI.sn, 'Split', '10/12/2027', '{ok}Ativo'],
      ['Chiller 60 TR Carrier', 'CH-2210', CLI.sh, 'Chiller', 'Indefinido', '{ok}Ativo'],
      ['Câmara fria 12 m³', 'CF-0012', CLI.pt, 'Refrigeração', '01/06/2026', '{warn}Garantia vencida'],
      ['Split cassete 36000 BTUs', 'SC-36-0007', CLI.cv, 'Split', '20/10/2027', '{ok}Ativo'],
    ],
  },
  produtos: {
    route: 'gerenciarProdutos', menu: 'cad', title: 'Produtos', btns: ['Repor estoque', 'Categorias', 'Filtro', 'Mais ações', '+ Adicionar produto'],
    cols: ['Nome', 'Estoque mínimo', 'Estoque', 'Valor unitário R$'],
    rows: [['Filtro G4 (unid.)', '10', '42', 'R$ 80,00'], ['Gás R-410A (kg)', '5', '18', 'R$ 145,00'], ['Capacitor 35µF', '4', '9', 'R$ 38,50'], ['Correia dentada B-52', '2', '6', 'R$ 64,00'], ['Tubo de cobre 1/4" (m)', '20', '85', 'R$ 22,00']],
  },
  servicos: {
    route: 'servico', menu: 'cad', title: 'Serviços', btns: ['Template de observação', 'Mais Ações', '+ Adicionar serviço'],
    cols: ['Serviço', 'Status', 'Remover'],
    rows: [['Manutenção preventiva — ar-condicionado central', '{ok}Ativo', '✕'], ['Instalação de split', '{ok}Ativo', '✕'], ['Higienização de split', '{ok}Ativo', '✕'], ['Carga de gás', '{ok}Ativo', '✕'], ['Deslocamento', '{ok}Ativo', '✕']],
  },
  pmoc: {
    route: 'gerenciarpmoc', menu: 'cad', title: 'Plano de Manutenção, Operação e Controle', btns: ['Cadastros removidos', '+ Novo PMOC', 'Filtro'], hl: 0,
    cols: ['Código do PMOC', 'Cliente', 'Período de vigência', 'Responsável técnico', 'Nº de equipamentos', 'Data de criação', 'Status'],
    rows: [
      ['1', CLI.bv, '02/01/2026 até 02/01/2027', 'Carlos Mendes', '6', '02/01/2026', '{ok}Em dia'],
      ['2', CLI.ap, '18/11/2025 até 18/11/2026', 'Juliana Prado', '2', '18/11/2025', '{ok}Em dia'],
      ['3', CLI.sh, '05/09/2025 até 05/09/2026', 'Rafael Souza', '11', '05/09/2025', '{bad}Vencido'],
      ['4', CLI.cv, '20/10/2025 até 20/10/2026', 'Juliana Prado', '4', '20/10/2025', '{warn}Vence em 25 dias'],
      ['5', CLI.ha, '14/03/2026 até 14/03/2027', 'Carlos Mendes', '22', '14/03/2026', '{ok}Em dia'],
    ],
  },
  formaspgto: { route: 'formasPagamentos', menu: 'cad', title: 'Formas de pagamentos', btns: ['+ Adicionar forma'], cols: ['Forma de pagamento', 'Remover'], rows: [['Pix', '✕'], ['Boleto', '✕'], ['Cartão de crédito', '✕'], ['Transferência', '✕']] },
  tipostarefa: {
    route: 'gerenciarTipoDeTarefa', menu: 'cad', title: 'Gerenciar tipos de tarefa', btns: ['+ Adicionar tipo de tarefa'],
    cols: ['Código', 'Tipo de tarefa', 'Remover'],
    rows: [['1001', 'Manutenção preventiva', '✕'], ['1002', 'Manutenção corretiva', '✕'], ['1003', 'Instalação', '✕'], ['1004', 'Inspeção PMOC', '✕'], ['1005', 'Visita técnica', '✕']],
  },
  questionarios: {
    route: 'gerenciarQuestionarios', menu: 'cad', title: 'Gerenciar questionários', btns: ['Importar por planilha', '+ Adicionar questionário'],
    cols: ['Questionário', 'Remover', 'Duplicar'],
    rows: [['Checklist — Preventiva de split', '✕', '⧉'], ['Checklist — Chiller', '✕', '⧉'], ['PMOC — Inspeção mensal', '✕', '⧉'], ['Manutenção corretiva', '✕', '⧉'], ['Despesas', '✕', '⧉']],
  },
  tags: { route: 'gerenciarTags', menu: 'cad', title: 'Palavras-chave', btns: ['+ Adicionar palavra-chave'], cols: ['Palavra-chave', 'Remover'], rows: [['Urgente', '✕'], ['Contrato mensal', '✕'], ['Garantia', '✕'], ['Hospitalar', '✕']] },
  pesquisa: {
    route: 'gerenciarPesquisaSatisfacao', menu: 'cad', title: 'Pesquisa de Satisfação', btns: ['Visualizar formulário', 'Salvar'], search: false,
    cols: ['Pergunta', 'Tipo', 'Obrigatória'],
    rows: [['1. Como você avalia o atendimento?', 'Múltipla escolha (1 a 5)', '{ok}Sim'], ['2. O técnico foi pontual?', 'Múltipla escolha', '{ok}Sim'], ['3. Você recomendaria a Frio Total?', 'Múltipla escolha (1 a 5)', '{mute}Não']],
  },
  motivopausa: { route: 'MotivoPausaTarefa', menu: 'cad', title: 'Motivo de pausa', btns: ['+ Adicionar motivo'], cols: ['Motivo', 'Remover'], rows: [['Almoço', '✕'], ['Aguardando peça', '✕'], ['Cliente ausente', '✕'], ['Trânsito', '✕']] },

  faturas: {
    route: 'faturas', menu: 'fin', title: 'Faturas', btns: ['Download', '+ Nova Fatura', 'Filtrar', 'Ações em massa'],
    cols: ['Código', 'Assunto', 'Cliente', 'Valor', 'Vencimento', 'Status'],
    rows: [
      ['1042', 'Serviços prestados à Tarefa #80412', CLI.bv, 'R$ 890,00', '25/09/2026', '{warn}Aguardando pagamento'],
      ['1041', 'Contrato mensal — setembro', CLI.sn, 'R$ 690,00', '10/09/2026', '{ok}Pago'],
      ['1040', 'Serviços prestados à Tarefa #80388', CLI.ap, 'R$ 1.240,00', '23/09/2026', '{ok}Pago'],
      ['1039', 'Instalação de chiller', CLI.sh, 'R$ 18.500,00', '08/09/2026', '{bad}Em atraso'],
      ['1038', 'Contrato mensal — setembro', CLI.cv, 'R$ 1.480,00', '05/09/2026', '{ok}Pago'],
    ], hl: 0,
  },
  pagar: {
    route: 'contasPagar', menu: 'fin', title: 'Contas a pagar', btns: ['Exportar pagamentos', 'Filtros', '+ Adicionar pagamento'],
    kpis: [['Em atraso', 'R$ 1.200,00', '#e11d48'], ['Vencem hoje', 'R$ 0,00', '#0ea5e9'], ['A vencer', 'R$ 6.480,00', '#f59e0b'], ['Pago no período', 'R$ 12.310,00', '#16a34a']],
    cols: ['Código', 'Credor / Descrição', 'Conta / Categoria', 'Total da conta', 'Falta pagar', 'Vencimento', 'Status'],
    rows: [
      ['31', 'Refrio Peças Ltda — reposição de filtros', 'Banco Inter · Peças', 'R$ 2.380,00', 'R$ 0,00', '22/09/2026', '{ok}Pago'],
      ['30', 'Aluguel do galpão', 'Banco Itaú · Aluguel', 'R$ 3.400,00', 'R$ 3.400,00', '30/09/2026', '{info}A vencer'],
      ['29', 'Gás & Cia — cilindros R-410A', 'Banco Inter · Peças', 'R$ 1.200,00', 'R$ 1.200,00', '15/09/2026', '{bad}Em atraso'],
      ['28', 'Combustível da frota', 'Caixa interno · Combustível', 'R$ 1.880,00', 'R$ 1.880,00', '02/10/2026', '{info}A vencer'],
    ],
  },
  receber: {
    route: 'contasReceber', menu: 'fin', title: 'Contas a receber', btns: ['Exportar recebimentos', 'Filtros', '+ Adicionar recebimento'],
    kpis: [['Em atraso', 'R$ 18.500,00', '#e11d48'], ['Vencem hoje', 'R$ 890,00', '#0ea5e9'], ['A receber', 'R$ 41.020,00', '#f59e0b'], ['Recebidos', 'R$ 52.310,00', '#16a34a']],
    cols: ['Código', 'Cliente / Descrição', 'Conta / Categoria', 'Total', 'Tarifa', 'A receber', 'Vencimento', 'Status'],
    rows: [
      ['210', CLI.bv + ' — Fatura #1042', 'Banco Inter · Serviços', 'R$ 890,00', 'R$ 1,25', 'R$ 888,75', '25/09/2026', '{info}Vence hoje'],
      ['209', CLI.sh + ' — Fatura #1039', 'Banco Itaú · Serviços', 'R$ 18.500,00', 'R$ 0,00', 'R$ 18.500,00', '08/09/2026', '{bad}Em atraso'],
      ['208', CLI.sn + ' — Contrato mensal', 'Banco Inter · Contratos', 'R$ 690,00', 'R$ 1,25', 'R$ 0,00', '10/09/2026', '{ok}Recebido'],
      ['207', CLI.cv + ' — Contrato mensal', 'Banco Inter · Contratos', 'R$ 1.480,00', 'R$ 1,99', 'R$ 0,00', '05/09/2026', '{ok}Recebido'],
    ],
  },
  nf: {
    route: 'notafiscal', menu: 'fin', title: 'Notas Fiscais', btns: ['Mais ações', 'Filtros', '+ Adicionar Nota Fiscal'],
    kpis: [['Todas', '14', '#7c3aed'], ['Pendente de envio', '1', '#f59e0b'], ['Em transmissão', '0', '#0ea5e9'], ['Emitida', '12', '#16a34a'], ['Erro na transmissão', '1', '#e11d48']],
    cols: ['Cliente', 'Data de emissão', 'Valor', 'Status'],
    rows: [[CLI.bv, '25/09/2026', 'R$ 890,00', '{warn}Pendente de envio'], [CLI.ap, '23/09/2026', 'R$ 1.240,00', '{ok}Emitida'], [CLI.sn, '10/09/2026', 'R$ 690,00', '{ok}Emitida'], [CLI.sh, '08/09/2026', 'R$ 18.500,00', '{bad}Erro na transmissão']],
  },
  bancos: {
    route: 'contasBancarias', menu: 'fin', title: 'Bancos e Conciliações', btns: ['+ Adicionar conta'],
    cols: ['Descrição', 'Tipo de conta', 'Saldo no Auvo'],
    rows: [['Banco Inter', 'Corrente', 'R$ 31.480,00'], ['Banco Itaú', 'Corrente', 'R$ 11.550,00'], ['Caixa interno', 'Caixinha', 'R$ 1.200,00']],
  },
  categorias: { route: 'categoriasContas', menu: 'fin', title: 'Categorias', btns: ['+ Adicionar categoria'], cols: ['Categoria', 'Tipo'], rows: [['Serviços prestados', '{ok}Receita'], ['Contratos mensais', '{ok}Receita'], ['Peças', '{bad}Despesa'], ['Combustível', '{bad}Despesa'], ['Aluguel', '{bad}Despesa']] },
  contratos: {
    route: 'contratos', menu: 'fin', title: 'Gerenciar contratos', btns: ['Filtros', '+ Adicionar contrato', 'Ações em massa'],
    cols: ['Código', 'Cliente', 'Valor', 'Situação financeira', 'SLA', 'Início', 'Encerramento'],
    rows: [
      ['12', CLI.bv, 'R$ 890,00', '{ok}Em dia', '04h00min', '02/01/2026', '02/01/2027'],
      ['11', CLI.sn, 'R$ 690,00', '{ok}Em dia', '08h00min', '10/03/2026', '10/03/2027'],
      ['10', CLI.cv, 'R$ 1.480,00', '{ok}Em dia', '02h00min', '20/10/2025', '20/10/2026'],
      ['9', CLI.ha, 'R$ 2.150,00', '{warn}Reajustado', '04h00min', '14/03/2026', '14/03/2027'],
    ],
  },
  compras: {
    route: 'compras', menu: 'fin', title: 'Compras', btns: ['Importar XML de compra', '+ Nova Compra', 'Filtrar'],
    cols: ['Código', 'Descrição', 'Fornecedor', 'Valor', 'Data da entrada'],
    rows: [['88', 'Reposição de filtros e gás', 'Refrio Peças Ltda', 'R$ 2.380,00', '22/09/2026'], ['87', 'Capacitores e correias', 'Refrio Peças Ltda', 'R$ 640,00', '10/09/2026']],
  },

  dashboard: {
    route: 'dashboard', menu: 'rel', title: 'Dashboard', btns: ['Filtros'],
    kpis: [['Produtividade no período', '94%', '#16a34a'], ['Média de tempo em atividades', '01:12h', '#7c3aed'], ['Média de atraso nas visitas', '00:08h', '#f59e0b'], ['Custo médio de tarefas', 'R$ 214,00', '#0ea5e9']],
    cols: ['Colaborador', 'Tarefas sem agendamento', 'Finalizadas', 'Não finalizadas', 'Atraso médio', 'Tempo médio de atendimento'],
    rows: [['Carlos Mendes', '2', '74', '3', '00:06:10', '01:08:40'], ['Juliana Prado', '1', '68', '2', '00:04:52', '01:15:03'], ['Rafael Souza', '4', '51', '6', '00:14:20', '01:21:30']],
  },
  tarefas: {
    route: 'relatorioTarefas', menu: 'rel', title: 'Relatório de tarefas', btns: ['Visualizar relatório', 'Download', 'Filtros'],
    kpis: [['Total', '128', '#7c3aed'], ['Abertas', '19', '#0ea5e9'], ['Pendentes', '7', '#f59e0b'], ['Finalizadas', '102', '#16a34a']],
    cols: ['Tarefa', 'Cliente', 'Colaborador', 'Data', 'Status'],
    rows: [['#80412 Manutenção corretiva', CLI.bv, 'Carlos Mendes', '25/09/2026 08:30', '{warn}Finalizada com pendência'], ['#80398 Higienização de split', CLI.sn, 'Juliana Prado', '22/09/2026 15:00', '{ok}Finalizada'], ['#80388 Carga de gás', CLI.ap, 'Rafael Souza', '23/09/2026 10:00', '{ok}Finalizada'], ['#80371 Ronda chiller', CLI.sh, 'Rafael Souza', '21/09/2026 08:00', '{ok}Finalizada']],
  },
  questrel: { route: 'relatorioQuestionario', menu: 'rel', title: 'Relatório de questionário', btns: ['Download'], cols: ['Questionário', 'Respostas', 'Última resposta'], rows: [['Checklist — Preventiva de split', '86', '25/09/2026'], ['PMOC — Inspeção mensal', '41', '24/09/2026'], ['Checklist — Chiller', '17', '21/09/2026']] },
  km: {
    route: 'kmRodado', menu: 'rel', title: 'Relatório de Km rodado', btns: ['Filtros'],
    kpis: [['Valor do km', 'R$ 0,90', '#7c3aed'], ['Total no período', '2.146 km', '#0ea5e9'], ['Custo estimado', 'R$ 1.931,40', '#f59e0b']],
    cols: ['Colaborador', 'Km rodado', 'Valor'], rows: [['Carlos Mendes', '812 km', 'R$ 730,80'], ['Juliana Prado', '694 km', 'R$ 624,60'], ['Rafael Souza', '640 km', 'R$ 576,00']],
  },
  despesas: { route: 'relatoriodespesas', menu: 'rel', title: 'Relatório de despesas', btns: ['Gerar Conta a Pagar', '+ Adicionar despesa', 'Download', 'Filtros'], cols: ['Colaborador', 'Tipo', 'Data da despesa', 'Valor', 'Descrição'], rows: [['Carlos Mendes', 'Combustível', '24/09/2026', 'R$ 220,00', 'Abastecimento — Bela Vista'], ['Juliana Prado', 'Alimentação', '22/09/2026', 'R$ 38,00', 'Almoço em campo'], ['Rafael Souza', 'Pedágio', '21/09/2026', 'R$ 17,40', 'GO-040']] },
  satisf: {
    route: 'relatorioPesquisaSatisfacao', menu: 'rel', title: 'Relatório de pesquisa', btns: ['Download planilha', 'Filtros'],
    kpis: [['Avaliações enviadas', '64', '#7c3aed'], ['Respondidas', '41', '#0ea5e9'], ['Nota média', '4,8', '#16a34a']],
    cols: ['Cliente', 'Nota', 'Comentário'], rows: [[CLI.bv, '★★★★★', 'Chegou no horário e explicou tudo.'], [CLI.sn, '★★★★★', 'Silencioso e rápido.'], [CLI.ap, '★★★★☆', 'Ficou bom, só atrasou 20 min.']],
  },
  monitor: {
    route: 'monitoramento', menu: 'rel', title: 'Relatório monitoramento', btns: ['Download planilha', 'Filtros'],
    cols: ['Colaborador', 'Data', 'GPS', 'Internet', 'Bateria', 'Versão do aplicativo'],
    rows: [['Carlos Mendes', '25/09/2026 às 08:41', '{ok}Alta precisão', '{ok}Conectado', '78%', '2.5.5'], ['Juliana Prado', '25/09/2026 às 08:37', '{ok}Alta precisão', '{ok}Conectado', '54%', '2.5.5'], ['Rafael Souza', '24/09/2026 às 17:12', '{warn}Média precisão', '{warn}4G fraco', '19%', '2.5.4']],
  },
  apontamento: {
    route: 'apontamentoDeHoras', menu: 'rel', title: 'Apontamento de Horas', btns: ['Exportar Excel', 'Filtros'],
    kpis: [['Em deslocamento', '12:40h', '#0ea5e9'], ['Tempo total em pausa', '06:05h', '#f59e0b'], ['Em execução', '148:20h', '#7c3aed'], ['Tempo total de trabalho', '142:15h', '#16a34a']],
    cols: ['Colaborador', 'Deslocamento', 'Pausa', 'Execução', 'Trabalho total'], rows: [['Carlos Mendes', '04:50h', '02:10h', '52:30h', '50:20h'], ['Juliana Prado', '03:55h', '01:45h', '48:10h', '46:25h'], ['Rafael Souza', '03:55h', '02:10h', '47:40h', '45:30h']],
  },
  downloads: { route: 'centralDownload', menu: 'rel', title: 'Central de downloads', btns: [], search: false, cols: ['Relatório', 'Solicitado em', 'Status', 'Ação'], rows: [['Relatório de tarefas', '25/09/2026 08:02', '{ok}Finalizado', '⬇ Download'], ['Km rodado', '24/09/2026 17:40', '{ok}Finalizado', '⬇ Download'], ['Apontamento de horas', '25/09/2026 09:15', '{info}Em andamento', '—']] },
  equiprel: {
    route: 'equipamentos', menu: 'rel', title: 'Equipamentos', btns: ['Lista', 'Dashboard', 'Exportar', 'Filtros'],
    kpis: [['Previstos', '148', '#7c3aed'], ['Atendidos', '121', '#16a34a'], ['Parcial', '9', '#f59e0b'], ['Não atendidos', '18', '#e11d48'], ['Taxa de conclusão', '81,8%', '#0ea5e9']],
    cols: ['Colaborador', 'Previstos', 'Atendidos', 'Taxa'], rows: [['Carlos Mendes', '54', '47', '87,0%'], ['Juliana Prado', '49', '41', '83,7%'], ['Rafael Souza', '45', '33', '73,3%']],
  },

  // AuvoDesk (app separado)
  dclientes: { app: 'desk', route: 'Clientes', dmenu: 'Cadastros', title: 'Clientes', btns: ['+ Novo cliente'], cols: ['Cliente', 'Grupo', 'E-mail', 'Tickets abertos'], rows: [[CLI.bv, 'Contrato mensal', 'sindico@belavista.example', '1'], [CLI.sn, 'Contrato mensal', 'larissa@studionine.example', '0'], [CLI.sh, 'Corporativo', 'facilities@shoppingrc.example', '2']] },
};

// menus do topo (Auvo core) — rótulos iguais ao app real
const MENUS = [
  { id: 'op', label: 'Operação', items: [['agenda', 'Agenda'], ['projetos', 'Projetos'], ['mapa', 'Mapa'], ['orcamentos', 'Orçamentos']] },
  { id: 'cad', label: 'Cadastros', cols: [
    ['Colaboradores', [['equipes', 'Equipes'], ['colaboradores', 'Colaboradores'], ['tiposdespesa', 'Tipos de despesas']]],
    ['Clientes e fornecedores', [['clientes', 'Clientes'], ['grupos', 'Grupos de clientes'], ['fornecedores', 'Fornecedores'], ['segmentos', 'Segmentos']]],
    ['Inventários e serviços', [['equipamentos', 'Equipamentos'], ['produtos', 'Produtos'], ['servicos', 'Serviços'], ['pmoc', 'PMOC'], ['formaspgto', 'Formas de pagamentos']]],
    ['Tarefas', [['tipostarefa', 'Tipos de tarefas'], ['questionarios', 'Questionários'], ['tags', 'Palavras-chave'], ['pesquisa', 'Pesquisa satisfação'], ['motivopausa', 'Motivo de pausa']]],
  ] },
  { id: 'fin', label: 'Financeiro', items: [['auvopay', 'AuvoPay'], ['fluxo', 'Fluxo de Caixa'], ['faturas', 'Faturas'], ['pagar', 'Contas a pagar'], ['receber', 'Contas a receber'], ['nf', 'Notas Fiscais'], ['bancos', 'Bancos e Conciliações'], ['categorias', 'Categorias'], ['contratos', 'Contratos'], ['compras', 'Compras']] },
  { id: 'rel', label: 'Relatórios', items: [['dashboard', 'Dashboard'], ['dashfin', 'Dashboard financeira'], ['tarefas', 'Tarefas'], ['questrel', 'Questionários'], ['km', 'Km rodado'], ['despesas', 'Despesas'], ['satisf', 'Pesquisa satisfação'], ['monitor', 'Monitoramento'], ['apontamento', 'Apontamento de horas'], ['downloads', 'Central de downloads'], ['equiprel', 'Equipamentos']] },
];

// ------------------------------------------------------------
// Dados comerciais. Prova social e garantias foram copiadas das páginas
// oficiais em auvo.com (setembro de 2026); nada aqui é inventado.
// O WhatsApp é o mesmo usado no tour do AuvoHub.
// ------------------------------------------------------------
const SALES = {
  proof: [['+6 mil', 'empresas clientes'], ['+80 mil', 'usuários ativos'], ['16', 'países'], ['4,7', 'nota no Google']],
  proofSrc: 'Números publicados em auvo.com',
  trust: ['Apresentação 100% gratuita', 'Sem pagamento inicial ou compromisso', 'Treinamento personalizado para a sua equipe'],
  demoBase: 'https://www.auvo.com/demonstracao-gratis',
  waNumber: '5562981522273',
};
function demoUrl(content) {
  const q = new URLSearchParams({ utm_source: 'tour-auvo', utm_medium: 'tour-interativo', utm_campaign: 'tour-auvo', utm_content: content || 'geral' });
  return SALES.demoBase + '?' + q.toString();
}
