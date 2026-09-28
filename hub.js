// ============================================================
// AuvoHub nativo: mesmo tratamento do AuvoDesk (outro "sistema" dentro do mesmo palco),
// sem iframe, sem tela borrada e sem recarregar a demonstração.
// Cenário: no tour guiado, a conversa do Marcos (Bela Vista) abre a história e vira o ticket #0250.
// No modo explorar, cada conversa gera o próprio ticket, tarefa ou orçamento (a da Larissa vira o #0252).
// ============================================================
const HUB_NAV = [
  ['Atendimentos', [['hubapp', 'Inbox']]],
  ['Marketing e vendas', [['hub_pipelines', 'Pipelines'], ['hub_contatos', 'Contatos'], ['hub_atividades', 'Atividades'], ['hub_automacao', 'Automação CRM'], ['hub_carteira', 'Carteirização'], ['hub_campanhas', 'Campanhas']]],
  ['Automação', [['hub_workflow', 'WorkFlow'], ['hub_ia', 'Inteligência Artificial'], ['hub_alerts', 'AuvoAlerts']]],
  ['Relatórios', [['hub_atend', 'Atendimento']]],
];
const HUB_ROUTE = { hubapp: 'inbox', hub_pipelines: 'crm', hub_contatos: 'crm/contacts', hub_atividades: 'crm/atividades', hub_automacao: 'crm/automations', hub_carteira: 'crm/portfolio', hub_campanhas: 'apps/campaigns', hub_workflow: 'apps/chatbot', hub_ia: 'apps/ai-agents', hub_alerts: 'settings/notifications', hub_atend: 'reports/attendance' };

const HI = {
  chat: '<path d="M4 5h16v11H9l-4 3v-3H4z"/>',
  columns: '<rect x="3" y="4" width="5" height="16" rx="1.2"/><rect x="9.5" y="4" width="5" height="16" rx="1.2"/><rect x="16" y="4" width="5" height="16" rx="1.2"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-2.4-4.5"/>',
  check: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  bolt: '<path d="M13 3 5 13h5l-1 8 8-11h-5z"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M16 12h3"/><path d="M3 9h13a2 2 0 0 1 2 2"/>',
  send: '<path d="M4 12 20 4l-6 16-2.5-6.5z"/>',
  flow: '<rect x="3" y="4" width="6" height="4.5" rx="1.4"/><rect x="15" y="15.5" width="6" height="4.5" rx="1.4"/><rect x="9" y="9.8" width="6" height="4.4" rx="1.4"/><path d="M9 6.2h3a2 2 0 0 1 2 2v1.6M15 12h1a2 2 0 0 1 2 2v1.5M9 12H8a2 2 0 0 0-2 2v3.5h3"/>',
  sparkle: '<path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9z"/><path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.5 20a2 2 0 0 0 3 0"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7.5" y="12" width="3.2" height="5" rx="1"/><rect x="13" y="8.5" width="3.2" height="8.5" rx="1"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
};
const hic = (n, s = 19) => '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + HI[n] + '</svg>';
const HUB_ICON = { hubapp: 'chat', hub_pipelines: 'columns', hub_contatos: 'users', hub_atividades: 'check', hub_automacao: 'bolt', hub_carteira: 'wallet', hub_campanhas: 'send', hub_workflow: 'flow', hub_ia: 'sparkle', hub_alerts: 'bell', hub_atend: 'chart' };

function hubSide(P) {
  const g = HUB_NAV.map(([t, its]) => '<div class="hg">' + t + '</div>' + its.map(([id, l]) => '<div class="hs' + (P.hubId === id ? ' on' : '') + '" data-go="' + id + '">' + hic(HUB_ICON[id]) + '<span>' + l + '</span></div>').join('')).join('');
  return '<aside class="hubside"><div class="hlg"><span></span><b>Auvo<em>Hub</em></b></div>' + g +
    '<div class="hsf"><div class="hsb" data-go="agenda">' + hic('back', 16) + '<span>Voltar ao Auvo</span></div><div class="hsu"><i>FR</i><div><b>Fernanda Rocha</b><small>Gestora</small></div></div></div></aside>';
}

