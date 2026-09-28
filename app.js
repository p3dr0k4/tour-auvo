// ============================================================
// App simulado: Agenda (calendário) como tela principal, menus reais,
// páginas geradas a partir do mapa, modais (OS, nova tarefa, AuvoHub),
// missões do modo explorar e a barra inferior.
// ============================================================
const win = $('#win');
const S = { app: 'core', page: 'agenda', opts: {}, mode: 'hero', visited: new Set(), modal: null, cap: '', listOpen: false, skipped: new Set() };

const MISSIONS = [
  { k: 'os', t: 'Abrir uma OS na agenda' },
  { k: 'sign', t: 'Assinar a OS digital' },
  { k: 'desk', t: 'Seguir o ticket até o AuvoDesk' },
  { k: 'fin', t: 'Ver o financeiro' },
  { k: 'pmoc', t: 'Abrir o PMOC' },
  { k: 'rel', t: 'Ver um relatório' },
  { k: 'mapa', t: 'Acompanhar a equipe no mapa' },
  { k: 'hub', t: 'Conhecer o AuvoHub' },
];

LISTS.dconfig = {
  app: 'desk', route: 'ConfiguracoesGerais', dmenu: 'Configurações', title: 'Configurações gerais', btns: ['+ Adicionar campo'], search: false,
  cols: ['Campo do ticket', 'Visibilidade', 'Tipo'],
  rows: [['Título', 'Interno/Externo', 'Texto'], ['Cliente', 'Externo', 'Seleção'], ['Prioridade', 'Externo', 'Seleção'], ['Tipo de solicitação', 'Interno/Externo', 'Seleção'], ['Equipamento', 'Interno', 'Seleção']],
};

// ---- integração: modo embutido, links diretos e eventos ----
// ?embed=1 esconde o cabeçalho (uso em iframe). #chamado, #assinatura... abrem o tour naquele capítulo; #explorar abre o modo livre.
const INIT_HASH = location.hash.slice(1); // lido antes de o modo "hero" limpar o hash
if (new URLSearchParams(location.search).get('embed') === '1') document.body.classList.add('embed');
function track(name, data) {
  try { if (window.va) window.va('event', { name, data }); } catch (e) { /* analytics ausente */ }
  try { if (window.parent !== window) window.parent.postMessage({ source: 'auvo-tour', name, data: data || {} }, '*'); } catch (e) { /* sem pai */ }
}
function setHash(h) { try { history.replaceState(null, '', location.pathname + location.search + (h ? '#' + h : '')); } catch (e) { /* file:// */ } }

// Câmera do tour guiado (igual à do AuvoHub): janela "aberta" nos saltos de menu e aproximada no conteúdo.
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
const cfgOf = id => LISTS[id] || (typeof HUB_LISTS !== 'undefined' && HUB_LISTS[id]) || null;
const plain = v => String(v).replace(/^\{(ok|warn|bad|info|mute)\}/, '');
const pad = n => String(n).padStart(2, '0');
const chipify = v => {
  const m = typeof v === 'string' && v.match(/^\{(ok|warn|bad|info|mute)\}(.*)$/);
  return m ? `<span class="chip ${m[1]}">${m[2]}</span>` : v;
};

/* ---------------------------- páginas ---------------------------- */
const PAGES = {};
Object.entries(LISTS).forEach(([id, cfg]) => {
  cfg._id = id;
  PAGES[id] = {
    app: cfg.app || 'core', route: cfg.route, menu: cfg.menu, dmenu: cfg.dmenu,
    mission: cfg.menu === 'fin' ? 'fin' : cfg.menu === 'rel' ? 'rel' : id === 'pmoc' ? 'pmoc' : null,
    build: c => listPage(c, cfg),
  };
});
Object.assign(PAGES, {
  agenda: { app: 'core', route: 'planejamento', menu: 'op', build: agendaPage },
  mapa: { app: 'core', route: 'mapa', menu: 'op', mission: 'mapa', build: mapaPage },
  fluxo: { app: 'core', route: 'fluxoDeCaixa', menu: 'fin', mission: 'fin', build: fluxoPage },
  auvopay: { app: 'core', route: 'integracao/Auvobank', menu: 'fin', mission: 'fin', build: auvopayPage },
  dashfin: { app: 'core', route: 'dashboardFinanceira', menu: 'rel', mission: 'rel', build: dashfinPage },
  config: { app: 'core', route: 'configuracoesGerais', build: configPage },
  integ: { app: 'core', route: 'integracao', build: integPage },
  passos: { app: 'core', route: 'primeirospassos', build: passosPage },
  hubapp: { app: 'hub', route: '', mission: 'hub', build: null },
  dtickets: { app: 'desk', route: '', dmenu: 'Tickets', mission: 'desk', build: dticketsPage },
  dticket: { app: 'desk', route: 'Ticket/Detalhes/250', dmenu: 'Tickets', mission: 'desk', build: dticketPage },
});

function listPage(c, cfg) {
  const id = cfg._id;
  const kp = cfg.kpis ? `<div class="kp">${cfg.kpis.map(([l, v, col]) => `<div class="k" style="border-color:${col}"><b style="color:${col}">${v}</b><span>${l}</span></div>`).join('')}</div>` : '';
  const tabs = cfg.tabs ? `<div class="tabs">${cfg.tabs.map((t, i) => `<span class="${i ? '' : 'on'}">${t}</span>`).join('')}</div>` : '';
  const hl = cfg.hl != null && S.opts.hl ? cfg.hl : -1;
  const btns = (cfg.btns || []).map(b => {
    if (b.startsWith('+')) return `<span class="btn pri" data-act="new" data-p="${id}">${b}</span>`;
    if (/^(Download|Exportar)/.test(b)) return `<span class="btn" data-act="dl">${b}</span>`;
    return `<span class="btn" data-act="soon">${b}</span>`;
  }).join('');
  const rowOk = !cfg.noRow && !cfg.cols.includes('Remover') && !cfg.cols.includes('Ação') && !cfg.cols.includes('Duplicar');
  const search = cfg.search === false ? '' : `<div class="srch"><input class="srch-in" type="search" placeholder="Pesquisar" aria-label="Pesquisar nesta lista"></div>`;
  c.innerHTML = `<div class="ph"><h2>${cfg.title}</h2><span class="tut" data-act="soon">▶ Tutorial</span><div class="pa">${btns}</div></div>${kp}${tabs}
    <div class="card tc">${search}
    <table class="tbl"><thead><tr>${cfg.cols.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${cfg.rows.map((r, i) => `<tr class="${i === hl ? 'hl' : ''}"${rowOk ? ` data-act="row" data-p="${id}" data-i="${i}"` : ''}>${r.map(v => `<td>${chipify(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    <div class="pg" data-total="${cfg.rows.length}">Mostrando 1 até ${cfg.rows.length} de ${cfg.rows.length} registros</div></div>`;
}

function agendaMobile(c) {
  const by = {}; EVENTS.forEach((e, i) => (by[e[0]] = by[e[0]] || []).push(i));
  Object.values(by).forEach(l => l.sort((x, y) => EVENTS[x][1].localeCompare(EVENTS[y][1])));
  const days = Object.keys(by).filter(d => d >= '2026-09-21' && d <= '2026-10-02').sort();
  const wd = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'], mo = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const list = days.map(d => { const dt = new Date(d + 'T12:00:00'), today = d === '2026-09-25';
    return '<div class="mday' + (today ? ' today' : '') + '"><div class="mdh"><b>' + wd[dt.getDay()] + ', ' + dt.getDate() + ' ' + mo[dt.getMonth()] + '</b>' + (today ? '<em>Hoje</em>' : '') + '</div>' +
      by[d].map(idx => { const e = EVENTS[idx], st = ST[e[5]]; return '<div class="ev mev" data-act="ev" data-i="' + idx + '" data-m="' + e[2] + '" data-k="' + (e[4] || '') + '" data-s="' + e[5] + '"><i style="background:' + st.color + '"></i><b>' + e[1] + '</b><span>' + e[3] + '</span></div>'; }).join('') + '</div>'; }).join('');
  const stLegend = Object.entries(ST).map(([k, s]) => '<span class="lgc" data-act="legend" data-s="' + k + '"><i style="background:' + s.color + '"></i>' + s.label + '</span>').join('');
  c.innerHTML = '<div class="card sem"><b>12</b> Tarefas sem agendamento <span class="q">?</span></div><div class="mtb"><b>Setembro 2026</b><span class="btn pri" data-act="nova">＋ Tarefa</span></div><div class="legend mleg"><em>Status</em>' + stLegend + '</div><div class="mlist">' + list + '</div>';
  requestAnimationFrame(() => { const t = $('.mday.today', c); if (t) c.scrollTop = Math.max(0, t.offsetTop - 12); });
}
function agendaPage(c) {
  if (MOB) return agendaMobile(c);
  const by = {};
  EVENTS.forEach((e, i) => (by[e[0]] = by[e[0]] || []).push(i));
  Object.values(by).forEach(l => l.sort((a, b) => EVENTS[a][1].localeCompare(EVENTS[b][1])));
  const wd = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];
  const MAXV = 4;
  let cells = '';
  for (let i = 0; i < 35; i++) {
    const d = new Date(2026, 7, 30 + i);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const out = d.getMonth() !== 8, today = key === '2026-09-25';
    const list = by[key] || [];
    const evs = list.slice(0, MAXV).map(idx => {
      const e = EVENTS[idx], st = ST[e[5]];
      return `<div class="ev" data-act="ev" data-i="${idx}" data-m="${e[2]}" data-k="${e[4] || ''}" data-s="${e[5]}" title="${st.label}"><i style="background:${st.color}"></i><b>${e[1]}</b> ${e[3]}</div>`;
    }).join('');
    cells += `<div class="dc${out ? ' out' : ''}${today ? ' today' : ''}"><div class="dn">${today ? '<u>25</u>' : d.getDate()}</div>${evs}${list.length > MAXV ? `<div class="more">+${list.length - MAXV} mais</div>` : ''}</div>`;
  }
  const stLegend = Object.entries(ST).map(([k, s]) => `<span class="lgc" data-act="legend" data-s="${k}"><i style="background:${s.color}"></i>${s.label}</span>`).join('');
  c.innerHTML = `<div class="card sem"><b>12</b> Tarefas sem agendamento <span class="q">?</span><span class="chev">⌄</span></div>
    <div class="card cal">
      <div class="tb"><div class="pn"><span>‹</span><span>›</span></div><span class="mo">Setembro 2026</span>
        <div class="views"><span data-act="soon">Lista</span><span class="on">Calendário</span><span data-act="soon">Linha do tempo</span></div><div class="selm">Mês ▾</div><div class="sp"></div>
        <span class="btn tutb" data-act="soon">▶ Tutorial</span><span class="btn pri" data-act="nova">＋ Adicionar tarefa</span><span class="btn vi" data-act="soon">▼ Filtros</span><span class="btn bl" data-act="soon">≡ Mais ações</span></div>
      <div class="legend"><em>Status da tarefa</em>${stLegend}</div>
      <div class="wd">${wd.map(w => `<span>${w}</span>`).join('')}</div>
      <div class="grid">${cells}</div></div>`;
}

