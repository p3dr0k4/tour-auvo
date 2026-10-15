// ============================================================
// App simulado do Auvo OPS (app.auvocmms.com): menu lateral, telas, janelas,
// estado da história, missões do modo explorar e a barra inferior.
// Todas as telas foram desenhadas a partir do ambiente real; os dados são fictícios.
// ============================================================
const win = $('#win');
const S = { page: 'dashboard', opts: {}, mode: 'hero', visited: new Set(), modal: null, cap: '', listOpen: false, skipped: new Set(), route: 0, jonas: 0, srTab: 'pend', osTab: 'det', assetTab: 'det' };

const MISSIONS = [
  { k: 'sr', t: 'Aprovar o chamado do hospital' },
  { k: 'os', t: 'Pedir ao Jonas o resumo da OS' },
  { k: 'rotas', t: 'Montar as rotas do dia' },
  { k: 'sign', t: 'Coletar a assinatura no app' },
  { k: 'ativo', t: 'Abrir o QR Code do Chiller 01' },
  { k: 'pm', t: 'Ver o calendário de preventivas' },
  { k: 'sla', t: 'Conferir o SLA da operação' },
  { k: 'jonas', t: 'Fazer uma pergunta ao Jonas' },
];

// ---- integração: modo embutido, links diretos e eventos ----
const INIT_HASH = location.hash.slice(1);
if (new URLSearchParams(location.search).get('embed') === '1') document.body.classList.add('embed');
function track(name, data) {
  try { if (window.va) window.va('event', { name: 'ops_' + name, data }); } catch (e) { /* analytics ausente */ }
  try { if (window.parent !== window) window.parent.postMessage({ source: 'auvo-tour-ops', name, data: data || {} }, '*'); } catch (e) { /* sem pai */ }
}
function setHash(h) { try { history.replaceState(null, '', location.pathname + location.search + (h ? '#' + h : '')); } catch (e) { /* file:// */ } }

let camUntil = 0;
function camSet(m) { win.classList.toggle('cam-wide', m === 'wide'); win.classList.toggle('cam-in', m === 'in'); camUntil = performance.now() + 1050; }
function camWait(sig) { const w = camUntil - performance.now(); return w > 0 ? sleep(w + 40, sig) : Promise.resolve(); }

const IC = {
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
  hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3l14 7-6 2-2 6z"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.3"/><rect x="13.5" y="5" width="4" height="14" rx="1.3"/></svg>',
  replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4.2h4.2"/></svg>',
};

/* ---------------- ícones de traço do app (estilo do OPS) ---------------- */
const OI = {
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  clip: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5h6v3H9zM8.5 12h7M8.5 16h5"/>',
  head: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3.5" y="13.5" width="4" height="6" rx="1.5"/><rect x="16.5" y="13.5" width="4" height="6" rx="1.5"/><path d="M18.5 19.5c0 1.5-2 2-4.5 2"/>',
  helmet: '<path d="M4 17h16M5 17v-3a7 7 0 0 1 14 0v3M10 7.5V5h4v2.5"/>',
  box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  bldg: '<rect x="4" y="5" width="11" height="15" rx="1.5"/><path d="M15 9h5v11h-5M7.5 9h4M7.5 12.5h4M7.5 16h4"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  shield: '<path d="M12 3.5l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9v-5z"/>',
  pkg: '<path d="M12 3.5l8 4v9l-8 4-8-4v-9z"/><path d="M8 5.5l8 4M12 11.5v9"/>',
  cart: '<path d="M3.5 4.5h2.5l2.2 10.5h10l2-7.5H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
  hand: '<path d="M3.5 13.5l4-3.5 4.5 2 4-2.5 4.5 2.5M6 11.5v6.5l4.5 2 5-2.5"/>',
  nav: '<path d="M20 4L4 11l7 2 2 7z"/>',
  route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.3M12 18.2v2.3M3.5 12h2.3M18.2 12h2.3M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6"/>',
  spark: '<path d="M11 3.5l1.7 4.8 4.8 1.7-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.7z"/><path d="M18 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  dl: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM18 18h2M14 20h2.5M20 14v2.5"/>',
  pin: '<path d="M12 21s6.5-5.8 6.5-11a6.5 6.5 0 0 0-13 0c0 5.2 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  wrench: '<path d="M14.5 6a4 4 0 0 0 5 5L12 18.5l-3 1 1-3 7.5-7.5a4 4 0 0 1-5-5z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  share: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 13v6h14v-6"/>',
  pause: '<path d="M9 6v12M15 6v12"/>',
  pen: '<path d="M4.5 19.5l1-4L16 5l3 3L8.5 18.5z"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M6.5 7l1 13h9l1-13"/>',
  ban: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  star: '<path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
};
const oi = (n, s = 18, w = 1.8) => '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + OI[n] + '</svg>';
const chip = (t, c) => '<span class="chip ' + c + '">' + t + '</span>';
const stChip = k => chip(WST[k].l, WST[k].c);
const prChip = k => chip(PRIO[k].l, PRIO[k].c);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------------- menu lateral ---------------- */
const NAV = [
  ['dashboard', 'Painel', 'grid'],
  ['wos', 'Ordens de serviço', 'clip', 1],
  ['sr', 'Central de atendimento', 'head', 1, [['sr', 'Chamados'], ['conv', 'Conversas']]],
  ['projects', 'Projetos', 'helmet', 0, null, 'NOVO'],
  ['assets', 'Ativos', 'box', 1],
  ['customers', 'Clientes', 'bldg', 1],
  ['preventive', 'Preventiva', 'cal', 1],
  ['sla', 'SLA', 'shield'],
  ['inventory', 'Estoque', 'pkg', 1],
  ['procurement', 'Compras', 'cart'],
  ['outsourcing', 'Terceirização', 'hand', 1],
  ['tracking', 'Rastreamento', 'nav'],
  ['routing', 'Rotas', 'route', 0, null, 'NOVO'],
  ['analytics', 'Relatórios', 'chart', 1],
  ['settings', 'Configurações', 'gear'],
];
// a que item do menu cada página pertence
const GROUP = { os: 'wos', conv: 'sr', asset: 'assets', jonas: null };
function sideHTML() {
  const cur = GROUP[S.page] !== undefined ? GROUP[S.page] : S.page;
  const items = NAV.map(([id, l, ic, chev, kids, badge]) => {
    const on = cur === id || (kids && kids.some(k => k[0] === S.page || k[0] === cur));
    const sub = on && kids ? '<div class="sbk">' + kids.map(([k, kl]) => '<div class="sbs' + (S.page === k || (k === 'sr' && S.page === 'sr') ? ' on' : '') + '" data-go="' + k + '">' + kl + '</div>').join('') + '</div>' : '';
    return '<div class="sbi' + (on ? ' on' : '') + '" data-go="' + id + '">' + oi(ic, 18) + '<span>' + l + '</span>' + (badge ? '<em class="nw">' + badge + '</em>' : chev ? '<i class="chv">›</i>' : '') + '</div>' + sub;
  }).join('');
  return '<aside class="sb"><div class="sbl"><b>auvo</b><span class="ops">OPS</span></div><div class="org"><span>V</span><b>' + CO.name + '</b></div><nav class="sbn">' + items + '</nav>' +
    '<div class="sbj' + (S.page === 'jonas' ? ' on' : '') + '" data-go="jonas">' + oi('spark', 18) + '<div><b>Jonas</b><small>Organize a agenda da próxima semana</small></div></div><div class="sbv">v 0.3.0 · pt-BR</div></aside>';
}
function topHTML() {
  const al = (MAIN.srSt === 'pendente' ? 1 : 0) + 2;
  return '<header class="tb2"><span class="mnav" data-act="mmenu" aria-label="Abrir menu">' + oi('menu', 20) + '</span><span class="mlg">auvo <i>OPS</i></span>' +
    '<div class="gs">' + oi('search', 16) + '<span>Buscar OS, ativos, locais, pessoas...</span><kbd>⌘K</kbd></div><div class="sp"></div>' +
    '<span class="tbi" data-act="soon" title="Oportunidades">' + oi('compass', 19) + '<em class="pu">3</em></span><span class="tbi" data-go="jonas" title="Jonas">' + oi('spark', 19) + '</span><span class="tbi" data-act="dl" title="Downloads">' + oi('dl', 19) + '</span>' +
    '<span class="tbi" data-act="soon" title="Alertas">' + oi('alert', 19) + '<em>' + al + '</em></span><span class="tbi" data-act="soon" title="Notificações">' + oi('bell', 19) + '<em>12</em></span>' +
    '<div class="usr"><div><b>' + CO.user + '</b><small>' + CO.role + '</small></div><span class="av">PA</span></div></header>';
}
function sheetHTML() {
  const its = NAV.map(([id, l, ic]) => '<div class="msi" data-go="' + id + '">' + oi(ic, 17) + l + '</div>').join('');
  return '<div class="msheet" id="msheet"><div class="msh"><b>Menu</b><span class="x" data-act="mclose" aria-label="Fechar menu">✕</span></div><div class="msb">' + its + '<div class="msi j" data-go="jonas">' + oi('spark', 17) + 'Jonas</div></div></div>';
}

/* ---------------- páginas ---------------- */
const PAGES = {
  dashboard: { route: 'dashboard', build: dashPage },
  wos: { route: 'work-orders', build: wosPage },
  os: { route: 'work-orders/', build: osPage },
  sr: { route: 'service-requests', build: srPage },
  conv: { route: 'customer-service', build: convPage },
  assets: { route: 'assets', build: assetsPage },
  asset: { route: 'assets/chl-001', build: assetPage, mission: null },
  customers: { route: 'customers', build: customersPage },
  preventive: { route: 'preventive', build: pmPage, mission: 'pm' },
  sla: { route: 'sla', build: slaPage, mission: 'sla' },
  routing: { route: 'routing', build: routePage },
  tracking: { route: 'tracking', build: trackPage },
  analytics: { route: 'analytics', build: anaPage },
  jonas: { route: 'assistant', build: jonasPage },
  projects: { route: 'projects', build: c => softPage(c, 'Projetos', 'Carteira de obras', 'Projetos agrupam obras e serviços maiores, com valor contratado e valor apurado em cada etapa.') },
  inventory: { route: 'inventory', build: c => softPage(c, 'Estoque', 'Materiais e peças', 'O consumo lançado na OS baixa o estoque e entra no custo do ativo.') },
  procurement: { route: 'procurement', build: c => softPage(c, 'Compras', 'Pedidos de compra', 'Compras ligadas à necessidade da manutenção, como a peça que uma OS está aguardando.') },
  outsourcing: { route: 'outsourcing', build: c => softPage(c, 'Terceirização', 'Prestadores', 'Peça orçamento a prestadores direto da OS e acompanhe quem foi contratado.') },
  settings: { route: 'settings', build: c => softPage(c, 'Configurações', 'Sua organização', 'Equipes, políticas de SLA, política de IA, formulários e integrações.') },
};