const av = (n, c, s = 38) => `<i class="hav" style="width:${s}px;height:${s}px;background:${c};font-size:${s * 0.36}px">${n.split(' ').map(w => w[0]).slice(0, 2).join('')}</i>`;
// mensagens: [0 = cliente, 1 = empresa, 2 = aviso do sistema, texto]
const MARCOS_STORY = { key: 'ms', n: 'Marcos Tavares', org: CLI.bv, c: '#7c3aed', m: 'Conseguem mandar alguém amanhã cedo?', t: '16:10', u: 2,
  msgs: [[0, 'Boa tarde! O ar-condicionado do bloco B parou de gelar.'], [0, 'Conseguem mandar alguém amanhã cedo?']] };
const CONVS = [
  { key: 'ln', n: 'Larissa Nunes', org: CLI.sn, c: '#c026d3', m: 'Perfeito, pode ser amanhã cedo?', t: '09:41', u: 2, msgs: [[0, 'Oi! O split da recepção está fazendo barulho. Dá pra agendar uma visita?'], [1, 'Olá, Larissa! Claro. Posso abrir um chamado e já agendar o técnico.'], [0, 'Perfeito, pode ser amanhã cedo?']] },
  { key: 'mt', n: 'Marcos Tavares', org: CLI.bv, c: '#7c3aed', m: 'Ótimo, obrigado pelo aviso!', t: '08:14', u: 0, msgs: [[0, 'Boa tarde! O ar-condicionado do bloco B parou de gelar.'], [0, 'Conseguem mandar alguém amanhã cedo?'], [2, '✓ Ticket #0250 aberto no AuvoDesk · prioridade alta'], [1, 'Recebido, Marcos! Chamado #0250 aberto. Amanhã às 8h30 o Carlos estará aí.'], [2, 'Aviso automático enviado: Carlos está a caminho · chegada às 8h30'], [0, 'Ótimo, obrigado pelo aviso!']] },
  { key: 'hs', n: 'Henrique Sul', org: CLI.ap, c: '#0ea5e9', m: 'Recebi o orçamento, aprovado!', t: '08:55', u: 0, msgs: [[0, 'Recebi o orçamento da carga de gás. Está aprovado!'], [1, 'Perfeito, Henrique. Já geramos a fatura e agendamos a visita.']] },
  { key: 'pd', n: 'Paula Dias', org: CLI.sh, c: '#f59e0b', m: 'Podem confirmar a ronda de sexta?', t: 'Ontem', u: 0, msgs: [[0, 'Podem confirmar a ronda do chiller na sexta?'], [1, 'Confirmado! Rafael Souza passa às 9h.']] },
];
const convList = () => S.mode === 'guided' ? [MARCOS_STORY, CONVS[0], CONVS[2], CONVS[3]] : CONVS;
const convNow = () => { const L = convList(); return L[clamp(S.opts.conv || 0, 0, L.length - 1)]; };
const bub = (me, x, sys) => `<div class="hb2 ${sys ? 'sys' : me ? 'me' : ''}">${x}</div>`;