function fluxoPage(c) {
  const pts = [44230, 41800, 38900, 47200, 52600, 50100, 58300, 61000, 66500, 70200, 68400, 76100, 82000, 87300, 91480];
  const W = 900, H = 200, mx = Math.max(...pts), mn = Math.min(...pts) * 0.92;
  const path = pts.map((v, i) => `${i ? 'L' : 'M'}${((i / (pts.length - 1)) * W).toFixed(1)},${(H - ((v - mn) / (mx - mn)) * H).toFixed(1)}`).join(' ');
  const kp = [['Saldo atual', 'R$ 44.230,00', '#7c3aed'], ['Entradas previstas', 'R$ 68.400,00', '#16a34a'], ['Saídas previstas', 'R$ 21.150,00', '#e11d48'], ['Saldo final projetado', 'R$ 91.480,00', '#16a34a'], ['Menor saldo projetado', 'R$ 38.900,00', '#0ea5e9']];
  c.innerHTML = `<div class="ph"><h2>Fluxo de Caixa</h2><span class="tut" data-act="soon">▶ Tutorial</span><div class="pa"><span class="btn" data-act="soon">Exportar Excel</span><span class="btn" data-act="soon">Exportar PDF</span></div></div>
    <div class="kp">${kp.map(([l, v, col]) => `<div class="k" style="border-color:${col}"><b style="color:${col};font-size:19px">${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="card" style="padding:16px 20px"><div class="ct">Evolução do saldo projetado · próximos 15 dias</div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:230px;display:block">
        <defs><linearGradient id="fga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c3aed" stop-opacity=".3"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></linearGradient></defs>
        <path id="fl-a" d="${path} L${W},${H} L0,${H} Z" fill="url(#fga)" style="opacity:0;transition:opacity .8s"/>
        <path id="fl-l" d="${path}" fill="none" stroke="#7c3aed" stroke-width="3" vector-effect="non-scaling-stroke" stroke-dasharray="2400" stroke-dashoffset="2400" style="transition:stroke-dashoffset 1.8s ease"/>
      </svg></div>
    <div class="card tc" style="margin-top:14px"><div class="ct" style="padding:14px 18px 0">Projeção detalhada</div>
      <table class="tbl"><thead><tr><th>Período</th><th>Entradas</th><th>Saídas</th><th>Saldo final</th></tr></thead><tbody>
      <tr><td>28/09 a 04/10</td><td style="color:#16a34a">R$ 18.900,00</td><td style="color:#e11d48">R$ 8.100,00</td><td>R$ 55.030,00</td></tr>
      <tr><td>05/10 a 11/10</td><td style="color:#16a34a">R$ 22.700,00</td><td style="color:#e11d48">R$ 6.300,00</td><td>R$ 71.430,00</td></tr>
      <tr><td>12/10 a 18/10</td><td style="color:#16a34a">R$ 26.800,00</td><td style="color:#e11d48">R$ 6.750,00</td><td>R$ 91.480,00</td></tr></tbody></table></div>`;
  requestAnimationFrame(() => setTimeout(() => { const l = $('#fl-l'), a = $('#fl-a'); if (l) l.style.strokeDashoffset = 0; if (a) a.style.opacity = 1; }, 250));
}

function dashfinPage(c) {
  const rec = [38, 41, 36, 45, 49, 44, 52, 50, 52.3], pag = [21, 19, 23, 20, 25, 22, 24, 23, 12.3];
  const mes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
  const W = 900, H = 240, bw = 26;
  const bars = rec.map((v, i) => {
    const x = 40 + i * 92, h1 = v * 3.6, h2 = pag[i] * 3.6;
    return `<rect x="${x}" y="${H - h1}" width="${bw}" height="${h1}" rx="4" fill="#16a34a"/><rect x="${x + bw + 6}" y="${H - h2}" width="${bw}" height="${h2}" rx="4" fill="#e11d48"/><text x="${x + bw}" y="${H + 20}" text-anchor="middle" font-size="13" fill="#7b8798">${mes[i]}</text>`;
  }).join('');
  const kp = [['Resultado no mês', 'R$ 40.000,00', '#16a34a'], ['Recebidos', 'R$ 52.310,00', '#16a34a'], ['Pagos', 'R$ 12.310,00', '#e11d48'], ['Inadimplência no mês', 'R$ 18.500,00', '#f59e0b']];
  c.innerHTML = `<div class="ph"><h2>Dashboard Financeira</h2><span class="tut">Visão financeira mensal · Setembro</span></div>
    <div class="kp">${kp.map(([l, v, col]) => `<div class="k" style="border-color:${col}"><b style="color:${col}">${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="card" style="padding:16px 20px"><div class="ct">Visão financeira anual · 2026 <span class="lgm"><i style="background:#16a34a"></i>Recebimento <i style="background:#e11d48"></i>Pagamento</span></div>
    <svg viewBox="0 0 ${W} ${H + 30}" style="width:100%;height:330px;display:block">${bars}</svg></div>`;
}

function mapaPage(c) {
  const pins = [
    { x: 300, y: 250, c: '#7c3aed', t: 'Carlos Mendes', s: 'Em deslocamento → Bela Vista' },
    { x: 720, y: 430, c: '#16a34a', t: 'Juliana Prado', s: 'Em execução · Studio Nine' },
    { x: 1010, y: 210, c: '#94a3b8', t: 'Rafael Souza', s: 'Disponível' },
  ];
  c.style.padding = '0'; c.classList.add('mapc');
  c.innerHTML = `<div class="map"><svg viewBox="0 0 1600 800" preserveAspectRatio="none"><g stroke="#fff" stroke-width="14" fill="none" opacity=".9"><path d="M0 300 C400 260 700 420 1600 330"/><path d="M420 0 C440 300 380 520 470 800"/><path d="M900 0 C860 260 980 520 940 800"/><path d="M0 620 C500 600 1000 700 1600 560"/></g><g stroke="#cfd8d2" stroke-width="5" fill="none"><path d="M0 120 L1600 180"/><path d="M1250 0 L1300 800"/><path d="M0 470 L1600 430"/></g><path d="M300 250 C420 300 520 250 560 330" stroke="#7c3aed" stroke-width="5" stroke-dasharray="12 10" fill="none"/></svg>
    ${pins.map(p => `<div class="pin" style="left:${p.x}px;top:${p.y}px"><b style="background:${p.c}">${p.t.split(' ').map(w => w[0]).join('')}</b><span>${p.t}</span></div>`).join('')}
    <div class="pin cl" style="left:560px;top:330px"><b style="background:#7c3aed">●</b><span>${CLI.bv}</span></div>
    <div class="pin cl" style="left:720px;top:500px"><b style="background:#7c3aed">●</b><span>${CLI.sn}</span></div>
    <div class="mpanel"><div class="ct">Equipe em campo</div>${pins.map(p => `<div class="mrow"><b style="background:${p.c}"></b><div><strong>${p.t}</strong><small>${p.s}</small></div></div>`).join('')}<div class="mbtns"><span class="btn" data-act="soon">Visualizar rota</span><span class="btn" data-act="soon">Filtros</span></div></div></div>`;
}

function auvopayPage(c) {
  c.innerHTML = `<div class="ph"><h2>AuvoPay</h2><span class="tut" data-act="soon">▶ Tutorial</span></div>
    <div class="card" style="padding:34px;display:flex;gap:40px;align-items:center"><div style="flex:1"><h3 style="margin:0 0 10px;font-size:24px;color:#2b3445">Comece a receber com AuvoPay</h3>
    <p style="margin:0 0 20px;color:#7b8798;line-height:1.6">Solução de pagamentos integrada ao Auvo que automatiza todo o ciclo de cobrança: gere cobranças por boleto ou Pix, envie aos clientes e tenha identificação automática dos pagamentos.</p>
    <ul class="bul"><li>Cobranças via boleto e Pix</li><li>Identificação automática de pagamentos</li><li>Redução de inadimplência</li><li>Antecipação de recebíveis <em>Em breve</em></li></ul><span class="btn pri" data-act="soon" style="display:inline-block;margin-top:18px">Criar minha conta</span></div>
    <div class="card" style="flex:0 0 430px;background:#f6f3fd;padding:22px"><div class="ct">Fatura #1042 · ${CLI.bv}</div><div style="font-size:30px;font-weight:700;color:#7c3aed;margin:8px 0">R$ 890,00</div><div style="display:flex;gap:10px"><span class="chip ok">Pix</span><span class="chip info">Boleto</span></div><p style="color:#7b8798;font-size:13px">Pagamento identificado automaticamente e baixa na conta a receber.</p></div></div>`;
}

function configPage(c) {
  const tabs = ['Relatório', 'Cliente', 'Tarefa', 'E-mail', 'Km Rodado', 'Orçamento', 'Central do Cliente', 'Nota fiscal', 'Cobrança', 'Envio de notificações', 'Estoque', 'Projeto', 'Segurança', 'Automações'];
  c.innerHTML = `<div class="ph"><h2>Configurações gerais</h2><span class="tut" data-act="soon">▶ Tutorial</span></div>
    <div style="display:flex;gap:18px"><div class="card" style="flex:0 0 260px;padding:8px">${tabs.map((t, i) => `<div class="side${i ? '' : ' on'}" data-act="soon">${t}</div>`).join('')}</div>
    <div class="card" style="flex:1;padding:26px"><div class="ct">OS Digital e relatórios</div>
    <div class="frm"><label>Título do relatório<div class="in">Ordem de Serviço</div></label><label>Empresa<div class="in">Frio Total Climatização</div></label><label>CNPJ<div class="in">12.345.678/0001-90</div></label><label>Telefone<div class="in">(62) 3555-0100</div></label>
    <label>Idioma da OS Digital<div class="in">Português BR ▾</div></label><label>Logo da empresa<div class="in">Adicionar imagem</div></label></div></div></div>`;
}
function integPage(c) {
  c.innerHTML = `<div class="ph"><h2>Integrações</h2></div><div class="tri">
    <div class="card ic"><h3>API Auvo</h3><p>Integre seus sistemas aos dados da operação. Documentação com endpoints e exemplos.</p><span class="chip ok">Chaves de integração</span></div>
    <div class="card ic"><h3>AuvoPay</h3><p>Cobranças via boleto e Pix, com identificação automática de pagamentos.</p><span class="chip mute">Inativa</span></div>
    <div class="card ic"><h3>Bling</h3><p>Gestão online com controle de estoque, notas e financeiro integrados.</p><span class="chip mute">Inativa</span></div></div>`;
}
function passosPage(c) {
  c.innerHTML = `<div class="ph"><h2>Primeiros passos</h2></div><div class="tri" style="grid-template-columns:1fr 1fr">
    <div class="card ic"><h3>Curso Introdutório</h3><p>Aprenda a navegar pelo sistema, criar e gerenciar ordens de serviço e usar o aplicativo em campo.</p><div class="bar"><i style="width:0"></i></div><small>0% concluído · duração 40 min</small></div>
    <div class="card ic"><h3>Curso Auvo Financeiro</h3><p>Organize o fluxo financeiro, gerencie contas, gere cobranças e emita notas fiscais.</p><div class="bar"><i style="width:0"></i></div><small>0% concluído · duração 1h</small></div></div>`;
}

/* ---------------------------- AuvoDesk ---------------------------- */
const NEW_TK = []; // tickets abertos pelo AuvoHub durante a visita (modo explorar)
function dticketsPage(c) {
  const kp = [['Não lidos', 8], ['Abertos', 23 + NEW_TK.length], ['Em espera', 2], ['Em atraso', 4], ['Pausados', 1], ['Não atribuídos', 6 + NEW_TK.length], ['Encerram hoje', 3]];
  const rows = [...NEW_TK,
    ['#0251', 'Visita de orçamento — bloco C', CLI.ha, '25/09/2026 08:10', 'Não atribuído', '{warn}Aguardando Atendimento', 'Média', 'Sem SLA', ''],
    ['#0250', 'Ar não gela — bloco B', CLI.bv, '25/09/2026 07:58', 'Carlos Mendes', '{warn}Aguardando Atendimento', 'Alta', '4h restantes', 'main'],
    ['#0247', 'Orçamento de peça', CLI.ap, '23/09/2026 16:20', 'Juliana Prado', '{info}Aguardando Cliente', 'Média', 'Sem SLA', ''],
    ['#0244', 'Ruído no split da recepção', CLI.sn, '18/09/2026 11:02', 'Juliana Prado', '{ok}Serviço finalizado', 'Baixa', 'Cumprido', ''],
  ];
  c.innerHTML = `<div class="dh"><h2>Sexta-Feira, 25 de setembro</h2><div class="pa"><span class="btn" data-act="soon">Exportar Excel</span><span class="btn dk" data-act="soon">＋ Novo Ticket</span></div></div>
    <div class="dkp">${kp.map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join('')}</div>
    <div class="card tc"><table class="tbl"><thead><tr><th>Código</th><th>Título</th><th>Cliente</th><th>Última alteração</th><th>Atribuído a</th><th>Status</th><th>Prioridade</th><th>Prazo de SLA</th></tr></thead><tbody>
    ${rows.map(r => `<tr ${r[8] ? 'data-act="tk-open" class="main"' : ''}><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${chipify(r[5])}</td><td>${r[6]}</td><td>${r[7]}</td></tr>`).join('')}</tbody></table></div>`;
}
function dticketPage(c) {
  c.innerHTML = `<div class="dh"><h2><span style="color:#2563c9">Tickets</span> › Ticket #0250</h2><div class="pa"><span class="btn" data-act="soon">Responder</span><span class="btn" data-act="soon">Responder a todos</span><span class="btn" data-act="soon">Anotar</span><span class="btn" data-act="soon">Excluir ticket</span></div></div>
    <div class="tk"><div class="card tkl"><div class="ct">Detalhes do cliente</div><label>Cliente<div class="in">${CLI.bv}</div></label><label>Endereço<div class="in">Rua das Acácias, 120 — Goiânia/GO</div></label><label>Contato<div class="in">Marcos Tavares (síndico)</div></label><label>Grupo<div class="in">Contrato mensal</div></label></div>
    <div class="card tkm"><div class="tabs2"><span class="on" data-act="dt-tab" data-t="t">Ticket #0250</span><span data-act="dt-tab" data-t="a">Anexos</span><span data-act="dt-tab" data-t="c">Campos adicionais</span><span data-act="dt-tab" data-t="k" id="tab-tarefas">Tarefas</span></div>
      <div id="dt-pane"></div></div>
    <div class="card tkr"><div class="ct">Propriedades</div><small>Status</small>${['Novo', 'Aguardando Atendimento', 'Aguardando Cliente', 'Serviço finalizado', 'Encerrado'].map((s, i) => `<div class="opt${i === 1 ? ' on' : ''}">${s}</div>`).join('')}<small style="margin-top:12px;display:block">Prioridade</small><div class="opt on">Alta</div><small style="margin-top:12px;display:block">Atribuído a</small><div class="opt on">Carlos Mendes</div></div></div>`;
  dtPane('t');
}
function dtPane(t) {
  const p = $('#dt-pane'); if (!p) return;
  $$('.tabs2 span').forEach(s => s.classList.toggle('on', s.dataset.t === t));
  const hist = [['24/09 16:10', 'Ticket criado pelo AuvoHub (WhatsApp) — solicitante Marcos Tavares'], ['24/09 16:12', 'Automação alterou a equipe para “Manutenção”'], ['24/09 16:40', 'Fernanda Rocha alterou o status de “Novo” para “Aguardando Atendimento”'], ['24/09 16:45', 'Tarefa #80412 criada no Auvo e atribuída a Carlos Mendes']];
  const panes = {
    t: `<small>Criado em 24 de setembro de 2026 às 16h10 · via AuvoHub (WhatsApp) · prazo do contrato: 4 horas</small><h3>Ar não gela — bloco B</h3><p>O síndico avisou pelo WhatsApp que o ar-condicionado central do bloco B parou de gelar nesta tarde.</p><div class="hist">${hist.map(h => `<div><em>${h[0]}</em>${h[1]}</div>`).join('')}</div>`,
    a: '<p style="color:#7b8798">foto-bloco-b.jpg · 24 de setembro de 2026 às 16h10</p>',
    c: '<p style="color:#7b8798">Equipamento: Ar-condicionado central York 30 TR (YK-3009)</p>',
    k: `<h3>Tarefas vinculadas</h3><div class="tkcard"><div><strong>Tarefa #80412 · Manutenção corretiva</strong><small>Carlos Mendes · 25/09/2026 às 08:30 · ${CLI.bv}</small></div><span class="btn dk" data-act="os-from-ticket">Abrir no Auvo →</span></div>`,
  };
  p.innerHTML = panes[t];
}

/* ---------------------------- cabeçalhos ---------------------------- */
function coreHead(P) {
  const item = ([id, l]) => `<div class="di" data-go="${id}">${l}</div>`;
  const m = MENUS.map(m => `<div class="tn${P.menu === m.id ? ' on' : ''}" data-menu="${m.id}">${m.label} <span class="car">▾</span>${m.cols ? `<div class="dd mega">${m.cols.map(([t, its]) => `<div class="mcol"><div class="mt">${t}</div>${its.map(item).join('')}</div>`).join('')}</div>` : `<div class="dd">${m.items.map(item).join('')}</div>`}</div>`).join('');
  return `<div class="topnav"><div class="lg">auvo</div><div class="mnav" data-act="mmenu" role="button" aria-label="Abrir menu">☰ <span>Menu</span></div>${m}<div class="tn" data-go="dtickets">AuvoDesk</div><div class="tn" data-go="hubapp">AuvoHub</div><div class="sp"></div>
    <div class="tn sm" data-go="passos">Primeiros passos</div><div class="tn sm" data-act="nova">＋ Nova Tarefa</div><div class="bell">🔔</div>
    <div class="tn sm" data-menu="user">Fernanda <span class="car">▾</span><div class="dd r"><div class="di" data-go="config">Configurações gerais</div><div class="di" data-go="integ">Integração</div><div class="di" data-go="passos">Primeiros passos</div></div></div></div>`;
}
function deskHead(P) {
  const it = (l, extra) => `<div class="dn${P.dmenu === l ? ' on' : ''}" ${extra}>${l}</div>`;
  return `<div class="dtop"><div class="dlogo"><i>auvo</i>desk</div><div class="sp"></div><span class="dpill">🌐 PT</span><span class="dpill">Fernanda</span></div>
    <div class="dsub">${it('Tickets', 'data-go="dtickets"')}<div class="dn${P.dmenu === 'Cadastros' ? ' on' : ''}" ${MOB ? 'data-go="dclientes"' : 'data-menu="dcad"'}>Cadastros ▾<div class="dd"><div class="di" data-go="dclientes">Clientes</div><div class="di" data-act="soon">Usuário</div><div class="di" data-act="soon">Equipe</div><div class="di" data-act="soon">Tipos de solicitação</div><div class="di" data-act="soon">Status do ticket</div></div></div>${it('Configurações', 'data-go="dconfig"')}<div class="dn" data-go="agenda">📍 Auvo</div><div class="dn" data-go="hubapp">AuvoHub <span class="novo">Novo</span></div></div>`;
}

/* ---------------------------- render ---------------------------- */
function render() {
  const P = PAGES[S.page]; S.app = P.app;
  const host = P.app === 'desk' ? 'desk.auvo.com.br/' : P.app === 'hub' ? 'hub.auvo.com.br/' : 'app.auvo.com.br/';
  win.innerHTML = `<div class="chrome ${P.app}"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="url">${host}${P.route}</div></div>
    <div class="wbody ${P.app}">${P.app === 'desk' ? deskHead(P) : P.app === 'hub' ? hubSide(P) : coreHead(P)}<div class="content ${P.app}" id="content"></div><div id="layer"></div><div id="toast"></div></div>`;
  const c = $('#content');
  P.build(c);
  if (P.app === 'hub') { c.insertAdjacentHTML('beforeend', '<div class="hbell">' + hic('bell', 20) + '</div>'); }
  renderModal();
  if (P.mission) mark(P.mission);
  requestAnimationFrame(() => c.classList.add('in'));
  refreshHints();
  makeFocusable();
  window.gameOnRender && window.gameOnRender();
}
// Acessibilidade: tudo que é clicável vira focável e responde a Enter/Espaço; Esc fecha menus
function makeFocusable() {
  $$('[data-go],[data-act],[data-menu]', win).forEach(el => {
    if (el.tabIndex >= 0) return;
    el.tabIndex = 0;
    if (!el.getAttribute('role')) el.setAttribute('role', 'button');
    if (el.dataset.menu) el.setAttribute('aria-haspopup', 'true');
  });
}
document.addEventListener('keydown', e => {
  const t = e.target;
  if ((e.key === 'Enter' || e.key === ' ') && t && t.matches && t.matches('[data-go],[data-act],[data-menu]') && win.contains(t)) { e.preventDefault(); t.click(); }
  else if (e.key === 'Escape') { const o = $$('[data-menu].open', win); if (o.length) { o.forEach(x => x.classList.remove('open')); refreshHints(); } }
});
function sheetHTML() {
  const g = MENUS.map(m => '<div class="msg"><b>' + m.label + '</b>' + (m.cols ? m.cols.flatMap(c => c[1]) : m.items).map(([id, l]) => '<div class="msi" data-go="' + id + '">' + l + '</div>').join('') + '</div>').join('');
  return '<div class="msheet" id="msheet"><div class="msh"><b>Menu</b><span class="x" data-act="mclose" aria-label="Fechar menu">✕</span></div><div class="msb">' + g +
    '<div class="msg"><b>Outros sistemas</b><div class="msi" data-go="dtickets">AuvoDesk</div><div class="msi" data-go="hubapp">AuvoHub</div></div>' +
    '<div class="msg"><b>Conta</b><div class="msi" data-act="nova">Nova tarefa</div><div class="msi" data-go="passos">Primeiros passos</div><div class="msi" data-go="config">Configurações gerais</div><div class="msi" data-go="integ">Integração</div></div></div></div>';
}
const menuOpen = () => MOB ? !!$('#msheet', win) : !!$('.tn.open', win);
const menuItem = (menu, item) => MOB ? ($('#msheet', win) ? '#msheet [data-go="' + item + '"]' : '.mnav') : ($('.tn.open [data-go="' + item + '"]', win) ? '.tn.open [data-go="' + item + '"]' : '[data-menu="' + menu + '"]');
function go(id, opts) { S.page = id; S.opts = opts || {}; S.modal = null; render(); }
// legenda do tour guiado: título curto + frase de apoio (desenhada em experience.js)
function say(t, d) { S.cap = t || ''; S.capd = d || ''; if (window.lowerThird) window.lowerThird(S.cap, S.capd); }

let toastT;
function toast(msg) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2300); }

/* ---------------------------- modais ---------------------------- */
function clientOf(ev) {
  const head = ev[3].split(' — ')[0];
  return Object.values(CLI).find(n => head.split(' ').some(w => w.length > 3 && n.includes(w))) || CLI.bv;
}
const TYPE_OF = { os: 'Manutenção preventiva', pmoc: 'Inspeção PMOC', desk: 'Manutenção corretiva', hub: 'Visita técnica', fin: 'Faturamento' };
const MI = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0z"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" fill="none"/>',
  warn: '<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 16.5v.5" stroke="#fff" stroke-width="2" fill="none"/>',
  sliders: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.4" fill="none"/><rect x="8" y="5" width="3" height="4" rx="1"/><rect x="14" y="10" width="3" height="4" rx="1"/><rect x="7" y="15" width="3" height="4" rx="1"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" stroke-width="2.4" fill="none"/><circle cx="4" cy="6" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="4" cy="18" r="1.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2" stroke="#fff" stroke-width="2" fill="none"/>',
  pin: '<path d="M12 22s7-6.4 7-12a7 7 0 0 0-14 0c0 5.6 7 12 7 12z"/><circle cx="12" cy="10" r="2.6" fill="#fff"/>',
  tags: '<path d="M3 4h8l9 9-7 7-9-9z"/><circle cx="7.5" cy="8.5" r="1.4" fill="#fff"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  share: '<circle cx="6" cy="12" r="2.6"/><circle cx="17" cy="6" r="2.6"/><circle cx="17" cy="18" r="2.6"/><path d="M8.3 10.8 14.7 7.2M8.3 13.2l6.4 3.6" stroke="currentColor" stroke-width="1.8" fill="none"/>',
  repeat: '<path d="M4 11V9a3 3 0 0 1 3-3h11M15 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H6M9 21l-3-3 3-3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  trash: '<path d="M5 7h14l-1 13H6zM9 4h6l1 3H8z"/>',
  pen: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>',
  xmark: '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
  doc: '<path d="M6 3h9l4 4v14H6z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M9 12h7M9 16h7M9 8h3" stroke="currentColor" stroke-width="2" fill="none"/>',
};
const mi = (n, s = 17) => '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="currentColor" aria-hidden="true">' + MI[n] + '</svg>';
const isFinal = st => st === 'done' || st === 'pend';