function ph(t, sub, btns) { return '<div class="ph"><div><h2>' + t + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div><div class="pa">' + (btns || '') + '</div></div>'; }
const jbtn = (a = 'soon') => '<span class="btn jb" data-act="' + a + '">' + oi('spark', 15) + 'Peça ajuda ao Jonas</span>';
const kpi = (l, v, s, col) => '<div class="kc"><small>' + l + '</small><b' + (col ? ' style="color:' + col + '"' : '') + '>' + v + '</b>' + (s ? '<span>' + s + '</span>' : '') + '</div>';

function dashPage(c) {
  const pend = MAIN.srSt === 'pendente' ? 1 : 0;
  const late = 1;
  c.innerHTML = '<div class="ban"><div class="bt">● ' + (pend + late) + ' EM ATENÇÃO</div><h2>Bom dia, ' + CO.user + '. <span>' + (pend ? '1 chamado aguardando triagem.' : 'Tudo sob controle por aqui.') + '</span></h2><div class="bb"><span class="btn wh" data-go="wos">' + oi('clip', 15) + 'Nova OS</span><span class="btn wh" data-act="soon">' + oi('qr', 15) + 'Buscar QR</span></div></div>' +
    '<div class="dg"><div class="card att"><div class="cth">' + oi('bell', 17) + '<b>Precisa de atenção</b><span class="lk" data-act="soon">Ver todos ›</span></div>' +
    '<div class="arow bad" data-go="wos">' + oi('alert', 18) + '<span>Ordens de serviço atrasadas</span><b>' + late + '</b></div>' +
    '<div class="arow warn" data-go="sr">' + oi('head', 18) + '<span>Chamados aguardando triagem</span><b>' + pend + '</b></div>' +
    '<div class="arow warn" data-act="soon">' + oi('cart', 18) + '<span>Despesas aguardando aprovação</span><b>2</b></div></div>' +
    '<div class="card"><div class="cth">' + oi('cal', 17) + '<b>Próximas preventivas</b><span class="lk" data-go="preventive">Ver todas ›</span></div>' + PMS.slice(0, 3).map(p => '<div class="pmr" data-go="preventive"><em>' + p[0] + '</em><div><b>' + p[2] + '</b><small>' + p[1] + ' · ' + p[3] + '</small></div></div>').join('') + '</div></div>' +
    '<div class="kr">' + kpi('OS ABERTAS', 9, '2 em andamento') + kpi('ATRASADAS', late, 'Precisam de atenção', '#dc2626') + kpi('SLA EM RISCO', 1, 'próximas 24h', '#b45309') + kpi('CHAMADOS', pend, 'aguardando triagem') + kpi('SEM ASSINATURA', 0, 'concluídas aguardando aceite') + '</div>' +
    '<div class="dg3"><div class="card"><div class="cth"><b>OS por status</b><small>Este mês</small></div>' + donut([['Aberta', 3, '#1d4ed8'], ['Atribuída', 3, '#6d26c2'], ['Em andamento', 2, '#b45309'], ['Aguardando peça', 2, '#94a3b8'], ['Concluída', 14, '#4d7a04']]) + '</div>' +
    '<div class="card"><div class="cth"><b>Status dos ativos</b><span class="lk" data-go="assets">Ver todos ›</span></div><div class="mini"><div><b>54</b><small>Ativos</small></div><div><b>2</b><small>Em manutenção</small></div><div><b>19</b><small>Críticos</small></div><div><b>0</b><small>Descomissionados</small></div></div></div>' +
    '<div class="card"><div class="cth"><b>Contratos de manutenção</b><span class="lk" data-act="soon">Ver todos ›</span></div><div class="mini"><div><b>6</b><small>Contratos</small></div><div><b>1</b><small>Vencendo</small></div><div><b>R$ 58,4 mil</b><small>Contratado por mês</small></div></div></div></div>';
}
function donut(parts) {
  const tot = parts.reduce((s, p) => s + p[1], 0); let a = 0;
  const R = 52, C = 2 * Math.PI * R;
  const arcs = parts.map(([, v, col]) => { const len = (v / tot) * C, s = '<circle r="' + R + '" cx="70" cy="70" fill="none" stroke="' + col + '" stroke-width="18" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-a) + '"/>'; a += len; return s; }).join('');
  return '<div class="dn"><svg viewBox="0 0 140 140" width="140" height="140"><g transform="rotate(-90 70 70)">' + arcs + '</g><text x="70" y="68" text-anchor="middle" class="dnv">' + tot + '</text><text x="70" y="86" text-anchor="middle" class="dnl">TOTAL</text></svg><div class="dnlg">' +
    parts.map(([l, v, col]) => '<div><i style="background:' + col + '"></i>' + l + '<b>' + v + '</b></div>').join('') + '</div></div>';
}

function wosRows() {
  const main = MAIN.srSt === 'convertido' ? [[MAIN.code, MAIN.title, MAIN.st, MAIN.prio, MAIN.asset, MAIN.tech || '—', '15/10/2026', MAIN.cli]] : [];
  return main.concat(WOS);
}
function wosPage(c) {
  const rows = wosRows();
  c.innerHTML = '<div class="vt"><span class="on">Lista <em>' + rows.length + '</em></span><span data-act="soon">Kanban</span><span data-act="soon">Calendário</span><span data-act="soon">Despacho</span><div class="sp"></div>' + jbtn() + '<span class="btn pri" data-act="soon">+ Nova OS</span></div>' +
    '<div class="fl2"><span class="on">Todas <em>' + rows.length + '</em></span><span>Atribuídas a mim</span><span>Atrasadas <em>1</em></span><span>SLA em risco <em>1</em></span><span>Concluídas hoje</span><span>Sem assinatura do cliente</span></div>' +
    '<div class="card tc"><table class="tbl"><thead><tr><th>Código</th><th>Resumo</th><th>Status</th><th>Prioridade</th><th>Ativos</th><th>Atribuído a</th><th>Prazo</th></tr></thead><tbody>' +
    rows.map(r => '<tr data-act="os-open" data-code="' + r[0] + '" class="' + (r[0] === MAIN.code ? 'main' : '') + '"><td class="cd">' + r[0] + '</td><td><b>' + r[1] + '</b><small>' + r[7] + '</small></td><td>' + stChip(r[2]) + '</td><td>' + prChip(r[3]) + '</td><td>' + r[4] + '</td><td>' + r[5] + '</td><td>' + r[6] + '</td></tr>').join('') +
    '</tbody></table><div class="pg">Exibindo ' + rows.length + ' de ' + rows.length + '</div></div>';
}

/* --- OS --- */
function osData(code) {
  if (!code || code === MAIN.code) return { main: true, code: MAIN.code, title: MAIN.title, st: MAIN.st, prio: MAIN.prio, asset: MAIN.asset, tech: MAIN.tech, cli: MAIN.cli, local: MAIN.local };
  const r = WOS.find(w => w[0] === code) || WOS[0];
  return { main: false, code: r[0], title: r[1], st: r[2], prio: r[3], asset: r[4], tech: r[5], cli: r[7], local: '—' };
}
function slaBox() {
  const st = MAIN.st;
  const resp = st === 'aberta' ? '<em class="cd2" data-cd="7150">1 h 59 min</em><span class="chip warn">CORRENDO</span>' : '<em>Cumprido às 08:10</em><span class="chip ok">CUMPRIDO</span>';
  const sol = st === 'concluida' ? '<em>Cumprido às 10:48</em><span class="chip ok">CUMPRIDO</span>' : '<em class="cd2" data-cd="' + (st === 'aberta' ? 28750 : 24000) + '">vence às 15:55</em><span class="chip warn">CORRENDO</span>';
  return '<div class="card sbx" id="slabox"><small class="lbl">SLA</small><div class="sr2"><div><small>RESPOSTA · CONTA ATÉ A OS SAIR DE ABERTA</small>' + resp + '</div></div><div class="sr2"><div><small>SOLUÇÃO</small>' + sol + '</div></div>' +
    '<div class="why"><small>POR QUE ESTE PRAZO</small><b>Política SLA Alta prioridade</b><span>Resposta 2h · Solução 8h · horário comercial</span></div></div>';
}
function osPage(c) {
  const o = osData(S.opts.code), main = o.main;
  const st = o.st, done = st === 'concluida';
  const tabs = [['det', 'Detalhes'], ['rot', 'Roteiro'], ['chk', 'Checklists'], ['com', 'Comentários'], ['mat', 'Materiais' + (main && MAIN.mat ? ' · 1' : '')], ['des', 'Despesas'], ['par', 'Paradas'], ['anx', 'Anexos'], ['his', 'Histórico'], ['ass', 'Assinatura']];
  const tab = S.osTab;
  const sum = main && MAIN.summary ? '<div class="jsum" id="jsum">' + oi('spark', 18) + '<div><small>RESUMO DO JONAS</small><p id="jsumt">' + (MAIN.summary === true ? JSUM : '') + '</p></div></div>' : '';
  const actions = '<span class="stp ' + WST[st].c + '"><b>' + WST[st].l.toUpperCase() + '</b><small>' + (main ? { aberta: 'há 3 min', atribuida: 'desde 08:10', andamento: 'desde 09:05', concluida: 'às 10:48' }[st] : 'hoje') + '</small></span>' +
    (done ? '' : '<span class="btn" data-act="soon">' + oi('pause', 15) + 'Pausar</span>') + '<span class="btn" data-act="soon">' + oi('share', 15) + 'Compartilhar</span><span class="btn" data-act="' + (main ? 'os-assign' : 'soon') + '">' + oi('user', 15) + 'Atribuir</span><span class="btn" data-act="soon">' + oi('pen', 15) + 'Editar</span>' +
    (done ? '' : '<span class="btn" data-act="soon">' + oi('ban', 15) + 'Cancelar OS</span>') +
    (main && !done ? '<span class="btn app" data-act="app-open">' + oi('phone', 15) + 'Ver no app do técnico</span>' : '') +
    (done ? '' : '<span class="btn lime" data-act="' + (main ? 'app-open' : 'soon') + '">' + oi('check', 15) + 'Concluir</span>');
  c.innerHTML = '<div class="osh"><div class="ochips"><span class="chip pur">' + o.code + '</span>' + prChip(o.prio).replace('chip ', 'chip dot ') + '<span class="chip ln">' + oi('wrench', 13) + 'Corretiva</span>' + (main ? '<span class="chip ln pur2">CTR-2026-014</span><span class="chip ln">Origem: Portal · ' + MAIN.sr + '</span>' : '') + '</div>' +
    '<h1>' + o.title + '</h1><div class="crumb">' + oi('bldg', 14) + o.cli + ' › ' + (main ? MAIN.local : o.local) + ' <span>' + oi('wrench', 14) + o.asset + '</span><span>' + oi('clock', 14) + (main ? 'Aberta às 07:55' : 'Aberta esta semana') + '</span></div>' +
    '<div class="oact">' + actions + '</div></div>' +
    (main && !done ? '<div class="jq"><span>' + oi('spark', 17) + 'Quer entender esta OS em segundos?</span><span class="btn jp" data-act="os-sum">' + oi('spark', 15) + 'Resumir com o Jonas</span></div>' : '') + sum +
    '<div class="og"><div class="ol"><div class="card oas"><div class="cth">' + oi('box', 17) + '<b>Ativos da OS</b><em class="cnt2">1</em><span class="btn sm" data-go="asset">Ver ativo</span></div><small class="mut">' + (done ? '1 de 1 atendido' : '0 de 1 atendidos') + '</small><div class="pbar"><i style="width:' + (done ? 100 : 0) + '%"></i></div>' +
    '<div class="ar" data-go="' + (main ? 'asset' : 'assets') + '">' + oi('star', 15) + '<div><b>' + o.asset + '</b><small>' + (main ? MAIN.assetCode : '') + '</small></div><span class="chip ' + (done ? 'ok' : 'ln') + '">' + (done ? 'Atendido' : 'Pendente') + '</span></div></div>' +
    '<div class="otabs">' + tabs.map(([k, l]) => '<span class="' + (k === tab ? 'on' : '') + '" data-act="os-tab" data-t="' + k + '">' + l + '</span>').join('') + '</div><div class="card otp" id="otp">' + osTabHTML(tab, o) + '</div></div>' +
    '<div class="or">' + (main ? slaBox() : '') + '<div class="card sbx"><small class="lbl">ATRIBUÍDO A</small><div class="who">' + (o.tech && o.tech !== '—' ? '<span class="av sm">' + o.tech.split(' ').map(w => w[0]).join('') + '</span><div><b>' + o.tech + '</b><small>' + (st === 'andamento' ? 'No local desde 09:05' : st === 'concluida' ? 'Concluiu às 10:48' : 'Agenda de hoje') + '</small></div>' + (st === 'andamento' ? '<span class="chip ok">ONLINE</span>' : '') : '<div><b>Ninguém ainda</b><small>Atribua ou monte as rotas do dia</small></div>') + '</div></div>' +
    '<div class="card sbx"><small class="lbl">CUSTO</small>' + costRows(main, st) + '</div></div></div>';
  if (main && MAIN.summary === 'typing') typeSummary();
}
const JSUM = 'Corretiva de prioridade alta no Chiller 01 (Casa de Máquinas, Hospital Santa Aurora), aberta pelo Portal às 07:52 pela engenharia clínica. O equipamento desarmou duas vezes desde as 6h por alta pressão de descarga. É um ativo crítico: o SLA de resposta vence às 09:55 e o de solução às 15:55. A última corretiva neste chiller foi há 34 dias, pelo mesmo motivo.';
function costRows(main, st) {
  const done = st === 'concluida', mat = main && MAIN.mat;
  const r = (l, v) => '<div class="cr"><span>' + l + '</span><b>' + v + '</b></div>';
  return r('Materiais', mat ? 'R$ 890,00' : '—') + r('Mão de obra', done ? 'R$ 312,00' : st === 'andamento' ? 'em andamento' : '—') + r('Deslocamento', main && st !== 'aberta' && st !== 'atribuida' ? 'R$ 28,60 · 11 km' : '—') + '<div class="cr tot"><span>CUSTO REAL</span><b>' + (done ? 'R$ 1.230,60' : mat ? 'R$ 890,00' : 'R$ 0,00') + '</b></div>';
}
function osTabHTML(t, o) {
  const main = o.main;
  if (t === 'det') return '<small class="lbl">DESCRIÇÃO</small><h3>O que foi reportado</h3><p>' + (main ? MAIN.desc : 'Descrição registrada na abertura da OS.') + '</p>' + (main ? '<div class="who2"><small>SOLICITANTE</small><b>' + MAIN.by + '</b><span>' + MAIN.byRole + ' · ' + HSA + '</span></div>' : '') +
    '<div class="dts"><div><small>ABERTA</small>15 de out. · ' + (main ? '07:55' : '—') + '</div><div><small>INICIADA</small>' + (main && (o.st === 'andamento' || o.st === 'concluida') ? '15 de out. · 09:05' : '—') + '</div><div><small>PREVISTA INÍCIO</small>15 de out. · 08:40</div><div><small>PREVISTA FIM</small>15 de out. · 15:55</div></div>';
  if (t === 'chk') return main && (o.st === 'andamento' || o.st === 'concluida') ? '<small class="lbl">INSPEÇÃO</small><h3>Checklists</h3><div class="chkl">' + ['Pressão de descarga medida e registrada', 'Condensador limpo e sem obstrução', 'Ventiladores do condensador testados', 'Carga de fluido refrigerante conferida', 'Equipamento em operação normal após o reparo'].map((x, i) => '<div class="' + (o.st === 'concluida' || i < 3 ? 'ok' : '') + '">' + oi(o.st === 'concluida' || i < 3 ? 'check' : 'clock', 15) + x + '</div>').join('') + '</div>' : '<small class="lbl">INSPEÇÃO</small><h3>Checklists</h3><p class="mut">O formulário de corretiva de climatização entra quando o técnico inicia a OS.</p>';
  if (t === 'mat') return '<small class="lbl">CONSUMO</small><h3>Materiais <span class="pa2"><span class="btn sm" data-act="soon">Planejar (reservar)</span><span class="btn sm pri" data-act="' + (main ? 'mat-add' : 'soon') + '">Lançar consumo</span></span></h3>' +
    (main && MAIN.mat ? '<table class="tbl"><thead><tr><th>Material</th><th>Status</th><th>Consumido</th><th>Custo unit.</th><th>Custo total</th></tr></thead><tbody><tr><td><b>Fluido refrigerante R-410A (cilindro 11,3 kg)</b><small>MAT-0005</small></td><td>' + chip('Consumido', 'ok') + '</td><td>1 un</td><td>R$ 890,00</td><td>R$ 890,00</td></tr></tbody></table>' : '<p class="mut">Nenhum material lançado ainda. O que o técnico usar baixa do estoque e entra no custo do ativo.</p>');
  if (t === 'his') return '<small class="lbl">AUDITORIA</small><h3>Histórico</h3><div class="hist">' + histItems(main, o.st).map(h => '<div><em>' + h[0] + '</em>' + h[1] + '</div>').join('') + '</div>';
  if (t === 'ass') return '<small class="lbl">COMPROVAÇÃO</small><h3>Assinatura</h3>' + (main && MAIN.signed ? '<div class="sigok">' + (MAIN.sigData ? '<img src="' + MAIN.sigData + '" alt="Assinatura do cliente">' : '<svg viewBox="0 0 300 90" class="sigsvg"><path d="M20 60 C40 20 55 75 75 35 S110 70 130 30 S165 70 190 40 S230 65 280 38" fill="none" stroke="#1e2a6b" stroke-width="3" stroke-linecap="round"/></svg>') + '<div><b>' + MAIN.by + '</b><span>Engenharia clínica · 15/10/2026 às 10:47</span><span>Coletada no aplicativo pelo técnico Carlos Mendes</span></div></div>' : '<p class="mut">Nenhuma assinatura coletada. O técnico coleta a assinatura pelo aplicativo, ao concluir o serviço.</p>');
  const soft = { rot: ['Roteiro', 'Aplique um procedimento publicado: os passos e as peças dele entram nesta OS.'], com: ['Comentários', 'Conversa da equipe sobre esta OS.'], des: ['Despesas', 'Reembolsos do técnico ligados a esta OS, com aprovação.'], par: ['Paradas', 'Tempo de equipamento parado registrado nesta OS.'], anx: ['Anexos', 'Fotos e documentos do atendimento.'] }[t];
  return '<h3>' + soft[0] + '</h3><p class="mut">' + soft[1] + '</p>';
}
function histItems(main, st) {
  if (!main) return [['hoje', 'OS criada pela equipe']];
  const h = [['07:52', 'Renata Prado abriu o chamado ' + MAIN.sr + ' pelo Portal'], ['07:55', 'Paula Andrade aprovou o chamado e criou a OS · SLA Alta prioridade aplicado']];
  if (st !== 'aberta') h.push(['08:10', 'Rotas publicadas: OS atribuída a Carlos Mendes · Aberta → Atribuída']);
  if (st === 'andamento' || st === 'concluida') h.push(['09:05', 'Carlos Mendes fez check-in no local · Atribuída → Em andamento']);
  if (MAIN.mat) h.push(['10:20', 'Consumo lançado: Fluido refrigerante R-410A (1 un)']);
  if (st === 'concluida') h.push(['10:48', 'Assinatura do cliente coletada no aplicativo · Em andamento → Concluída']);
  return h.reverse();
}
// contagem regressiva do SLA (só visual)
setInterval(() => { $$('.cd2[data-cd]', win).forEach(e => { let s = +e.dataset.cd - 1; if (s < 0) s = 0; e.dataset.cd = s; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; e.textContent = (h ? h + ' h ' : '') + m + ' min ' + String(x).padStart(2, '0') + ' s'; }); }, 1000);

function typeSummary() {
  const el = $('#jsumt', win); if (!el) return;
  let i = 0; const full = JSUM; clearInterval(typeSummary.t);
  typeSummary.t = setInterval(() => { i += 3; el.textContent = full.slice(0, i); if (i >= full.length) { clearInterval(typeSummary.t); MAIN.summary = true; } }, 18);
}

/* --- chamados --- */
function srCard(main) {
  if (main) {
    const st = MAIN.srSt;
    const stc = st === 'pendente' ? chip('PENDENTE', 'warn') : chip('CONVERTIDO', 'ok');
    return '<div class="card src main' + (st !== 'pendente' ? ' dn2' : '') + '" id="srmain"><div class="srh">' + '<span class="cd">' + MAIN.sr + '</span>' + stc + chip('ALTA', 'org') + '<small>· 15 de out., 07:52</small>' + (st !== 'pendente' ? '<span class="lnk" data-act="os-open" data-code="' + MAIN.code + '">→ ' + MAIN.code + '</span>' : '') +
      '<div class="sp"></div>' + (st === 'pendente' ? '<span class="btn" data-act="soon">' + oi('x', 14) + 'Rejeitar</span><span class="btn pri" data-act="sr-ok">' + oi('check', 14) + 'Aprovar e criar OS</span>' : '<span class="btn" data-act="os-open" data-code="' + MAIN.code + '">Abrir OS</span>') + '</div>' +
      '<h3>' + MAIN.title + '</h3><div class="srf"><div><small>SOLICITANTE</small><b>' + MAIN.by + '</b><span>engclinica@santaaurora.example</span></div><div><small>CATEGORIA</small><b>Equipamento com defeito</b></div><div><small>LOCAL</small><b>' + MAIN.local + '</b><span>' + HSA + '</span></div><div><small>ORIGEM</small><b>Portal</b></div></div>' +
      '<div class="sra">' + oi('wrench', 15) + MAIN.asset + '</div><p>' + MAIN.desc + '</p></div>';
  }
  return '';
}
const SR_OTHERS = [
  ['SR-0127', 'CONVERTIDO', 'MÉDIA', '14 de out., 16:20', 'OS-00411', 'Elevador Social 02 com ruído na subida', 'Shopping Vale Verde', 'Interno', 'Lojistas relatam ruído metálico e trepidação entre o 2º e o 4º pavimento.'],
  ['SR-0126', 'REJEITADO', 'MÉDIA', '14 de out., 11:05', '', 'Lâmpadas queimadas no corredor do estacionamento', 'Corporate Tower Paulista', 'Portal', 'Serviço fora do escopo do contrato de manutenção.'],
];
function srPage(c) {
  const pend = MAIN.srSt === 'pendente' ? 1 : 0;
  const tab = S.srTab;
  const cards = (tab === 'pend' ? [srCard(true)] : [srCard(true)].concat(SR_OTHERS.map(r => '<div class="card src"><div class="srh"><span class="cd">' + r[0] + '</span>' + chip(r[1], r[1] === 'REJEITADO' ? 'mute' : 'ok') + chip(r[2], 'mute') + '<small>· ' + r[3] + '</small>' + (r[4] ? '<span class="lnk" data-act="os-open" data-code="' + r[4] + '">→ ' + r[4] + '</span>' : '') + '</div><h3>' + r[5] + '</h3><div class="srf"><div><small>LOCAL</small><b>' + r[6] + '</b></div><div><small>ORIGEM</small><b>' + r[7] + '</b></div></div><p>' + r[8] + '</p></div>'))).join('');
  c.innerHTML = '<div class="srk"><div class="' + (tab === 'all' ? 'on' : '') + '" data-act="sr-tab" data-t="all"><small>TODOS</small><b>' + (3) + '</b></div><div class="' + (tab === 'pend' ? 'on' : '') + '" data-act="sr-tab" data-t="pend"><small>PENDENTES</small><b>' + pend + '</b>' + (tab === 'pend' ? '<em>● Filtro ativo</em>' : '') + '</div><div><small>APROVADOS</small><b>0</b></div><div><small>CONVERTIDOS</small><b>' + (2 - pend) + '</b></div><div><small>REJEITADOS</small><b>1</b></div></div>' +
    '<div class="vt"><span class="btn pri" data-act="soon">+ Novo chamado</span>' + jbtn() + '<span class="btn" data-act="soon">Selecionar para unir</span><div class="sp"></div><span class="on">Lista</span><span data-act="soon">Kanban</span></div>' +
    cards + (tab === 'pend' && !pend ? '<p class="mut srdone">' + oi('check', 14) + ' Nenhum outro chamado pendente. Tudo triado.</p>' : '');
}
function convPage(c) {
  c.innerHTML = ph('Central de atendimento', 'O assistente responde seus clientes na Área do Cliente; a equipe assume quando precisa.') +
    '<div class="vt"><span class="on">Conversas</span><span data-act="soon">Base de conhecimento</span><span data-act="soon">Configurações</span></div>' +
    '<div class="cvw"><div class="card cvl"><div class="fl2 col"><span class="on">Precisa de atenção</span><span>Abertas</span><span>Com a equipe</span><span>Encerradas</span><span>Todas</span></div><p class="mut">Nenhuma conversa aqui.</p></div><div class="card cvr"><p class="mut">Escolha uma conversa à esquerda.</p></div></div>';
}

/* --- ativos --- */
function assetsPage(c) {
  c.innerHTML = '<div class="kr">' + kpi('TOTAL DE ATIVOS', 54, '52 ativos · 0 inativos') + kpi('EM MANUTENÇÃO', 2, 'requerem atenção', '#b45309') + kpi('CRÍTICOS', 19, '35% dos ativos', '#dc2626') + kpi('OS ABERTAS (MÊS)', 9, 'média 0,6 / dia') + '</div>' +
    '<div class="vt"><span class="btn" data-act="soon">Importar</span><span class="btn" data-act="dl">Exportar</span><div class="sp"></div><span class="btn pri" data-act="soon">+ Novo ativo</span></div>' +
    '<div class="card tc"><table class="tbl"><thead><tr><th>Nome</th><th>Status</th><th>Criticidade</th><th>Preventiva</th><th>Localização</th></tr></thead><tbody>' +
    ASSETS.map(a => '<tr data-act="asset-open" data-c="' + a[1] + '" class="' + (a[1] === 'CHL-001' ? 'main' : '') + '"><td><b>' + a[0] + '</b><small>' + a[1] + '</small></td><td>' + chip(a[2], a[2] === 'Ativo' ? 'ok' : 'warn') + '</td><td>' + chip(a[3], a[3] === 'Crítica' ? 'bad' : 'org') + '</td><td>' + chip(a[4], a[4] === 'Sem plano' ? 'mute' : 'ln') + '</td><td>' + a[5] + '</td></tr>').join('') + '</tbody></table></div>';
}
function assetPage(c) {
  const tab = S.assetTab, done = MAIN.st === 'concluida' || MAIN.srSt === 'convertido';
  const tabs = [['det', 'Detalhes'], ['cmp', 'Componentes'], ['doc', 'Documentos · 3'], ['man', 'Manual IA'], ['os', 'Ordens de serviço'], ['prog', 'Programa de manutenção'], ['par', 'Paradas'], ['lei', 'Leituras']];
  const hist = (MAIN.srSt === 'convertido' ? [[MAIN.code, MAIN.title, MAIN.st, '15/10/2026', MAIN.tech || '—']] : []).concat([['OS-00351', 'Chiller 01 com alarme de alta pressão', 'concluida', '11/09/2026', 'Carlos Mendes'], ['OS-00322', 'PMOC mensal - Casa de Máquinas', 'concluida', '05/09/2026', 'Rafael Souza'], ['OS-00274', 'Vazamento no circuito de água gelada', 'concluida', '18/07/2026', 'Carlos Mendes'], ['OS-00240', 'PMOC mensal - Casa de Máquinas', 'concluida', '05/07/2026', 'Rafael Souza'], ['OS-00198', 'Chiller 01 com alarme de alta pressão', 'concluida', '02/05/2026', 'Carlos Mendes']]);
  let body;
  if (tab === 'os') body = '<table class="tbl"><thead><tr><th>Código</th><th>Resumo</th><th>Status</th><th>Data</th><th>Técnico</th></tr></thead><tbody>' + hist.map(h => '<tr data-act="os-open" data-code="' + h[0] + '" class="' + (h[0] === MAIN.code ? 'main' : '') + '"><td class="cd">' + h[0] + '</td><td>' + h[1] + '</td><td>' + stChip(h[2]) + '</td><td>' + h[3] + '</td><td>' + h[4] + '</td></tr>').join('') + '</tbody></table>';
  else if (tab === 'prog') body = '<h3>Programa de manutenção</h3><div class="prog"><div><b>PM-002 · PMOC mensal - Climatização</b><small>Coberto pelo local · próxima em 20 de out. · por tempo</small></div><div><b>PM-019 · Semestral - Análise de óleo do compressor</b><small>Próxima em 12 de jan. · por tempo</small></div></div>';
  else if (tab === 'det') body = '<div class="ag"><div><small class="lbl">IDENTIFICAÇÃO</small><h3>Dados do equipamento</h3><div class="kv"><div><small>FABRICANTE</small>Carrier</div><div><small>MODELO</small>30HXC 150</div><div><small>NÚMERO DE SÉRIE</small>CAR349523</div><div><small>CATEGORIA</small>Climatização</div><div><small>LOCALIZAÇÃO</small>Casa de Máquinas</div><div><small>CLIENTE</small>' + HSA + '</div></div></div>' +
    '<div><small class="lbl">CUSTO & GARANTIA</small><h3>Aquisição</h3><div class="kv"><div><small>VALOR DE COMPRA</small>R$ 890.000</div><div><small>GARANTIA ATÉ</small>10 de mar. de 2021</div><div><small>CUSTO DE MANUTENÇÃO (12 MESES)</small>' + (MAIN.st === 'concluida' ? 'R$ 9.842,60' : 'R$ 8.612,00') + '</div></div></div></div>';
  else body = '<h3>' + tabs.find(t => t[0] === tab)[1].replace(/ · \d+/, '') + '</h3><p class="mut">' + ({ cmp: 'Compressores, condensador e ventiladores cadastrados como componentes, com histórico de troca.', doc: 'Manual do fabricante, ART e relatórios PMOC.', man: 'O manual do equipamento lido pela IA: pergunte e receba a resposta com a página de origem.', par: 'Paradas registradas, com o tempo de equipamento parado.', lei: 'Leituras de pressão, temperatura e horímetro ao longo do tempo.' }[tab]) + '</p>';
  c.innerHTML = '<div class="osh"><div class="ochips"><span class="chip pur">CHL-001</span>' + chip('ATIVO', 'ok') + chip('Crítica', 'bad') + '<span class="chip ln">Coberto pelo local</span></div><h1>Chiller 01 - Água Gelada 150 TR</h1>' +
    '<div class="crumb">' + oi('pin', 14) + 'Casa de Máquinas · ' + HSA + ' <span>Carrier · 30HXC 150</span><span>SN CAR349523</span></div><div class="oact"><span class="btn" data-act="soon">' + oi('pen', 15) + 'Editar</span><span class="btn" data-act="qr">' + oi('qr', 15) + 'QR Code</span></div></div>' +
    '<div class="og"><div class="ol"><div class="otabs">' + tabs.map(([k, l]) => '<span class="' + (k === tab ? 'on' : '') + '" data-act="as-tab" data-t="' + k + '">' + l + '</span>').join('') + '</div><div class="card otp">' + body + '</div></div>' +
    '<div class="or"><div class="card sbx" id="falha"><small class="lbl">ÚLTIMOS 12 MESES</small><h3>O que mais falha</h3><div class="mini m4"><div><b>' + (done ? 4 : 3) + '</b><small>Corretivas</small></div><div><b>' + (done ? 3 : 2) + '</b><small>Chamados</small></div><div><b>' + (done ? 4 : 3) + '</b><small>Com causa</small></div><div><b>' + (done ? '15/10' : '11/09') + '</b><small>Última falha</small></div></div><div class="cause"><span>Alta pressão de descarga</span><i style="width:' + (done ? 75 : 67) + '%"></i><b>' + (done ? 3 : 2) + '</b></div><div class="cause"><span>Vazamento no circuito</span><i style="width:' + (done ? 25 : 33) + '%"></i><b>1</b></div></div>' +
    '<div class="card sbx"><small class="lbl">PREVENTIVA</small><h3>Coberto pelo local</h3><p class="mut">PMOC mensal da Casa de Máquinas · próxima em 20 de out.</p><span class="lk" data-go="preventive">Ver no calendário ›</span></div></div></div>';
}
function customersPage(c) {
  c.innerHTML = ph('Clientes', 'As empresas que a sua equipe atende', '<span class="btn" data-act="soon">Importar clientes</span>' + jbtn() + '<span class="btn pri" data-act="soon">+ Novo cliente</span>') +
    '<div class="card tc"><table class="tbl"><thead><tr><th>Cliente</th><th>Cidade</th><th>Unidades</th><th>Ativos</th><th>OS abertas</th></tr></thead><tbody>' +
    CLIENTS.map(r => '<tr class="' + (r[0] === HSA ? 'main' : '') + '"><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td>' + r[4] + '</td></tr>').join('') + '</tbody></table></div>';
}

/* --- preventiva --- */
function pmPage(c) {
  const wd = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  let cells = '';
  for (let i = 0; i < 35; i++) {
    const d = new Date(2026, 8, 27 + i), out = d.getMonth() !== 9, n = d.getDate(), cnt = !out && PMCAL[n];
    cells += '<div class="pc' + (out ? ' out' : '') + (!out && n === 15 ? ' today' : '') + '"><span>' + n + '</span>' + (cnt ? '<em' + (n === 20 ? ' class="hlc"' : '') + '>' + cnt + '</em>' : '') + '</div>';
  }
  c.innerHTML = '<div class="kr">' + kpi('PLANOS ATIVOS', 15, '15 por tempo · 0 por uso') + kpi('PRÓXIMOS 7 DIAS', 6, 'agendados') + kpi('ADERÊNCIA (MÊS)', '92%', '11/12 concluídas no prazo', '#4d7a04') + kpi('ATRASADOS', 0, '') + kpi('CAPACIDADE (MÊS)', '68%', '49h de 72h disponíveis') + '</div>' +
    '<div class="pmg"><div class="card pcal"><div class="cth"><b>CALENDÁRIO PM</b><span class="mo2">Outubro de 2026</span><div class="sp"></div><span class="btn sm" data-act="soon">Simulador</span><span class="btn sm" data-act="soon">Hoje</span></div><div class="pwd">' + wd.map(w => '<span>' + w + '</span>').join('') + '</div><div class="pgrid">' + cells + '</div></div>' +
    '<div class="card pnx"><div class="cth"><b>PRÓXIMAS</b><small>15 planos</small><div class="sp"></div><span class="btn sm pri" data-act="soon">Criar plano</span></div>' + PMS.map((p, i) => '<div class="pmr' + (i === 0 ? ' main' : '') + '"><em>' + p[0] + '</em><div><b>' + p[2] + '</b><small>' + p[1] + ' · ' + p[3] + ' · Por tempo</small></div></div>').join('') + '</div></div>';
}

/* --- SLA --- */
function slaPage(c) {
  const prz = [[MAIN.code, 'SLA Alta prioridade', MAIN.st === 'concluida' ? 'CUMPRIDO' : 'vence 15:55', MAIN.st === 'concluida' ? 'ok' : 'warn'], ['OS-00409', 'SLA Alta prioridade', '22 h restantes', 'ln'], ['OS-00411', 'SLA Padrão', '1 d 3 h restantes', 'ln'], ['OS-00404', 'SLA Padrão', '2 d 1 h restantes', 'ln']];
  c.innerHTML = '<div class="vt"><span class="on">SLA</span><span data-act="soon">Políticas</span><span data-act="soon">Calendários</span><span data-act="soon">Histórico de avisos</span><div class="sp"></div><span class="btn pri" data-act="soon">Criar nova política</span></div>' +
    '<div class="kr">' + kpi('Taxa de conformidade', '93,4%', 'meta 90%', '#4d7a04') + kpi('Violações', 3, 'no mês', '#dc2626') + kpi('Tempo médio de resposta', '34m', '') + kpi('Tempo médio de resolução', '5h 12m', '') + '</div>' +
    '<div class="dg3"><div class="card"><div class="cth"><b>Tendência de conformidade</b><small>Meta 90%</small></div>' + spark([84, 86, 85, 88, 90, 89, 91, 92, 93.4]) + '</div>' +
    '<div class="card"><div class="cth"><b>Violações por prioridade</b></div>' + [['Crítica', 1], ['Alta', 0], ['Média', 2]].map(([l, v]) => '<div class="cause"><span>' + l + '</span><i style="width:' + v * 40 + '%"></i><b>' + v + '</b></div>').join('') + '<div class="cth" style="margin-top:14px"><b>Equipamentos que mais violaram</b></div><div class="cause"><span>Câmara Fria Congelados</span><i style="width:40%"></i><b>1</b></div><div class="cause"><span>Bomba de Incêndio Principal</span><i style="width:40%"></i><b>1</b></div></div>' +
    '<div class="card" id="prazos"><div class="cth"><b>Prazos em andamento</b></div>' + prz.map(p => '<div class="przr' + (p[0] === MAIN.code ? ' main' : '') + '"><span class="cd">' + p[0] + '</span><small>' + p[1] + ' · Resolução</small>' + chip(p[2], p[3]) + '</div>').join('') + '</div></div>' +
    '<div class="pols">' + [['SLA Padrão', 'Horário comercial (seg a sex, 8h às 18h)', '4h', '20h'], ['SLA Alta prioridade', 'Horário comercial · Prioridade Alta', '2h', '8h'], ['SLA Crítico 24x7', '24x7 · Operação crítica', '1h', '4h']].map(p => '<div class="card pol"><b>' + p[0] + '</b><small>' + p[1] + '</small><div><span>RESPOSTA <b>' + p[2] + '</b></span><span>RESOLUÇÃO <b>' + p[3] + '</b></span></div></div>').join('') + '</div>';
}
function spark(pts) {
  const W = 360, H = 120, mn = 80, mx = 100;
  const p = pts.map((v, i) => (i ? 'L' : 'M') + (i / (pts.length - 1) * W).toFixed(1) + ',' + (H - (v - mn) / (mx - mn) * H).toFixed(1)).join(' ');
  const goal = H - (90 - mn) / (mx - mn) * H;
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="spk" preserveAspectRatio="none"><line x1="0" x2="' + W + '" y1="' + goal + '" y2="' + goal + '" stroke="#b45309" stroke-dasharray="5 5"/><path d="' + p + '" fill="none" stroke="#6d26c2" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>';
}

/* --- rotas --- */
function routePage(c) {
  const r = S.route; // 0 vazio, 1 calculando, 2 pronto para revisar, 3 publicado
  const head = '<div class="ph"><div><h2>Rotas</h2><p>Monte a agenda da equipe em poucos cliques</p></div><div class="pa"><span class="chip ln">' + oi('spark', 13) + 'Saldo de IA: R$ 184,30</span></div></div>' +
    '<div class="card rper"><small>PERÍODO</small><div class="fl2"><span class="on">Hoje</span><span>Amanhã</span><span>Esta semana</span><span>Próxima semana</span><span>Personalizado</span></div><span class="mut">9 visitas no período · 3 técnicos</span><div class="sp"></div><span class="btn pri big3" data-act="route-go">' + oi('route', 16) + (r >= 2 ? 'Refazer rotas' : 'Montar rotas') + '</span></div>';
  if (r === 0) { c.innerHTML = head + '<div class="card empty">' + oi('route', 30, 1.4) + '<b>Nenhum plano aberto</b><span>Escolha o período e monte as rotas: o Jonas encaixa as visitas por prioridade, prazo e distância.</span></div>'; return; }
  if (r === 1) { c.innerHTML = head + '<div class="card empty ld"><span class="spin"></span><b>Montando as rotas…</b><span>Cruzando prioridade, SLA, endereço e agenda de cada técnico.</span></div>'; return; }
  const pub = r === 3;
  c.innerHTML = head + '<div class="rg"><div class="card rsum"><small class="lbl">' + oi('spark', 13) + ' RESUMO POR IA</small><p>Entraram 9 visitas para 3 técnicos, com 86 km rodados no dia. A corretiva do Chiller 01 (OS-00412) ficou em primeiro na rota do Carlos Mendes, por ser prioridade alta com SLA correndo. Nenhuma visita ficou de fora.</p>' +
    '<div class="mini"><div><b>3</b><small>técnicos</small></div><div><b>9</b><small>visitas</small></div><div><b>86 km</b><small>no dia</small></div></div><small class="mut">4 otimizações restantes neste plano · Ajustes manuais não consomem otimização.</small>' +
    '<div class="rpub">' + (pub ? '<span class="chip ok big">' + oi('check', 14) + 'Publicado para a equipe às 08:10</span>' : '<span class="btn pri" data-act="route-pub">Publicar para a equipe</span>') + '</div></div>' +
    '<div class="rag"><div class="cth"><b>Agenda por técnico</b><small>Arraste pela alça para mudar a ordem, o dia ou o técnico. Ajustes manuais são gratuitos.</small></div><div class="rcols">' +
    ROUTES.map(([t, s, vs], ti) => '<div class="card rcol"><div class="rth"><span class="av sm">' + t.split(' ').map(w => w[0]).join('') + '</span><div><b>' + t + '</b><small>15/10 (qui) · ' + s + '</small></div></div>' +
      vs.map((v, i) => '<div class="rv' + (v[3] ? ' main' : '') + '" style="animation-delay:' + (ti * 0.12 + i * 0.08) + 's"><em>' + (i + 1) + '</em><div><b>' + v[1] + '</b><small>' + v[2] + '</small></div><span>' + v[0] + '</span></div>').join('') + '</div>').join('') + '</div></div></div>';
}

/* --- rastreamento --- */
const px = x => (x / 1348 * 100).toFixed(2) + '%', py = y => (y / 732 * 100).toFixed(2) + '%';
function trackPage(c) {
  const st = MAIN.st, there = st === 'andamento' || st === 'concluida';
  const pins = [
    { x: there ? 640 : 470, y: there ? 300 : 360, n: 'Carlos Mendes', s: there ? 'No local · ' + HSA : 'A caminho · ' + HSA + ' · chega 09:04', c: '#6d26c2', id: 'pin-carlos' },
    { x: 980, y: 210, n: 'Juliana Rocha', s: 'Em atendimento · Shopping Vale Verde', c: '#4d7a04' },
    { x: 860, y: 520, n: 'Rafael Souza', s: 'Em atendimento · Corporate Tower', c: '#4d7a04' },
  ];
  c.classList.add('mapc');
  c.innerHTML = '<div class="map"><svg viewBox="0 0 1348 732" preserveAspectRatio="none"><rect width="1348" height="732" fill="#e8ece6"/><g stroke="#fff" stroke-width="16" fill="none"><path d="M0 280 C300 250 600 380 1348 300"/><path d="M380 0 C400 280 340 520 430 732"/><path d="M820 0 C780 260 900 520 860 732"/><path d="M0 600 C450 580 900 680 1348 540"/></g><g stroke="#d4dbd1" stroke-width="6" fill="none"><path d="M0 120 L1348 170"/><path d="M1120 0 L1170 732"/><path d="M0 440 L1348 410"/></g>' +
    '<path d="M300 420 C380 400 430 380 470 360 C540 330 590 315 640 300" stroke="#6d26c2" stroke-width="5" stroke-dasharray="12 10" fill="none" opacity=".85"/></svg>' +
    '<div class="pin cl" style="left:' + px(640) + ';top:' + py(300) + '"><b style="background:#201135">' + oi('bldg', 12, 2.2) + '</b><span>' + HSA + '</span></div>' +
    pins.map(p => '<div class="pin" ' + (p.id ? 'id="' + p.id + '" ' : '') + 'style="left:' + px(p.x) + ';top:' + py(p.y) + '"><b style="background:' + p.c + '">' + p.n.split(' ').map(w => w[0]).join('') + '</b></div>').join('') +
    '<div class="mtop"><div class="fl2"><span class="on">Ao vivo · 3 transmitindo</span><span data-act="soon">Histórico</span><span data-act="soon">Análise de deslocamento</span><span data-act="soon">Cercas virtuais</span></div></div>' +
    '<div class="mpanel"><div class="cth"><b>EQUIPE</b><small>3 técnicos online</small></div>' + pins.map(p => '<div class="mrow' + (p.id ? ' main' : '') + '"><b style="background:' + p.c + '"></b><div><strong>' + p.n + '</strong><small>' + p.s + '</small></div></div>').join('') + '</div></div>';
}

/* --- relatórios --- */
const REPORTS = [['Ordens de serviço', 'Abertas, atrasadas, concluídas e backlog por idade, prioridade e responsável.'], ['Manutenção preventiva', 'Previstas contra realizadas e preventivas atrasadas, com reprogramação em lote.'], ['Confiabilidade de ativos', 'Corretivas por ativo, ativos com mais falhas, MTTR, MTBF e tempo parado.'], ['Indicadores por máquina', 'Disponibilidade, MTTR, MTBF, homem-hora e custo, equipamento a equipamento.'], ['Componentes que mais falham', 'Ranking da peça que vive dando problema: recorrência, trocas e custo.'], ['Custos', 'Custo por ativo, por OS e por unidade, com mão de obra e materiais.'], ['Produtividade da equipe', 'OS concluídas, tempo médio e carga por equipe e por técnico.'], ['SLA', 'Aderência por cliente, unidade e contrato, com as violações.'], ['Satisfação do cliente', 'NPS por cliente, unidade e técnico, com o comentário que explica a nota.']];
function anaPage(c) {
  c.innerHTML = ph('Relatórios', 'Indicadores acionáveis: clique para abrir a lista e agir', jbtn() + '<span class="btn" data-act="soon">BI externo</span><span class="btn" data-act="soon">Gerar PMOC</span><span class="btn pri" data-act="soon">Gerar relatório</span>') +
    '<div class="fl2"><span class="on">Últimos 30 dias</span><span>Todos os locais</span><span>Todos os técnicos</span></div>' +
    '<div class="kr" id="anak">' + kpi('MTBF · EQUIPAMENTOS', '312 h', 'média entre falhas') + kpi('MTTR', '3 h 40', 'média de resolução') + kpi('ADERÊNCIA SLA', '93%', 'meta: 90%', '#4d7a04') + kpi('CUSTO / OS', 'R$ 412,00', 'média das OS com custo apurado') + '</div>' +
    '<div class="rpg">' + REPORTS.map((r, i) => '<div class="card rpc" data-act="soon"><b>' + r[0] + '</b><p>' + r[1] + '</p></div>').join('') + '</div>';
}

/* --- Jonas --- */
const JQ = 'Qual ativo mais quebrou nos últimos 90 dias?';
const JA = '<small class="lbl">DETALHAMENTO DO INDICADOR</small><p>O <b>Chiller 01 - Água Gelada 150 TR</b> (Casa de Máquinas, Hospital Santa Aurora) lidera: <b>3 ordens corretivas</b> em 90 dias, 2 delas por alta pressão de descarga. A última foi hoje, a OS-00412, concluída pelo Carlos Mendes às 10:48.</p><p>Em seguida aparecem o Compressor de Ar Parafuso 40 hp e a Câmara Fria Congelados da loja Vila Mariana, com 2 corretivas cada.</p><p class="mut">Estou contando ordens corretivas, não quebras confirmadas. Se quiser ver quais peças dentro do chiller mais falham, posso consultar o ranking de componentes.</p>';
function jonasPage(c) {
  const st = S.jonas; // 0 início, 1 pergunta enviada, 2 respondido
  const sug = [JQ, 'Quantas ordens de serviço estão atrasadas agora?', 'Cadastre estes clientes para mim (vou colar a lista)', 'Quero cadastrar meus fornecedores sem planilha'];
  const conv = st === 0 ? '<div class="jhi">' + oi('spark', 34, 1.4) + '<h2>Olá, ' + CO.user + ', sou o Jonas</h2><p>Eu consulto os dados da sua operação e cadastro clientes, locais e materiais, sempre pedindo sua confirmação antes de gravar.</p><div class="jsg">' + sug.map((s, i) => '<span data-act="' + (i === 0 ? 'jonas-ask' : 'soon') + '">' + s + '</span>').join('') + '</div></div>'
    : '<div class="jmsg u"><p>' + JQ + '</p></div>' + (st === 1 ? '<div class="jmsg a"><span class="jav">' + oi('spark', 15) + '</span><div class="jtyping"><i></i><i></i><i></i><small>Consultando ordens de serviço e ativos…</small></div></div>' : '<div class="jmsg a"><span class="jav">' + oi('spark', 15) + '</span><div class="jans" id="jans">' + JA + '</div></div>');
  c.innerHTML = '<div class="jw"><div class="jl"><div class="vt col"><span class="on">Conversa</span><span data-act="j-org">Organizador</span><span data-act="j-val">Validador</span></div><span class="btn sm pri">+ Nova conversa</span><small class="mut">HOJE</small>' + (st ? '<div class="jh on">' + JQ + '</div>' : '') + '<div class="jh">Quantas ordens de serviço estão atrasadas agora?</div><div class="jh">Monte a agenda da próxima semana</div></div>' +
    '<div class="jr"><div class="jtop"><b>' + oi('spark', 18) + 'Jonas</b><small>Pergunte sobre ordens de serviço, ativos e indicadores da sua empresa</small><div class="sp"></div><span class="chip ln">Saldo de IA: R$ 184,30</span></div><div class="jbody" id="jbody">' + conv + '</div>' +
    '<div class="jin"><span id="jinput">' + (S.jtyping || 'Pergunte ao Jonas…') + '</span><small>Ctrl+Enter para enviar</small><span class="jsend" data-act="jonas-ask">' + oi('send', 16) + '</span></div></div></div>';
}

/* --- telas resumidas --- */
function softPage(c, t, sub, txt) {
  c.innerHTML = ph(t, sub) + '<div class="card soft">' + oi('grid', 28, 1.4) + '<b>' + t + ' no Auvo OPS</b><p>' + txt + '</p><small>Nesta demonstração, esta tela não está detalhada. Siga as missões para ver o fluxo principal.</small></div>';
}

/* ---------------- render ---------------- */
function render() {
  const P = PAGES[S.page];
  const route = S.page === 'os' ? 'work-orders/' + (S.opts.code || MAIN.code).toLowerCase() : P.route;
  win.innerHTML = '<div class="chrome"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="url">app.auvocmms.com/' + route + '</div></div>' +
    '<div class="wbody ops">' + sideHTML() + topHTML() + '<div class="content" id="content"></div><div id="layer"></div><div id="toast"></div></div>';
  const c = $('#content');
  P.build(c);
  renderModal();
  if (P.mission) mark(P.mission);
  requestAnimationFrame(() => c.classList.add('in'));
  refreshHints();
  makeFocusable();
  window.gameOnRender && window.gameOnRender();
}
function rebuild() { const c = $('#content'); if (!c) return render(); const sc = c.scrollTop; PAGES[S.page].build(c); c.scrollTop = sc; makeFocusable(); refreshHints(); }
function makeFocusable() {
  $$('[data-go],[data-act],[data-menu]', win).forEach(el => {
    if (el.tabIndex >= 0) return;
    el.tabIndex = 0;
    if (!el.getAttribute('role')) el.setAttribute('role', 'button');
  });
}
document.addEventListener('keydown', e => {
  const t = e.target;
  if ((e.key === 'Enter' || e.key === ' ') && t && t.matches && t.matches('[data-go],[data-act],[data-menu]') && win.contains(t)) { e.preventDefault(); t.click(); }
});
function go(id, opts) { S.page = id; S.opts = opts || {}; S.modal = null; if (id === 'os') S.osTab = (opts && opts.tab) || 'det'; if (id === 'asset') S.assetTab = (opts && opts.tab) || 'det'; render(); }
function say(t, d) { S.cap = t || ''; S.capd = d || ''; if (window.lowerThird) window.lowerThird(S.cap, S.capd); }
let toastT;
function toast(msg) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2300); }

/* ---------------- janelas ---------------- */
function qrModal() {
  // QR ilustrativo (padrão fixo, não aponta para nenhum endereço)
  let cells = '';
  const N = 21, seed = 'CHL001-santa-aurora';
  const bit = (x, y) => { const f = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); if (f) { const a = x > 13 ? x - 14 : x, b = y > 13 ? y - 14 : y; return a === 0 || a === 6 || b === 0 || b === 6 || (a > 1 && a < 5 && b > 1 && b < 5); } return (seed.charCodeAt((x * 7 + y * 3) % seed.length) * (x + 3) * (y + 5)) % 7 < 3; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (bit(x, y)) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
  return '<div class="ov"><div class="md sm2"><div class="mhr"><h3>QR Code do ativo</h3><span class="x" data-act="close" aria-label="Fechar">' + oi('x', 18) + '</span></div><div class="mbr qrb"><svg viewBox="-2 -2 25 25" width="210" height="210" shape-rendering="crispEdges"><rect x="-2" y="-2" width="25" height="25" fill="#fff"/><g fill="#201135">' + cells + '</g></svg>' +
    '<div><b>Chiller 01 - Água Gelada 150 TR</b><span>CHL-001 · Casa de Máquinas</span><p>Cole a etiqueta no equipamento. Quem ler o QR com o celular abre a ficha, o histórico e pode pedir manutenção ali mesmo.</p><span class="btn pri" data-act="soon">Imprimir etiqueta</span></div></div></div></div>';
}
// aplicativo do técnico (simulação): check-in, checklist, assinatura do cliente e conclusão
function appModal(m) {
  const step = m.step || 0;
  const head = '<div class="phd"><span>09:4' + step + '</span><span>●●● 4G ▮</span></div><div class="pht"><b>' + MAIN.code + '</b><small>' + MAIN.title + '</small></div>';
  let body;
  if (step === 0) body = '<div class="pst"><div class="ok">' + oi('pin', 15) + 'Check-in no local às 09:05 · a 24 m</div><div class="ok">' + oi('check', 15) + 'Checklist de corretiva · 5 de 5</div><div class="ok">' + oi('box', 15) + 'Material: R-410A · 1 un</div><div>' + oi('pen', 15) + 'Assinatura do cliente</div></div><span class="pbt" data-act="sig-start">Coletar assinatura</span>';
  else if (step === 1) body = '<p class="psb">Assinatura de <b>' + MAIN.by + '</b><br><small>Engenharia clínica · ' + HSA + '</small></p><div class="sigwrap"><canvas id="sigpad" width="520" height="300"></canvas><span class="sgph" id="sgph">Assine aqui</span></div><div class="pbr"><span class="pbt ln" data-act="sig-clear">Limpar</span><span class="pbt" data-act="sig-ok">Confirmar</span></div>';
  else body = '<div class="pdone">' + oi('check', 34, 2.4) + '<b>OS concluída</b><small>Assinatura coletada às 10:47 · enviada para o painel</small></div><span class="pbt ln" data-act="close">Voltar ao painel</span>';
  return '<div class="ov app"><div class="appw"><div class="aplab">' + oi('phone', 14) + 'Simulação do aplicativo do técnico<span class="x" data-act="close" aria-label="Fechar">' + oi('x', 16) + '</span></div><div class="phone">' + head + '<div class="pbd">' + body + '</div></div></div></div>';
}
function renderModal() {
  const L = $('#layer'); if (!L) return;
  const m = S.modal;
  if (!m) { L.innerHTML = ''; refreshHints(); return; }
  L.innerHTML = m.type === 'qr' ? qrModal() : appModal(m);
  const ov = $('.ov', L); makeFocusable(); bindPad();
  if (m.shown) ov.classList.add('in'); else { m.shown = true; requestAnimationFrame(() => ov.classList.add('in')); window.gameOnModal && window.gameOnModal(m.type); }
  refreshHints();
}
let PADCTX = null, PADDOWN = false;
function bindPad() {
  const cv = $('#sigpad'); if (!cv) { PADCTX = null; return; }
  PADCTX = cv.getContext('2d'); PADCTX.lineWidth = 4; PADCTX.lineCap = 'round'; PADCTX.lineJoin = 'round'; PADCTX.strokeStyle = '#1e2a6b';
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); padPoint(x, y, true); });
  cv.addEventListener('pointermove', e => { if (PADDOWN) { const [x, y] = pos(e); padPoint(x, y, false); } });
  const up = () => { PADDOWN = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
}
function padPoint(x, y, start) {
  if (!PADCTX) return;
  if (start) { PADDOWN = true; PADCTX.beginPath(); PADCTX.moveTo(x, y); PADCTX.lineTo(x + 0.1, y + 0.1); PADCTX.stroke(); }
  else { PADCTX.lineTo(x, y); PADCTX.stroke(); PADCTX.beginPath(); PADCTX.moveTo(x, y); }
  if (S.modal && !S.modal.ink) { S.modal.ink = true; refreshHints(); }
  const ph2 = $('#sgph'); if (ph2) ph2.style.display = 'none';
}
window.padFrac = (fx, fy, start) => { const cv = $('#sigpad'); if (cv) padPoint(fx * cv.width, fy * cv.height, start); };
window.padEnd = () => { PADDOWN = false; };