// o que cada botão "Da conversa" faz em cada conversa: [aviso, página do link, resposta ao cliente]
const HUB_DONE = {};
window.hubStoryReset = () => { delete HUB_DONE.ms; };
const isMarcos = cv => cv.key === 'ms' || cv.key === 'mt';
const HUB_ACT = {
  ticket: cv => isMarcos(cv) ? ['Ticket #0250 aberto no AuvoDesk · prioridade alta', 'dticket', cv.key === 'ms' ? 'Recebido, Marcos! Abri o chamado #0250 e já vamos agendar a visita.' : '']
    : cv.key === 'ln' ? ['Ticket #0252 aberto no AuvoDesk · “Ruído no split da recepção”', 'dtickets'] : ['Ticket aberto no AuvoDesk', 'dtickets'],
  task: cv => isMarcos(cv) ? ['Tarefa #80412 agendada · 25/09 às 08:30 com Carlos Mendes', 'agenda']
    : cv.key === 'ln' ? ['Tarefa #80413 agendada · 26/09 às 09:00 com Juliana Prado', 'agenda'] : ['Tarefa criada e enviada ao técnico', 'agenda'],
  quote: () => ['Orçamento #58 gerado e enviado ao cliente pelo WhatsApp', 'orcamentos'],
};
const HUB_TOAST = { ticket: 'Ticket criado: já aparece no AuvoDesk', task: 'Tarefa criada: já está na agenda do técnico', quote: 'Orçamento enviado ao cliente' };
function actBubbles(cv, k) {
  const [t, pg, reply] = HUB_ACT[k](cv);
  return `<div class="hb2 sys" data-k="${k}">✓ ${t} · <span class="lnk" data-go="${pg}">ver</span></div>${reply ? `<div class="hb2 me late">${reply}</div>` : ''}`;
}

function hubInbox(c) {
  const L = convList(), cv = convNow(), i = L.indexOf(cv);
  const done = [...(HUB_DONE[cv.key] || [])];
  c.innerHTML = `<div class="ph"><h2>Inbox</h2></div><div class="hin"><div class="hcl">${L.map((v, k) => `<div class="hcv${k === i ? ' on' : ''}" data-act="hub-conv" data-i="${k}">${av(v.n, v.c, 42)}<div class="hct"><div><b>${v.n}</b><small>${v.t}</small></div><p>${v.m}</p></div>${v.u ? `<u>${v.u}</u>` : ''}</div>`).join('')}</div>
    <div class="hth"><div class="hthh">${av(cv.n, cv.c, 40)}<div><b>${cv.n}</b><small>${cv.org} · Fila: Suporte · <span style="color:#16a34a">● Online agora</span></small></div><span class="chip info">WhatsApp</span><span class="chip warn">Cliente contrato</span><span class="btoggle">Bot <i></i></span></div>
      <div class="hmsg" id="hmsg">${cv.msgs.map(([t, x]) => bub(t === 1, x, t === 2)).join('')}${done.map(k => actBubbles(cv, k)).join('')}</div>
      <div class="hact"><span>Da conversa:</span><button class="hbtn" data-act="hub-act" data-k="task">Criar tarefa</button><button class="hbtn" data-act="hub-act" data-k="ticket">Abrir ticket</button><button class="hbtn" data-act="hub-act" data-k="quote">Gerar orçamento</button></div>
      <div class="hinp"><div>Escreva uma mensagem…</div><span>➤</span></div></div></div>`;
  c.style.padding = '0 24px 18px';
  requestAnimationFrame(() => { const m = $('#hmsg'); if (m) m.scrollTop = m.scrollHeight; });
}
function hubAct(k) {
  const cv = convNow(), set = HUB_DONE[cv.key] || (HUB_DONE[cv.key] = new Set());
  if (set.has(k)) return;
  set.add(k);
  if (k === 'ticket' && cv.key === 'ln' && !NEW_TK.length) NEW_TK.push(['#0252', 'Ruído no split da recepção', CLI.sn, '25/09/2026 09:42', 'Não atribuído', '{info}Novo', 'Média', '8h restantes', '']);
  const m = $('#hmsg'); if (m) { m.insertAdjacentHTML('beforeend', actBubbles(cv, k)); makeFocusable(); m.scrollTop = m.scrollHeight; }
  toast(HUB_TOAST[k]);
}