// linha do tempo do Monitoramento conforme o status da tarefa
function timeline(status) {
  const steps = ['Tarefa criada', 'Agendada para o técnico', 'Em deslocamento', 'Check-in no cliente', 'Checklist, fotos e assinatura', 'Check-out'];
  const done = { open: 2, route: 2, run: 4, pause: 4, pend: 6, done: 6 }[status];
  const cur = { open: 'Em aberto — aguardando o técnico sair', route: 'Em deslocamento — GPS do aplicativo', run: 'Em execução — checklist e fotos', pause: 'Em pausa — aguardando peça' }[status];
  let h = steps.map((s, i) => (i < done ? '<div class="ok">✓ ' + s + '</div>' : i === done && cur ? '<div class="now">● ' + cur + '</div>' : '<div>○ ' + s + '</div>')).join('');
  if (status === 'pend') h += '<div class="now">● Pendência financeira — fatura aguardando pagamento</div>';
  return '<div class="tl">' + h + '</div>';
}

function osCtx(m) {
  const idx = EVENTS.indexOf(m.ev), ev = m.ev, main = ev[4] === 'main', mod = ev[2];
  const mainOS = main && mod === 'os';
  const type = mainOS ? 'Manutenção corretiva' : TYPE_OF[mod];
  return { idx, ev, main, mod, mainOS, type, svc: (mod === 'fin' ? 'Manutenção preventiva' : type.replace('Inspeção PMOC', 'Inspeção')) + ' — ar-condicionado central', st: ST[ev[5]], cli: clientOf(ev), code: mainOS ? '80412' : String(80300 + idx), tech: mainOS ? 'Carlos Mendes' : TEC[idx % 3] };
}
// aba Notificações: o que o cliente já recebeu, conforme o andamento da tarefa
function notifPane(status) {
  const lvl = { open: 1, route: 2, run: 2, pause: 2, pend: 3, done: 3 }[status];
  const it = ['Cliente notificado do agendamento', 'Aviso de “técnico a caminho” ao cliente', 'Pesquisa de satisfação enviada ao finalizar'];
  return '<div class="tl">' + it.map((t, i) => (i < lvl ? '<div class="ok">✓ ' + t + '</div>' : '<div>○ ' + t + '</div>')).join('') + '</div>';
}