/* ---------------- história (estado compartilhado com o tour) ---------------- */
function approveSR() { if (MAIN.srSt !== 'pendente') return; MAIN.srSt = 'convertido'; mark('sr'); track('sr_approved'); }
function publishRoutes() { S.route = 3; if (MAIN.st === 'aberta') { MAIN.st = 'atribuida'; MAIN.tech = 'Carlos Mendes'; } mark('rotas'); }
function checkIn() { if (MAIN.st === 'aberta' || MAIN.st === 'atribuida') { MAIN.st = 'andamento'; MAIN.tech = 'Carlos Mendes'; MAIN.mat = true; } }
function concludeOS(sig) { MAIN.st = 'concluida'; MAIN.signed = true; if (sig) MAIN.sigData = sig; MAIN.summary = MAIN.summary === 'typing' ? true : MAIN.summary; mark('sign'); track('signed'); }
window.storyReset = () => { Object.assign(MAIN, { st: 'aberta', tech: null, srSt: 'pendente', signed: false, sigData: null, mat: false, summary: false }); S.route = 0; S.jonas = 0; S.jtyping = ''; S.srTab = 'pend'; };

/* ---------------- ações ---------------- */
function act(a, el) {
  if (a === 'mmenu') { const s = $('#msheet', win); if (s) s.remove(); else $('.wbody', win).insertAdjacentHTML('beforeend', sheetHTML()); makeFocusable(); refreshHints(); return; }
  if (a === 'mclose') { const s = $('#msheet', win); if (s) s.remove(); refreshHints(); return; }
  if (a === 'close') { const back = S.modal && S.modal.type === 'app' && S.modal.step === 2; S.modal = null; if (back) return render(); return renderModal(); }
  if (a === 'sr-tab') { S.srTab = el.dataset.t; return rebuild(); }
  if (a === 'sr-ok') { approveSR(); toast('Chamado aprovado. ' + MAIN.code + ' criada com o SLA Alta prioridade.'); return rebuild(); }
  if (a === 'os-open') { const code = el.dataset.code; if (code === MAIN.code && MAIN.srSt !== 'convertido') return toast('Aprove o chamado primeiro.'); return go('os', { code }); }
  if (a === 'os-tab') { S.osTab = el.dataset.t; return rebuild(); }
  if (a === 'os-sum') { if (!MAIN.summary) { MAIN.summary = 'typing'; mark('os'); } rebuild(); const j = $('#jsum', win); if (j && j.scrollIntoView && MOB) j.scrollIntoView({ block: 'center' }); return; }
  if (a === 'os-assign') { if (MAIN.st === 'aberta') { MAIN.st = 'atribuida'; MAIN.tech = 'Carlos Mendes'; toast('OS atribuída a Carlos Mendes.'); } return rebuild(); }
  if (a === 'mat-add') { if (MAIN.st === 'aberta' || MAIN.st === 'atribuida') return toast('O consumo é lançado depois do check-in do técnico.'); MAIN.mat = true; toast('Consumo lançado. Estoque e custo atualizados.'); return rebuild(); }
  if (a === 'app-open') { if (MAIN.st === 'concluida') return; checkIn(); S.modal = { type: 'app', step: 0 }; rebuild(); return renderModal(); }
  if (a === 'sig-start') { S.modal.step = 1; S.modal.ink = false; return renderModal(); }
  if (a === 'sig-clear') { const cv = $('#sigpad'); if (cv && PADCTX) { PADCTX.clearRect(0, 0, cv.width, cv.height); S.modal.ink = false; const p = $('#sgph'); if (p) p.style.display = ''; refreshHints(); } return; }
  if (a === 'sig-ok') { const cv = $('#sigpad'); if (!S.modal.ink) return toast('Desenhe a assinatura antes de confirmar.'); concludeOS(cv.toDataURL('image/png')); S.modal.step = 2; S.osTab = 'ass'; renderModal(); return; }
  if (a === 'asset-open') { if (el.dataset.c !== 'CHL-001') return toast('Nesta demonstração, a ficha completa é a do Chiller 01.'); return go('asset'); }
  if (a === 'as-tab') { S.assetTab = el.dataset.t; return rebuild(); }
  if (a === 'qr') { S.modal = { type: 'qr' }; mark('ativo'); return renderModal(); }
  if (a === 'route-go') { S.route = 1; rebuild(); setTimeout(() => { if (S.route === 1) { S.route = 2; if (S.page === 'routing') rebuild(); } }, S.mode === 'guided' ? 1400 : 1600); return; }
  if (a === 'route-pub') { publishRoutes(); toast('Agenda publicada. Cada técnico recebeu a rota no aplicativo.'); return rebuild(); }
  if (a === 'jonas-ask') { if (S.jonas) return; jonasAsk(); return; }
  if (a === 'j-org') return toast('Organizador: os planejamentos de agenda montados pelo Jonas e o que aconteceu com cada um.');
  if (a === 'j-val') return toast('Validador: audita as OS concluídas contra as regras da sua empresa.');
  if (a === 'dl') return toast('Arquivo gerado e enviado para os downloads.');
  if (a === 'star') return window.gameStar && window.gameStar(el);
  if (a === 'soon') return toast('Recurso do OPS ilustrado nesta demonstração.');
}
async function jonasAsk(sig) {
  S.jonas = 1; S.jtyping = ''; rebuild();
  await (sig ? pwait(1700, sig) : sleep(1700));
  if (S.jonas !== 1) return;
  S.jonas = 2; mark('jonas'); track('jonas_ask'); if (S.page === 'jonas') rebuild();
}
win.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) { const sh = $('#msheet', win); if (sh) sh.remove(); return go(g.dataset.go); }
  const a = e.target.closest('[data-act]');
  if (a) return act(a.dataset.act, a);
});