function hubPipelines(c) {
  const cols = [['Novo', '#64748b', [['Clínica VidaPlena', 'Contrato PMOC', 'R$ 14.800']]], ['Em análise', '#0ea5e9', [['Padaria Trigo Bom', 'Câmara fria', 'R$ 8.900'], [CLI.ap, 'Manutenção mensal', 'R$ 3.200']]], ['Proposta', '#a855f7', [['Hotel Alvorada', 'PMOC 22 apartamentos', 'R$ 26.400', 1], [CLI.sn, 'Contrato mensal', 'R$ 690']]], ['Negociação', '#f59e0b', [[CLI.sh, 'Renovação do chiller', 'R$ 41.000']]], ['Fechado', '#22c55e', [[CLI.bv, 'Contrato preventivo', 'R$ 10.680']]]];
  c.innerHTML = `<div class="ph"><h2>Pipelines</h2><div class="hchips"><span class="on">Frio Total · Comercial</span><span>Pós-venda</span><span>Renovações</span></div><div class="pa"><span class="btn" data-act="soon">Kanban · Funil</span><span class="btn pri" data-act="soon">+ Novo negócio</span></div></div>
    <div class="hkan">${cols.map(([t, col, cs]) => `<div class="hkc"><div class="hkh"><i style="background:${col}"></i><b>${t}</b><u>${cs.length}</u></div>${cs.map(([n, d, v, hot]) => `<div class="hkd${hot ? ' hotc' : ''}" data-act="soon"><b>${n}</b><small>${d}</small><div>${av(n, col, 24)}<strong style="color:${col}">${v}</strong></div></div>`).join('')}</div>`).join('')}</div>`;
}

const CONTS = [[CLI.bv, 'Marcos Tavares', 'Síndico', 'marcos@belavista.example', '(62) 99555-0101', '#7c3aed'], [CLI.sn, 'Larissa Nunes', 'Proprietária', 'larissa@studionine.example', '(62) 99555-0102', '#c026d3'], [CLI.ap, 'Henrique Sul', 'Diretor', 'henrique@autopecassul.example', '(62) 99555-0103', '#0ea5e9'], [CLI.sh, 'Paula Dias', 'Facilities', 'paula@shoppingrc.example', '(62) 99555-0104', '#f59e0b'], [CLI.cv, 'Dra. Helena Cruz', 'Sócia', 'helena@vidaplena.example', '(62) 99555-0105', '#22c55e']];
function hubContatos(c) {
  const i = S.opts.contact || 0, x = CONTS[i];
  c.innerHTML = `<div class="ph"><h2>Contatos</h2><div class="pa"><span class="btn" data-act="soon">Importar</span><span class="btn pri" data-act="soon">+ Novo contato</span></div></div>
    <div class="hcont"><div class="card tc" style="flex:1"><div class="srch">Buscar cliente ou empresa…</div>${CONTS.map((k, n) => `<div class="hcr${n === i ? ' on' : ''}" data-act="hub-contact" data-i="${n}">${av(k[1], k[5], 40)}<div><b>${k[1]}</b><small>${k[0]}</small></div><span class="chip ${n % 2 ? 'info' : 'ok'}">${n % 2 ? 'Lead' : 'Cliente'}</span></div>`).join('')}</div>
    <div class="card hdt">${av(x[1], x[5], 72)}<h3>${x[1]}</h3><small>${x[0]} · ${x[2]}</small>${[['E-mail', x[3]], ['Telefone', x[4]], ['Origem', 'WhatsApp'], ['Contrato', 'Mensal']].map(([a, b]) => `<div class="hdr"><span>${a}</span><b>${b}</b></div>`).join('')}</div></div>`;
}

function hubWorkflow(c) {
  const nodes = [['Início', 'Cliente envia mensagem no WhatsApp', '#7c3aed'], ['Bot de menu', '1 · Suporte   2 · Orçamento   3 · Financeiro', '#0ea5e9'], ['IA identifica o cliente', 'Consulta o cadastro no Auvo', '#a855f7'], ['Abre ticket', 'Cria o chamado no AuvoDesk', '#16a34a'], ['Avisa o técnico', 'Notifica no aplicativo e no WhatsApp', '#f59e0b']];
  c.innerHTML = `<div class="ph"><h2>WorkFlow</h2><span class="chip ok">Publicado</span><div class="pa"><span class="btn" data-act="soon">Testar fluxo</span><span class="btn pri" data-act="soon">Editar</span></div></div>
    <div class="hflow">${nodes.map(([t, d, col], k) => `<div class="hnode" data-act="soon" style="border-top-color:${col}"><small>Passo ${k + 1}</small><b>${t}</b><p>${d}</p></div>${k < nodes.length - 1 ? '<div class="harr">→</div>' : ''}`).join('')}</div>
    <p class="mut" style="margin-top:18px">Cada mensagem recebida percorre este fluxo sem ninguém digitar nada.</p>`;
}