function osModal(m) {
  const x = osCtx(m), ev = x.ev, st = x.st, hasInv = x.mainOS || (x.main && x.mod === 'fin');
  const fld = (ic, l, v) => '<div class="fl">' + mi(ic) + '<span><b>' + l + '</b> ' + v + '</span></div>';
  const full = (ic, l, v) => '<div class="fl full">' + mi(ic) + '<span><b>' + l + '</b> ' + v + '</span></div>';
  const tabs = [['tarefa', 'Tarefa'], ['mon', 'Monitoramento'], ['eq', 'Equipamentos'], ['orc', 'Orçamentos'], ['val', 'Valores'], ['fat', 'Faturas'], ['not', 'Notificações']];
  const num = (ev[3].match(/#\d+/) || [''])[0];
  const origin = x.mainOS ? '<span class="lnk" data-act="tk-open">#0250 — Ar não gela, bloco B</span>'
    : x.mod === 'desk' ? (x.main ? '<span class="lnk" data-act="tk-open">' + num + ' — Ar não gela, bloco B</span>' : '<span class="lnk" data-go="dtickets">' + num + ' — ver no AuvoDesk</span>') : '';
  const via = { pmoc: 'Contrato PMOC · <span class="lnk" data-go="pmoc" data-hl="1">ver PMOC</span>', hub: 'Conversa no AuvoHub · <span class="lnk" data-go="hubapp">abrir</span>', fin: 'Faturamento · <span class="lnk" data-go="faturas" data-hl="1">ver faturas</span>' }[x.mod] || '';
  const panes = {
    tarefa: '<div class="gr">' + fld('user', 'De:', 'Fernanda Rocha') + fld('user', 'Para:', x.tech) + fld('cal', 'Data da tarefa:', ev[0].split('-').reverse().join('/') + ' às ' + ev[1]) + fld('warn', 'Prioridade:', x.mainOS ? 'Alta' : 'Média') + fld('sliders', 'Tipo:', x.type) + fld('list', 'Questionário padrão:', x.mod === 'pmoc' ? 'PMOC — Inspeção mensal' : x.mainOS ? 'Manutenção corretiva' : 'Checklist — Preventiva') +
      full('clock', 'Duração informada:', isFinal(ev[5]) ? '00:58h' : '') + full('list', 'Status:', '<span class="stp"><i style="background:' + st.color + '"></i>' + st.label + '</span>') +
      (origin ? full('ext', 'Ticket:', origin) : '') + (via ? full('ext', 'Origem:', via) : '') +
      full('pin', 'Endereço:', x.cli + ' — ' + (x.mainOS ? 'Rua das Acácias, 120, Goiânia/GO' : 'Goiânia/GO')) +
      full('tags', 'Orientação:', x.mainOS ? 'Bloco B sem resfriar. Síndico Marcos Tavares acompanha a visita.' : 'Seguir o checklist padrão.') + full('ext', 'Código externo:', '') + '</div><div class="more2">' + mi('search', 16) + ' Mais informações</div>',
    mon: timeline(ev[5]),
    eq: x.mainOS ? '<table class="tbl"><thead><tr><th>Equipamento</th><th>Local</th><th>Última visita</th><th>Garantia</th></tr></thead><tbody>' +
        '<tr><td><b>Ar-condicionado central York 30 TR</b> · YK-3009</td><td>Bloco B · casa de máquinas</td><td>02/09/2026 · Preventiva</td><td><span class="chip ok">Até 03/2027</span></td></tr>' +
        '<tr><td>Ar-condicionado central York 30 TR · YK-3007</td><td>Bloco A · casa de máquinas</td><td>22/09/2026 · Preventiva</td><td><span class="chip ok">Até 03/2027</span></td></tr></tbody></table>' +
        '<p class="mut" style="margin-top:14px">Questionário desta visita: Manutenção corretiva · fotos de antes e depois · assinatura do cliente no final</p>'
      : '<div class="mr"><small>Equipamento</small><span>1 equipamento vinculado</span></div>',
    orc: x.mainOS ? '<div class="mr"><small>Orçamento #57</small><span>R$ 890,00 <span class="chip ok">Aprovado</span> <span class="lnk" data-go="orcamentos">Ver orçamentos</span></span></div>' : '<p class="mut">Nenhum orçamento nesta tarefa.</p>',
    val: '<table class="tbl"><thead><tr><th>Item</th><th>Qtd</th><th>Total</th></tr></thead><tbody><tr><td>' + x.svc + '</td><td>1</td><td>R$ 650,00</td></tr><tr><td>Filtro G4</td><td>3</td><td>R$ 240,00</td></tr><tr><td><b>Total</b></td><td></td><td><b>R$ 890,00</b></td></tr></tbody></table>',
    fat: hasInv ? '<div class="mr"><small>Fatura #1042</small><span>Serviços prestados à Tarefa #80412 · R$ 890,00 <span class="chip warn">Aguardando pagamento</span> <span class="lnk" data-go="faturas" data-hl="1">Ver fatura</span></span></div>'
      : x.mod === 'fin' ? '<div class="mr"><small>Faturas</small><span>Fatura vinculada a esta tarefa <span class="lnk" data-go="faturas">Ver faturas</span></span></div>' : '<p class="mut">Nenhuma fatura gerada ainda.</p>',
    not: notifPane(ev[5]),
  };
  const rel = isFinal(ev[5]) ? '<span class="bo" data-act="rel-open" role="button">' + mi('doc', 16) + ' Ver OS digital</span>' : '';
  return '<div class="ov"><div class="md real"><div class="mhr"><h3>Detalhes da tarefa ' + x.code + '</h3><span class="swt" data-act="soon">Trocar para versão nova</span><span class="x" data-act="close" aria-label="Fechar">' + mi('xmark', 18) + '</span></div>' +
    '<div class="mtr">' + tabs.map(([k, l]) => '<span class="' + (k === m.tab ? 'on' : '') + '" data-act="os-tab" data-t="' + k + '">' + l + '</span>').join('') + '</div>' +
    '<div class="mbr">' + panes[m.tab] + '</div>' +
    '<div class="mfr"><span class="bo" data-act="close">' + mi('xmark', 14) + ' Fechar</span><div class="sp"></div>' + rel +
    '<span class="bo blue" data-act="soon">' + mi('share', 16) + ' Copiar link ▾</span>' + (isFinal(ev[5]) ? '<span class="bg2" data-act="soon">' + mi('repeat', 16) + ' Replicar</span>' : '<span class="bg2" data-act="soon">Finalizar</span>') +
    '<span class="br" data-act="soon">' + mi('trash', 16) + ' Excluir</span><span class="bg2" data-act="soon">' + mi('pen', 16) + ' Editar</span></div></div></div>';
}

// ---------------- OS digital (relatório assinável) ----------------
const addMin = (t, n) => { const [h, m] = t.split(':').map(Number), s = h * 60 + m + n; return pad(Math.floor(s / 60) % 24) + ':' + pad(s % 60); };
function relModal(m) {
  const x = osCtx(m), ev = x.ev, d = ev[0].split('-').reverse().join('/');
  const th = t => '<div class="rh">' + t + '</div>';
  const sign = m.signed
    ? '<div class="rsig ok"><div class="sgh">' + mi('doc', 18) + ' Ordem de serviço assinada</div><img src="' + m.sigData + '" alt="Assinatura do cliente"><div class="sgi"><b>Marcos Tavares</b> (síndico) · ' + d + ' às ' + addMin(ev[1], 63) + '</div><ul><li>Validada por e-mail: marcos@belavista.example</li><li>Registro de auditoria: IP 189.44.12.7 · GPS a 22 m do local · Celular Android</li></ul></div>'
    : m.pad
      ? '<div class="rsig"><div class="sgh">' + mi('pen', 18) + ' Assinar Ordem de Serviço</div><p>Desenhe sua assinatura no quadro abaixo.</p><div class="sigwrap"><canvas id="sigpad" width="700" height="' + (MOB ? 320 : 190) + '"></canvas><span class="sgph" id="sgph">Assine aqui</span></div><div class="sgb"><span class="bo" data-act="sig-clear" role="button">Limpar</span><span class="bg2" data-act="sig-ok" role="button">Confirmar assinatura</span></div></div>'
      : '<div class="rsig"><div class="sgh">' + mi('pen', 18) + ' Assinar Ordem de Serviço</div><p>A assinatura será validada por e-mail. Clique abaixo para iniciar.</p><p class="sga">Dados que serão registrados como prova de auditoria: data e hora, IP, localização e dispositivo.</p><span class="bg2 big2" data-act="sig-start" role="button">Iniciar assinatura</span></div>';
  return '<div class="ov"><div class="md rep"><div class="mhr"><h3>OS digital · Tarefa ' + x.code + '</h3><span class="swt" data-act="rel-back">← Voltar aos detalhes</span><span class="x" data-act="close" aria-label="Fechar">' + mi('xmark', 18) + '</span></div>' +
    '<div class="rbody" id="rbody"><div class="paper">' +
    '<div class="rtop"><div><h1>RELATÓRIO DE ORDEM DE SERVIÇO</h1><p>Frio Total Climatização</p><p>Telefone: (62) 3555-0100</p><p>CNPJ: 12.345.678/0001-90</p><p>E-mail: contato@friototal.example</p><p>Endereço: Av. Industrial, 1200 — Goiânia/GO, 74000-000</p></div><div class="rlogo"><i></i><b>FRIO<br>TOTAL</b></div></div>' +
    th('Informações do cliente') + '<div class="rrow"><div><small>Cliente</small>' + x.cli + '</div><div><small>CPF/CNPJ</small>' + (x.mainOS ? '11.222.333/0001-44' : '—') + '</div></div><div class="rrow one"><div><small>Endereço</small>' + (x.mainOS ? 'Rua das Acácias, 120 — Goiânia/GO' : 'Goiânia/GO') + '</div></div>' +
    th('Tarefa #' + x.code) + '<div class="rrow"><div><small>Quem executou</small>' + x.tech + '</div><div><small>Situação</small>Finalizada</div></div><div class="rrow"><div><small>Tipo da tarefa</small>' + x.type + '</div><div><small>Finalização</small>Finalizada pelo aplicativo</div></div><div class="rrow one"><div><small>Orientação</small>' + (x.mainOS ? 'Bloco B sem resfriar. Síndico Marcos Tavares acompanha a visita.' : 'Seguir o checklist padrão.') + '</div></div>' +
    '<div class="rrow"><div><small>Check-in</small>' + d + ' às ' + addMin(ev[1], 3) + '<br>38 metros de distância do local<br>Alta precisão do GPS no check-in</div><div><small>Check-out</small>' + d + ' às ' + addMin(ev[1], 61) + '<br>41 metros de distância do local<br>Alta precisão do GPS no check-out</div></div><div class="rrow one"><div><small>Km informado</small>14,20</div></div>' +
    th('Serviços') + '<table class="rtb"><thead><tr><th>Serviço</th><th>Qtd</th><th>Valor unitário</th><th>Subtotal</th></tr></thead><tbody><tr><td>' + x.svc + '</td><td>1,00</td><td>R$ 650,00</td><td>R$ 650,00</td></tr><tr><td>Filtro G4</td><td>3,00</td><td>R$ 80,00</td><td>R$ 240,00</td></tr></tbody></table>' +
    th('Resumo de Valores') + '<div class="rsum"><span>Serviços</span><b>R$ 890,00</b></div><div class="rsum tot"><span>Total</span><b>R$ 890,00</b></div>' + sign + '</div></div></div></div>';
}
// quadro de assinatura: desenho com mouse/toque (e também pelo roteiro do tour)
let PADCTX = null, PADDOWN = false;
function bindPad() {
  const cv = $('#sigpad'); if (!cv) { PADCTX = null; return; }
  PADCTX = cv.getContext('2d'); PADCTX.lineWidth = 3; PADCTX.lineCap = 'round'; PADCTX.lineJoin = 'round'; PADCTX.strokeStyle = '#1e2a6b';
  if (S.modal && S.modal.sigImg) PADCTX.drawImage(S.modal.sigImg, 0, 0);
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
  const ph = $('#sgph'); if (ph) ph.style.display = 'none';
}
window.padFrac = (fx, fy, start) => { const cv = $('#sigpad'); if (cv) padPoint(fx * cv.width, fy * cv.height, start); };
window.padEnd = () => { PADDOWN = false; };

function rowModal(m) {
  const cfg = cfgOf(m.p), r = cfg.rows[m.i];
  const ic = ['user', 'cal', 'list', 'sliders', 'tags', 'pin', 'clock', 'ext'];
  const flds = cfg.cols.map((h, k) => '<div class="fl' + (String(r[k]).length > 34 ? ' full' : '') + '">' + mi(ic[k % ic.length]) + '<span><b>' + h + ':</b> ' + chipify(r[k]) + '</span></div>').join('');
  return '<div class="ov"><div class="md real sm2"><div class="mhr"><h3>' + cfg.title + ' · ' + plain(r[0]) + '</h3><span class="x" data-act="close" aria-label="Fechar">' + mi('xmark', 18) + '</span></div><div class="mbr"><div class="gr">' + flds + '</div></div>' +
    '<div class="mfr"><span class="bo" data-act="close">' + mi('xmark', 14) + ' Fechar</span><div class="sp"></div><span class="br" data-act="row-del">' + mi('trash', 16) + ' Excluir</span><span class="bg2" data-act="row-edit">' + mi('pen', 16) + ' Editar</span></div></div></div>';
}
const SKIPCOL = ['Remover', 'Duplicar', 'Ação'];
function formModal(m) {
  const cfg = cfgOf(m.p), r = m.i == null ? null : cfg.rows[m.i];
  const inputs = cfg.cols.map((h, k) => SKIPCOL.includes(h) ? '' : '<label>' + h + '<input id="ff-' + k + '" value="' + (r ? plain(r[k]).replace(/"/g, '&quot;') : '') + '" placeholder="' + h + '"></label>').join('');
  return '<div class="ov"><div class="md real sm2"><div class="mhr"><h3>' + (r ? 'Editar' : 'Novo registro') + ' · ' + cfg.title + '</h3><span class="x" data-act="close" aria-label="Fechar">' + mi('xmark', 18) + '</span></div><div class="mbr"><div class="ff">' + inputs + '</div></div>' +
    '<div class="mfr"><span class="bo" data-act="close">Cancelar</span><div class="sp"></div><span class="bg2" data-act="form-save">Salvar</span></div></div></div>';
}
function novaModal() {
  const f = (l, v) => `<label>${l}<div class="in">${v}</div></label>`;
  return `<div class="ov"><div class="md"><div class="mh"><h3>Cadastrar nova tarefa</h3><span class="x" data-act="close">×</span></div><div class="mtabs"><span class="on">Geral</span><span>Equipamentos</span><span>Valores</span><span>Anexos</span><span>Notificações e pesquisas</span></div>
    <div class="mb"><div class="frm">${f('Tarefa para', CLI.bv)}${f('Endereço', 'Rua das Acácias, 120')}${f('Tarefa será executada por', 'Carlos Mendes')}${f('Data e hora', '25/09/2026 · 08:30')}${f('Tipo de tarefa', 'Manutenção preventiva')}${f('Questionário', 'Checklist — Preventiva')}</div></div>
    <div class="mf"><span class="btn" data-act="close">Cancelar</span><span class="btn pri" data-act="soon">Salvar</span></div></div></div>`;
}
function renderModal() {
  const L = $('#layer'); if (!L) return;
  const m = S.modal;
  if (!m) { L.innerHTML = ''; refreshHints(); return; }
  L.innerHTML = m.type === 'os' ? osModal(m) : m.type === 'rel' ? relModal(m) : m.type === 'row' ? rowModal(m) : m.type === 'form' ? formModal(m) : novaModal();
  const ov = $('.ov', L); makeFocusable(); bindPad(); if (m.type === 'rel' && m.scroll) { const rb = $('#rbody'); if (rb) rb.scrollTop = rb.scrollHeight; }
  // celular: a faixa de abas rola na horizontal; mantém a aba ativa à vista depois de redesenhar
  const tabOn = $('.mtr .on', L); if (tabOn) { const tr = tabOn.parentElement; tr.scrollLeft = Math.max(0, tabOn.offsetLeft - (tr.clientWidth - tabOn.offsetWidth) / 2); }
  if (m.shown) ov.classList.add('in'); else { m.shown = true; requestAnimationFrame(() => ov.classList.add('in')); window.gameOnModal && window.gameOnModal(m.type); }
  refreshHints();
}

/* ---------------------------- ações ---------------------------- */
function openEvent(i) {
  const ev = EVENTS[i];
  S.modal = { type: 'os', ev, tab: ev[2] === 'fin' ? 'fat' : 'tarefa' }; mark('os'); renderModal();
}
function act(a, el) {
  if (a === 'ev') return openEvent(+el.dataset.i);
  if (a === 'os-tab') { S.modal.tab = el.dataset.t; return renderModal(); }
  if (a === 'close') { S.modal = null; return renderModal(); }
  if (a === 'mmenu') { const s = $('#msheet', win); if (s) s.remove(); else $('.wbody', win).insertAdjacentHTML('beforeend', sheetHTML()); makeFocusable(); refreshHints(); return; }
  if (a === 'mclose') { const s = $('#msheet', win); if (s) s.remove(); refreshHints(); return; }
  if (a === 'nova') { const sh = $('#msheet', win); if (sh) sh.remove(); S.modal = { type: 'nova' }; return renderModal(); }
  if (a === 'rel-open') { S.modal = { type: 'rel', ev: S.modal.ev, tab: S.modal.tab }; return renderModal(); }
  if (a === 'rel-back') { S.modal = { type: 'os', ev: S.modal.ev, tab: 'tarefa' }; return renderModal(); }
  if (a === 'sig-start') { S.modal.pad = true; S.modal.scroll = true; renderModal(); return; }
  if (a === 'sig-clear') { const cv = $('#sigpad'); if (cv && PADCTX) { PADCTX.clearRect(0, 0, cv.width, cv.height); S.modal.ink = false; const ph = $('#sgph'); if (ph) ph.style.display = ''; refreshHints(); } return; }
  if (a === 'sig-ok') {
    const cv = $('#sigpad');
    if (!S.modal.ink) return toast('Desenhe a assinatura no quadro antes de confirmar.');
    S.modal.sigData = cv.toDataURL('image/png'); S.modal.signed = true; S.modal.pad = false; S.modal.scroll = true;
    mark('sign'); track('signed'); renderModal(); return;
  }
  if (a === 'row') { S.modal = { type: 'row', p: el.dataset.p, i: +el.dataset.i }; return renderModal(); }
  if (a === 'new') { S.modal = { type: 'form', p: el.dataset.p, i: null }; return renderModal(); }
  if (a === 'row-edit') { S.modal = { type: 'form', p: S.modal.p, i: S.modal.i }; return renderModal(); }
  if (a === 'row-del') { cfgOf(S.modal.p).rows.splice(S.modal.i, 1); S.modal = null; render(); toast('Registro excluído.'); return; }
  if (a === 'form-save') {
    const cfg = cfgOf(S.modal.p), old = S.modal.i == null ? null : cfg.rows[S.modal.i];
    const first = $('#ff-0'); if (first && !first.value.trim()) return toast('Preencha o primeiro campo.');
    const row = cfg.cols.map((h, k) => {
      if (SKIPCOL.includes(h)) return old ? old[k] : '✕';
      const v = ($('#ff-' + k) || {}).value || '';
      const tag = old ? (String(old[k]).match(/^\{(ok|warn|bad|info|mute)\}/) || [''])[0] : (String(cfg.rows[0] && cfg.rows[0][k]).match(/^\{/) ? '{ok}' : '');
      return tag + v;
    });
    if (old) cfg.rows[S.modal.i] = row; else cfg.rows.unshift(row);
    S.modal = null; render(); toast('Registro salvo.'); return;
  }
  if (a === 'dl') return toast('Arquivo gerado e enviado para a Central de downloads.');
  if (a === 'tk-open') return go('dticket');
  if (a === 'dt-tab') return dtPane(el.dataset.t);
  if (a === 'os-from-ticket') { go('agenda'); S.modal = { type: 'os', ev: EVENTS.find(e => e[4] === 'main' && e[2] === 'os'), tab: 'tarefa' }; mark('os'); return renderModal(); }
  if (a === 'legend') {
    const key = el.dataset.s ? 's' : 'm', val = el.dataset[key];
    $$('.ev').forEach(e => { if (e.dataset[key] === val) { e.classList.add('flash'); setTimeout(() => e.classList.remove('flash'), 1800); } });
    return;
  }
  if (a === 'star') return window.gameStar && window.gameStar(el);
  if (a === 'soon') return toast('Recurso ilustrativo nesta demonstração.');
}
win.addEventListener('input', e => {
  if (!e.target.classList || !e.target.classList.contains('srch-in')) return;
  const q = e.target.value.trim().toLowerCase(); let n = 0;
  $$('tbody tr', win).forEach(tr => { const ok = !q || tr.textContent.toLowerCase().includes(q); tr.style.display = ok ? '' : 'none'; if (ok) n++; });
  const pg = $('.pg', win); if (pg) pg.textContent = 'Mostrando ' + (n ? 1 : 0) + ' até ' + n + ' de ' + pg.dataset.total + ' registros';
});
win.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) { const t = g.dataset.go; return go(t, g.dataset.hl ? { hl: true } : {}); }
  const a = e.target.closest('[data-act]');
  if (a) return act(a.dataset.act, a);
  const m = e.target.closest('[data-menu]');
  if (m) {
    $$('[data-menu].open', win).forEach(x => x !== m && x.classList.remove('open'));
    m.classList.toggle('open'); return refreshHints();
  }
  $$('[data-menu].open', win).forEach(x => x.classList.remove('open'));
});

/* ---------------------------- missões, dicas e barra inferior ---------------------------- */
const MISSION_HELP = {
  os: 'Clique na OS destacada no calendário', sign: 'Abra a OS, clique em “Ver OS digital” e assine', desk: 'Na OS aberta, clique no ticket vinculado', fin: 'Abra Financeiro › Fluxo de Caixa',
  pmoc: 'Abra Cadastros › PMOC', rel: 'Abra Relatórios › Dashboard', mapa: 'Abra Operação › Mapa', hub: 'Clique em AuvoHub no menu',
};
const MENU_OF = { fin: ['fin', 'fluxo'], pmoc: ['cad', 'pmoc'], rel: ['rel', 'dashboard'], mapa: ['op', 'mapa'] };
function targetFor(k) {
  const onA = S.page === 'agenda', modal = S.modal && S.modal.type === 'os', rel = S.modal && S.modal.type === 'rel';
  if (S.modal && (S.modal.type === 'row' || S.modal.type === 'form' || S.modal.type === 'nova')) return '[data-act="close"]';
  if (rel) { if (k === 'sign') return S.modal.signed ? null : S.modal.pad ? (S.modal.ink ? '[data-act="sig-ok"]' : '.sigwrap') : '[data-act="sig-start"]'; return '[data-act="close"]'; }
  if (S.app === 'hub' || (S.app === 'desk' && k !== 'desk')) return '[data-go="agenda"]';
  if ((k === 'os' || k === 'desk' || k === 'sign') && !onA && S.app === 'core' && menuOpen()) return MOB ? '#msheet [data-go="agenda"]' : '.tn.open [data-go="agenda"]';
  if (k === 'sign') return modal ? '[data-act="rel-open"]' : onA ? '.ev[data-m="os"][data-k="main"]' : menuItem('op', 'agenda');
  if (k === 'os') return onA ? '.ev[data-m="os"][data-k="main"]' : menuItem('op', 'agenda');
  if (k === 'desk') return S.app === 'desk' ? null : modal ? '[data-act="tk-open"]' : onA ? '.ev[data-m="os"][data-k="main"]' : menuItem('op', 'agenda');
  if (k === 'hub') return MOB ? menuItem('hub', 'hubapp') : '[data-go="hubapp"]';
  const [menu, item] = MENU_OF[k];
  return menuItem(menu, item);
}
function hintFor(k) {
  const onA = S.page === 'agenda', modal = S.modal && S.modal.type === 'os', agendaOpen = MOB ? !!$('#msheet', win) : !!$('.tn.open [data-go="agenda"]', win);
  if (S.modal && (S.modal.type === 'row' || S.modal.type === 'form' || S.modal.type === 'nova')) return 'Feche esta janela para seguir a missão';
  if (S.modal && S.modal.type === 'rel') { if (k === 'sign') return S.modal.signed ? 'Assinatura registrada' : S.modal.pad ? (S.modal.ink ? 'Clique em “Confirmar assinatura”' : 'Desenhe sua assinatura no quadro branco')  : 'Role até o fim e clique em “Iniciar assinatura”'; return 'Feche o relatório para continuar'; }
  if (S.app === 'hub') return 'Você está no AuvoHub. Clique em “← Voltar ao Auvo” para seguir as missões';
  if (S.app === 'desk' && k !== 'desk') return 'Você está no AuvoDesk. Clique em “Auvo” no menu para voltar à Agenda';
  if (k === 'sign') return modal ? 'Clique em “Ver OS digital”' : onA ? 'Abra a tarefa que pulsa e clique em “Ver OS digital”' : agendaOpen ? 'Escolha “Agenda” no menu' : 'Abra o menu Operação e escolha Agenda';
  if (k === 'os') return onA ? 'Clique na tarefa que pulsa no calendário' : agendaOpen ? 'Escolha “Agenda” no menu' : 'Abra o menu Operação e escolha Agenda';
  if (k === 'desk') return S.app === 'desk' ? 'Você já está no AuvoDesk' : modal ? 'Clique no ticket vinculado à tarefa' : onA ? 'Abra a tarefa que pulsa e clique no ticket vinculado' : agendaOpen ? 'Escolha “Agenda” no menu' : 'Volte à Agenda pelo menu Operação';
  return MISSION_HELP[k];
}
// Seta que aponta o alvo depois de alguns segundos parado; reforça se continuar sem agir
let nudgeT = 0;
const ARROW = '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 3 6 17h7v15h10V17h7z" fill="#fde047" stroke="#1a1200" stroke-width="2.2" stroke-linejoin="round"/></svg>';
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
win.addEventListener('pointerdown', () => { if (S.mode !== 'explore') return; const el = $('.hot', win); armNudge(el); });
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
  const m = MISSIONS.find(x => x.k === k);
  setTimeout(() => { updateBottom(); if (S.visited.size === MISSIONS.length) setTimeout(() => showEnd(true), 1600); }, 200);
}
function updateBottom() {
  const b = $('#bot'); if (!b) return;
  if (S.mode === 'hero') { b.className = 'bot off'; document.body.style.setProperty('--botH', '0px'); return; }
  b.className = 'bot';
  if (S.mode === 'explore') {
    const done = S.visited.size, n = MISSIONS.length, nx = MISSIONS.find(m => !S.visited.has(m.k)), simple = document.body.classList.contains('simple');
    b.innerHTML = `<div class="bx">
      <div class="cur">${nx ? `<span class="badge">Missão ${MISSIONS.indexOf(nx) + 1} de ${n}</span><strong>${nx.t}</strong><small>${hintFor(nx.k)}</small>` : '<span class="badge ok">Concluído</span><strong>Todas as missões cumpridas</strong>'}</div>
      ${window.gameHud ? window.gameHud() : ''}
      <div class="acts">${nx ? '<button class="gbtn" data-t="skip" title="Pular esta missão">Pular</button>' : ''}<button class="gbtn" data-t="list" aria-expanded="${!!S.listOpen}">${IC.list}<span>Missões</span><em class="cnt">${done}/${n}</em></button></div>
      ${S.listOpen ? `<div class="pop"><b>Missões · ${done}/${n}</b>${MISSIONS.map(m => `<div class="${S.visited.has(m.k) ? 'd' : ''}"><span>${S.skipped.has(m.k) ? '↷' : S.visited.has(m.k) ? '✓' : '○'}</span>${m.t}</div>`).join('')}<div class="pf"><button class="gbtn" data-t="tour">${IC.play}<span>Ver o tour guiado</span></button><label class="sw"><input type="checkbox" data-t="simple" ${simple ? 'checked' : ''}> Modo simples (sem pontos)</label></div></div>` : ''}
    </div>`;
  } else if (window.tourBottomSync) window.tourBottomSync();
  document.body.style.setProperty('--botH', b.offsetHeight + 'px'); fitStage();
}

/* ---------------------------- modos ---------------------------- */
// Abertura: promessa em uma frase, um convite principal e prova social publicada em auvo.com
function heroHTML() {
  $('#hero').innerHTML = `<div class="hcopy">
    <div class="heb"><i></i>Tour interativo · 3 minutos</div>
    <h1><span>Do chamado</span><span>à cobrança.</span><span class="g">Num só sistema.</span></h1>
    <p>Acompanhe um dia real de uma empresa de serviços: o cliente chama no WhatsApp, o técnico é despachado, o cliente assina na tela e a cobrança sai da própria OS.</p>
    <div class="hcta"><button class="pbtn" id="hGuided"><span class="pi">${IC.play}</span>Começar o tour</button><button class="lnkbtn" id="hExplore">Explorar por conta própria <span class="ch">›</span></button></div>
    <div class="proof">${SALES.proof.map(([b, s]) => `<div><b>${b}</b><small>${s}</small></div>`).join('')}<span class="src">${SALES.proofSrc}</span></div>
    <div class="hnt" id="hnt" aria-hidden="true"></div></div>`;
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
    if (window.storyReset) window.storyReset();
    if (window.narr) window.narr.stop();
    setPaused(false);
  }
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
function enterExplore(keep) { setMode('explore'); if (keep === true) render(); else go('agenda'); }
function startGuided(i) { setMode('guided'); window.runTour(i || 0, true); }
const MOD_NAME = { op: 'Operação', cad: 'Cadastros', fin: 'Financeiro', rel: 'Relatórios', desk: 'AuvoDesk', hub: 'AuvoHub' };
function showEnd(explored) { window.finale(explored); }

$('#mGuided').onclick = () => startGuided(0);
$('#mExplore').onclick = () => enterExplore();
heroHTML();
fitStage();
go('agenda');
setMode('hero');
// entrada da abertura depois das fontes (no máximo 0,7 s de espera)
Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), sleep(700)])
  .then(() => requestAnimationFrame(() => document.body.classList.remove('preload')));