/* ---------------- missões, dicas e barra inferior ---------------- */
const MISSION_HELP = { sr: 'Abra Central de atendimento e aprove o chamado do Chiller 01', os: 'Abra a OS-00412 e clique em “Resumir com o Jonas”', rotas: 'Abra Rotas, monte as rotas e publique para a equipe', sign: 'Na OS-00412, clique em “Ver no app do técnico” e colete a assinatura', ativo: 'Abra Ativos › Chiller 01 e clique em “QR Code”', pm: 'Abra Preventiva no menu', sla: 'Abra SLA no menu', jonas: 'Clique em Jonas e escolha uma pergunta' };
const navSel = id => MOB ? ($('#msheet', win) ? '#msheet [data-go="' + id + '"]' : '.mnav') : '.sb [data-go="' + id + '"]';
function targetFor(k) {
  if (S.modal) {
    if (S.modal.type === 'app') { if (S.modal.step === 0) return '[data-act="sig-start"]'; if (S.modal.step === 1) return S.modal.ink ? '[data-act="sig-ok"]' : '.sigwrap'; return '.appw [data-act="close"]'; }
    return '.ov [data-act="close"]';
  }
  const conv = MAIN.srSt === 'convertido';
  if (k === 'sr') return S.page === 'sr' ? (S.srTab === 'pend' || true ? '[data-act="sr-ok"]' : null) : navSel('sr');
  if (k === 'os' || k === 'sign') {
    if (!conv) return S.page === 'sr' ? '[data-act="sr-ok"]' : navSel('sr');
    if (S.page === 'os' && (!S.opts.code || S.opts.code === MAIN.code)) return k === 'os' ? '[data-act="os-sum"]' : '[data-act="app-open"]';
    if (S.page === 'wos') return 'tr.main';
    if (S.page === 'sr') return '#srmain [data-act="os-open"]';
    return navSel('wos');
  }
  if (k === 'rotas') return S.page === 'routing' ? (S.route === 2 ? '[data-act="route-pub"]' : S.route === 1 ? null : '[data-act="route-go"]') : navSel('routing');
  if (k === 'ativo') return S.page === 'asset' ? '[data-act="qr"]' : S.page === 'assets' ? 'tr.main' : navSel('assets');
  if (k === 'pm') return navSel('preventive');
  if (k === 'sla') return navSel('sla');
  if (k === 'jonas') return S.page === 'jonas' ? (S.jonas ? null : '.jsg [data-act="jonas-ask"]') : (MOB ? navSel('jonas') : '.sbj');
  return null;
}
function hintFor(k) {
  if (S.modal && S.modal.type === 'qr') return 'Feche o QR Code para seguir';
  if (S.modal && S.modal.type === 'app') return S.modal.step === 0 ? 'No app, toque em “Coletar assinatura”' : S.modal.step === 1 ? (S.modal.ink ? 'Toque em “Confirmar”' : 'Desenhe a assinatura no quadro branco') : 'Volte ao painel';
  const conv = MAIN.srSt === 'convertido';
  if ((k === 'os' || k === 'sign') && !conv) return 'Antes, aprove o chamado em Central de atendimento';
  if (k === 'rotas' && S.page === 'routing' && S.route === 2) return 'Revise e clique em “Publicar para a equipe”';
  return MISSION_HELP[k];
}
let nudgeT = 0;
const ARROW = '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 3 6 17h7v15h10V17h7z" fill="#baff54" stroke="#201135" stroke-width="2.2" stroke-linejoin="round"/></svg>';
function placeArrow(el, big) {
  let ar = $('#arrow');
  if (!ar) { ar = document.createElement('div'); ar.id = 'arrow'; ar.innerHTML = ARROW; $('#stage').appendChild(ar); }
  if (!el) { ar.className = ''; return; }
  const b = centerOf(el, 0.5, 1), t = centerOf(el, 0.5, 0), below = b.y < SH - 120;
  ar.style.left = b.x + 'px'; ar.style.top = (below ? b.y + 4 : t.y - 4) + 'px';
  ar.className = 'on ' + (below ? 'below' : 'above') + (big ? ' big' : '');
}
function armNudge(el) {
  clearTimeout(nudgeT); placeArrow(null); $$('.nudge').forEach(x => x.classList.remove('nudge'));
  if (!el) return;
  nudgeT = setTimeout(() => { placeArrow(el, false); nudgeT = setTimeout(() => { el.classList.add('nudge'); placeArrow(el, true); }, 5000); }, 3500);
}
win.addEventListener('scroll', () => { if (S.mode === 'explore') armNudge($('.hot', win)); }, true);
win.addEventListener('pointerdown', () => { if (S.mode !== 'explore') return; armNudge($('.hot', win)); });
function refreshHints() {
  $$('.hot').forEach(x => x.classList.remove('hot'));
  updateBottom();
  const nx = S.mode === 'explore' && MISSIONS.find(m => !S.visited.has(m.k));
  const q = nx && targetFor(nx.k), el = q && $(q, win);
  if (el) el.classList.add('hot');
  armNudge(el);
}
function mark(k) {
  if (S.mode !== 'explore' || S.visited.has(k)) return;
  S.visited.add(k);
  track('mission', { mission: k, done: S.visited.size });
  window.gameOnMission && window.gameOnMission(k);
  setTimeout(() => { updateBottom(); refreshHints(); if (S.visited.size === MISSIONS.length) setTimeout(() => showEnd(true), 1600); }, 200);
}
function updateBottom() {
  const b = $('#bot'); if (!b) return;
  if (S.mode === 'hero') { b.className = 'bot off'; document.body.style.setProperty('--botH', '0px'); return; }
  b.className = 'bot';
  if (S.mode === 'explore') {
    const done = S.visited.size, n = MISSIONS.length, nx = MISSIONS.find(m => !S.visited.has(m.k)), simple = document.body.classList.contains('simple');
    b.innerHTML = '<div class="bx"><div class="cur">' + (nx ? '<span class="badge">Missão ' + (MISSIONS.indexOf(nx) + 1) + ' de ' + n + '</span><strong>' + nx.t + '</strong><small>' + hintFor(nx.k) + '</small>' : '<span class="badge ok">Concluído</span><strong>Todas as missões cumpridas</strong>') + '</div>' +
      (window.gameHud ? window.gameHud() : '') +
      '<div class="acts">' + (nx ? '<button class="gbtn" data-t="skip" title="Pular esta missão">Pular</button>' : '') + '<button class="gbtn" data-t="list" aria-expanded="' + !!S.listOpen + '">' + IC.list + '<span>Missões</span><em class="cnt">' + done + '/' + n + '</em></button></div>' +
      (S.listOpen ? '<div class="pop"><b>Missões · ' + done + '/' + n + '</b>' + MISSIONS.map(m => '<div class="' + (S.visited.has(m.k) ? 'd' : '') + '"><span>' + (S.skipped.has(m.k) ? '↷' : S.visited.has(m.k) ? '✓' : '○') + '</span>' + m.t + '</div>').join('') + '<div class="pf"><button class="gbtn" data-t="tour">' + IC.play + '<span>Ver o tour guiado</span></button><label class="sw"><input type="checkbox" data-t="simple" ' + (simple ? 'checked' : '') + '> Modo simples (sem pontos)</label></div></div>' : '') + '</div>';
  } else if (window.tourBottomSync) window.tourBottomSync();
  document.body.style.setProperty('--botH', b.offsetHeight + 'px'); fitStage();
}