function hubIA(c) {
  c.innerHTML = `<div class="ph"><h2>Agente de IA</h2><span class="chip ok">Ativo</span><div class="pa"><span class="btn" data-act="soon">Habilidades</span></div></div>
    <div class="hia"><div class="hmsg" style="max-height:none">${bub(1, 'Agende uma preventiva no Condomínio Bela Vista para o dia 30, com o Carlos.')}
      <div class="hskills"><span>✓ Buscar cliente</span><span>✓ Ver agenda do Carlos</span><span>✓ Criar tarefa</span></div>
      ${bub(0, 'Pronto! Tarefa <b>#80414</b> criada: preventiva no <b>Condomínio Bela Vista</b>, dia 30/09 às 08:30, com Carlos Mendes.')}
      ${bub(1, 'E avise o síndico no WhatsApp.')}
      <div class="hskills"><span>✓ Enviar mensagem</span></div>
      ${bub(0, 'Mensagem enviada para Marcos Tavares.')}</div>
      <div class="hinp"><div>Peça algo ao agente…</div><span>➤</span></div></div>`;
}

function reg(id, hubId, build, mission) { PAGES[id] = { app: 'hub', hubId, route: HUB_ROUTE[id], mission: 'hub', build }; }
reg('hubapp', 'hubapp', hubInbox);
reg('hub_pipelines', 'hub_pipelines', hubPipelines);
reg('hub_contatos', 'hub_contatos', hubContatos);
reg('hub_workflow', 'hub_workflow', hubWorkflow);
reg('hub_ia', 'hub_ia', hubIA);
const HUB_LISTS = {
  hub_atividades: { title: 'Atividades', btns: ['+ Nova atividade'], cols: ['Hora', 'Atividade', 'Contato', 'Status'], rows: [['09:00', 'Ligar para o síndico do Bela Vista', 'Marcos Tavares', '{ok}Concluída'], ['11:30', 'Enviar contrato — Hotel Alvorada', 'Paula Dias', '{warn}Hoje'], ['14:00', 'Reunião de qualificação', CLI.pt, '{info}Agendada'], ['16:30', 'Retornar Larissa sobre o orçamento', 'Larissa Nunes', '{info}Agendada']] },
  hub_automacao: { title: 'Automação CRM', btns: ['+ Nova regra'], cols: ['Regra', 'Quando', 'Então', 'Status'], rows: [['Boas-vindas', 'Novo contato no WhatsApp', 'Enviar menu de atendimento', '{ok}Ativa'], ['Follow-up de proposta', 'Proposta sem resposta há 3 dias', 'Criar atividade para o vendedor', '{ok}Ativa'], ['Pós-visita', 'Tarefa finalizada no Auvo', 'Enviar pesquisa de satisfação', '{ok}Ativa'], ['Renovação', 'Contrato vence em 30 dias', 'Mover para “Renovações”', '{mute}Pausada']] },
  hub_carteira: { title: 'Carteirização', btns: ['Filtros'], cols: ['Cliente', 'Responsável', 'Segmento', 'Último contato'], rows: [[CLI.bv, 'Carlos Mendes', 'Condomínios', 'Hoje'], [CLI.sn, 'Juliana Prado', 'Bem-estar', 'Hoje'], [CLI.sh, 'Rafael Souza', 'Shopping', 'Ontem'], [CLI.cv, 'Juliana Prado', 'Saúde', 'Há 3 dias'], [CLI.ha, 'Carlos Mendes', 'Hotelaria', 'Há 5 dias']] },
  hub_campanhas: { title: 'Campanhas', btns: ['+ Nova campanha'], cols: ['Campanha', 'Público', 'Enviadas', 'Respondidas', 'Status'], rows: [['Lembrete de preventiva', 'Clientes com contrato', '128', '94', '{ok}Concluída'], ['Higienização de verão', 'Split e cassete', '212', '61', '{info}Em andamento'], ['Renovação de PMOC', 'PMOC vencendo', '17', '11', '{warn}Agendada']] },
  hub_alerts: { title: 'AuvoAlerts', btns: [], search: false, cols: ['Alerta', 'Quem recebe', 'Canal', 'Status'], rows: [['Técnico a caminho', 'Cliente', 'WhatsApp', '{ok}Ativo'], ['Tarefa atrasada', 'Gestor', 'App e e-mail', '{ok}Ativo'], ['PMOC perto de vencer', 'Gestor', 'E-mail', '{ok}Ativo'], ['Fatura em atraso', 'Financeiro', 'WhatsApp', '{mute}Inativo']] },
  hub_atend: { title: 'Atendimento', btns: ['Filtros'], kpis: [['Conversas no mês', '412', '#7c3aed'], ['Tempo médio de resposta', '2 min 10 s', '#16a34a'], ['Resolvidas pelo bot/IA', '58%', '#0ea5e9'], ['Satisfação', '4,8', '#f59e0b']], cols: ['Atendente', 'Conversas', 'Tempo médio', 'Satisfação'], rows: [['Agente de IA', '239', '00:12', '4,6'], ['Fernanda Rocha', '96', '03:40', '4,9'], ['Marcos Lima', '77', '04:05', '4,8']] },
};
Object.entries(HUB_LISTS).forEach(([id, cfg]) => { PAGES[id] = { app: 'hub', hubId: id, route: HUB_ROUTE[id], mission: 'hub', build: c => listPage(c, cfg) }; });

// ---- ações do AuvoHub ----
const _act = act;
act = function (a, el) {
  if (a === 'hub-conv') { S.opts = { conv: +el.dataset.i }; return render(); }
  if (a === 'hub-contact') { S.opts = { contact: +el.dataset.i }; return render(); }
  if (a === 'hub-act') return hubAct(el.dataset.k);
  return _act(a, el);
};

// ---- estilo ----
const hs = document.createElement('style');
hs.textContent = `
.wbody.hub{background:#fff}
.chrome.hub{background:#e9e3f4}
.hubside{position:absolute;left:0;top:0;bottom:0;width:262px;background:linear-gradient(180deg,#20123f,#180b30);color:#fff;display:flex;flex-direction:column;z-index:20;overflow:hidden}
.hlg{height:92px;display:flex;align-items:center;gap:12px;padding:0 24px;flex:0 0 auto}
.hlg span{width:40px;height:40px;border-radius:12px;background:linear-gradient(140deg,#7c3aed,#a855f7);box-shadow:0 8px 22px rgba(124,58,237,.4);position:relative;display:block}
.hlg span::after{content:'';position:absolute;left:10px;top:12px;width:20px;height:15px;border-radius:7px 7px 7px 2px;background:#fff}
.hlg b{font:700 22px var(--font);letter-spacing:-.02em}.hlg em{font-style:normal;color:#a855f7}
.hg{height:26px;display:flex;align-items:center;padding:0 28px;font:700 10.5px var(--font);letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.34)}
.hs{height:44px;display:flex;align-items:center;gap:13px;margin:0 14px;padding:0 14px;border-radius:11px;font:500 14.5px var(--font);color:rgba(255,255,255,.6);cursor:pointer;transition:all .35s cubic-bezier(.4,0,.2,1)}
.hs svg{flex:0 0 auto;opacity:.85}
.hs:hover{background:rgba(255,255,255,.07);color:#fff}
.hs.on{background:linear-gradient(90deg,#7c3aed,#a855f7);color:#fff;font-weight:600;box-shadow:0 10px 26px rgba(124,58,237,.33)}.hs.on svg{opacity:1}
.hsf{margin-top:auto;border-top:1px solid rgba(255,255,255,.08);padding:14px 14px 16px}
.hsb{display:flex;align-items:center;gap:10px;height:38px;padding:0 14px;border-radius:10px;font:600 13px var(--font);color:rgba(255,255,255,.75);cursor:pointer;margin-bottom:10px;transition:background .2s,color .2s}.hsb:hover{background:rgba(255,255,255,.1);color:#fff}
.hsu{display:flex;align-items:center;gap:12px;padding:0 6px}.hsu i{width:38px;height:38px;border-radius:50%;background:#5b3fb0;font:600 14px var(--font);font-style:normal;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.hsu b{display:block;font:600 14px var(--font);line-height:1.25}.hsu small{display:block;font:500 12px var(--font);color:rgba(255,255,255,.5)}
.content.hub{left:262px;top:0;background:#fff;padding-top:0}
.content.hub .ph{height:76px;margin:0 -24px 14px;padding:0 34px;border-bottom:1px solid #ece7f5}
.content.hub .ph h2{font:700 24px var(--font);color:#2c2440;letter-spacing:-.02em}
.content.hub .ph .tut{display:none}
.hbell{position:absolute;right:34px;top:17px;width:42px;height:42px;border-radius:50%;background:#f5f1fb;color:#8a80a3;display:flex;align-items:center;justify-content:center;z-index:5}
.hav{border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:600;flex:0 0 auto}
.hin{display:flex;gap:16px;height:calc(100% - 90px)}
.hcl{width:320px;flex:0 0 auto;background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.hcv{display:flex;gap:12px;padding:14px;border-left:3px solid transparent;cursor:pointer;align-items:center;position:relative}.hcv:hover{background:#faf8ff}.hcv.on{background:#f3edff;border-left-color:#7c3aed}
.hct{flex:1;min-width:0}.hct div{display:flex;justify-content:space-between}.hct b{font:600 14px var(--font);color:var(--ink)}.hct small{font:500 11.5px var(--font);color:var(--mute)}
.hct p{margin:2px 0 0;font:500 12.5px var(--font);color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hcv u{position:absolute;right:14px;bottom:12px;background:#7c3aed;color:#fff;border-radius:99px;min-width:19px;height:19px;font:600 11px/19px var(--font);text-align:center;text-decoration:none}
.hth{flex:1;min-width:0;background:#fff;border:1px solid var(--line);border-radius:14px;display:flex;flex-direction:column;overflow:hidden}
.hthh{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line)}.hthh b{display:block;font:600 15px var(--font)}.hthh small{color:var(--mute);font-size:12px}
.hthh .chip{margin-left:6px}.btoggle{margin-left:auto;display:flex;align-items:center;gap:8px;font:600 12.5px var(--font);color:var(--mute)}.btoggle i{width:38px;height:21px;border-radius:99px;background:#7c3aed;position:relative;display:block}.btoggle i::after{content:'';position:absolute;right:3px;top:3px;width:15px;height:15px;border-radius:50%;background:#fff}
.hmsg{flex:1;padding:20px;display:flex;flex-direction:column;gap:11px;background:#fbfaff;overflow:auto;justify-content:flex-end}
.hb2{align-self:flex-start;max-width:70%;padding:11px 15px;border-radius:16px 16px 16px 4px;background:#fff;border:1px solid var(--line);font:500 14px/1.45 var(--font);color:var(--ink);box-shadow:0 3px 10px rgba(40,20,80,.05)}
.hb2.me{align-self:flex-end;border:0;color:#fff;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px 16px 4px 16px}
.hb2.sys{align-self:center;max-width:90%;background:#e7f7ee;border-color:#b9e6cb;color:#15803d;font-weight:600;border-radius:12px;animation:hin .4s ease}
.hb2.sys .lnk{color:#15803d;text-decoration:underline;text-underline-offset:2px}
.hb2.me.late{animation:hin .45s ease .9s both}
@keyframes hin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.hact{display:flex;align-items:center;gap:9px;padding:10px 18px;border-top:1px solid var(--line);font:600 12.5px var(--font);color:var(--mute)}
.hbtn{border:1px solid #d9ccf7;background:#f3edff;color:#5b21b6;border-radius:9px;padding:7px 14px;font:600 13px var(--font);cursor:pointer}.hbtn:hover{background:#e9defc}
.hinp{display:flex;gap:10px;padding:12px 18px;border-top:1px solid var(--line);align-items:center}.hinp div{flex:1;background:#f6f4fb;border-radius:11px;padding:11px 15px;color:var(--mute);font:500 13.5px var(--font)}.hinp span{width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;display:flex;align-items:center;justify-content:center}
.hchips{display:flex;gap:8px}.hchips span{background:#fff;border:1px solid var(--line);padding:6px 14px;border-radius:99px;font:500 12.5px var(--font);color:var(--mute)}.hchips .on{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-color:transparent}
.hkan{display:flex;gap:14px;height:calc(100% - 60px)}
.hkc{flex:1;min-width:0;background:#efeaf9;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:10px}
.hkh{display:flex;align-items:center;gap:8px}.hkh i{width:9px;height:9px;border-radius:50%}.hkh b{font:600 14px var(--font)}.hkh u{margin-left:auto;text-decoration:none;background:#fff;border-radius:8px;padding:1px 8px;font:600 12px var(--font);color:var(--mute)}
.hkd{background:#fff;border-radius:12px;padding:13px;border:1px solid var(--line);cursor:pointer;transition:transform .2s,box-shadow .2s}.hkd:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(40,20,80,.12)}
.hkd.hotc{border:1.5px solid #7c3aed;box-shadow:0 10px 26px rgba(124,58,237,.2)}
.hkd b{display:block;font:600 14px var(--font);margin-bottom:2px}.hkd small{display:block;color:var(--mute);font-size:12px;margin-bottom:9px}.hkd div{display:flex;align-items:center;gap:8px}.hkd strong{margin-left:auto;font:700 14px var(--font)}
.hcont{display:flex;gap:18px;height:calc(100% - 60px)}
.hcr{display:flex;align-items:center;gap:13px;padding:13px 16px;border-bottom:1px solid #eef1f5;cursor:pointer}.hcr:hover{background:#faf8ff}.hcr.on{background:#f3edff}.hcr div{flex:1}.hcr b{display:block;font:600 14.5px var(--font)}.hcr small{color:var(--mute);font-size:12.5px}
.hdt{width:330px;flex:0 0 auto;padding:26px;text-align:center;display:flex;flex-direction:column;align-items:center}.hdt h3{margin:12px 0 2px;font:700 19px var(--font)}.hdt small{color:var(--mute);margin-bottom:16px}
.hdr{display:flex;justify-content:space-between;width:100%;padding:11px 0;border-top:1px solid #eef1f5}.hdr span{color:var(--mute);font-size:13px}.hdr b{font:600 13px var(--font)}
.hflow{display:flex;align-items:stretch;gap:10px;margin-top:24px}
.hnode{flex:1;background:#fff;border:1px solid var(--line);border-top:4px solid;border-radius:12px;padding:16px;cursor:pointer;transition:transform .2s,box-shadow .2s}.hnode:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(40,20,80,.14)}
.hnode small{color:var(--mute);font-weight:600;font-size:11.5px}.hnode b{display:block;font:700 15px var(--font);margin:4px 0 6px}.hnode p{margin:0;color:var(--mute);font-size:12.5px;line-height:1.5}
.harr{align-self:center;font-size:22px;color:#a78bfa}
.hia{display:flex;flex-direction:column;height:calc(100% - 60px);background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.hskills{align-self:flex-start;display:flex;gap:6px;flex-wrap:wrap}.hskills span{background:#f3edff;color:#5b21b6;border-radius:99px;padding:4px 12px;font:600 12px var(--font)}
`;
document.head.appendChild(hs);