/* ---------------- modos ---------------- */
function heroHTML() {
  $('#hero').innerHTML = '<div class="hcopy">' +
    '<div class="heb"><i></i>Convite exclusivo · Auvo OPS</div>' +
    '<h1><span>Do chamado</span><span>ao indicador.</span><span class="g">Com IA junto.</span></h1>' +
    '<p>O Auvo OPS está sendo liberado para um grupo selecionado de clientes. Veja em 3 minutos um dia de manutenção nele: do chamado no Portal ao indicador, com o Jonas ajudando em cada passo.</p>' +
    '<div class="hcta"><button class="pbtn" id="hGuided"><span class="pi">' + IC.play + '</span>Começar o tour</button><button class="lnkbtn" id="hExplore">Explorar por conta própria <span class="ch">›</span></button></div>' +
    '<div class="proof">' + SALES.proof.map(([b, s]) => '<div><b>' + b + '</b><small>' + s + '</small></div>').join('') + '<span class="src">' + SALES.proofSrc + '</span></div>' +
    '<div class="hnt" id="hnt" aria-hidden="true"></div></div>';
  $('#hGuided').onclick = () => (window.beginTour ? window.beginTour() : startGuided(0));
  $('#hExplore').onclick = () => enterExplore();
}
function setMode(m) {
  S.mode = m;
  win.classList.toggle('hero', m === 'hero'); document.body.classList.toggle('is-hero', m === 'hero');
  if (m === 'guided') camSet('wide'); else { win.classList.remove('cam-wide', 'cam-in'); }
  $('#hero').classList.toggle('off', m !== 'hero');
  $('#stage').classList.toggle('guided', m === 'guided');
  $('.seg').dataset.on = m === 'hero' ? '' : m;
  $('#mGuided').classList.toggle('on', m === 'guided'); $('#mGuided').setAttribute('aria-pressed', m === 'guided');
  $('#mExplore').classList.toggle('on', m === 'explore'); $('#mExplore').setAttribute('aria-pressed', m === 'explore');
  S.listOpen = false;
  if (m !== 'guided') {
    if (window.stopTour) window.stopTour();
    if (window.hideCard) window.hideCard();
    if (window.narr) window.narr.stop();
    setPaused(false);
  }
  if (m !== 'guided' && m !== 'hero-keep' && window.storyReset && !(m === 'explore' && setMode.keep)) window.storyReset();
  setMode.keep = false;
  if (m === 'explore') setHash('explorar'); else if (m === 'hero') setHash('');
  if (m !== 'hero') track('mode', { mode: m });
  say(''); showCursor(m === 'guided' || m === 'hero');
  $('#quiz').classList.remove('on');
  if (window.heroDemo) window.heroDemo(m === 'hero');
  if (window.heroNotes) window.heroNotes(m === 'hero');
  if (window.gameOnMode) window.gameOnMode(m);
  $('#end').classList.remove('on');
  updateBottom(); refreshHints();
  if (window.narr) window.narr.sync();
}
// "Assumir o controle" mantém a tela e o ponto da história em que o tour estava
function enterExplore(keep) { setMode.keep = keep === true; setMode('explore'); if (keep === true) render(); else go('dashboard'); }
function startGuided(i) { setMode('guided'); window.runTour(i || 0, true); }
const MOD_NAME = { dashboard: 'Painel', wos: 'Ordens de serviço', sr: 'Central de atendimento', assets: 'Ativos', preventive: 'Preventiva', sla: 'SLA', routing: 'Rotas', tracking: 'Rastreamento', analytics: 'Relatórios', jonas: 'Jonas' };
function showEnd(explored) { window.finale(explored); }

$('#mGuided').onclick = () => startGuided(0);
$('#mExplore').onclick = () => enterExplore();
heroHTML();
fitStage();
go('dashboard');
setMode('hero');
Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), sleep(700)])
  .then(() => requestAnimationFrame(() => document.body.classList.remove('preload')));
