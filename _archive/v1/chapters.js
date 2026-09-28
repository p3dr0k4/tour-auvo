// ============================================================
// One entry per chapter: how its shell/subnav looks, how its
// screen is built, and the beat-by-beat sequence it plays.
// ============================================================
const TOPNAV_CORE = [
  ['Operação', 'operacao'], ['Cadastros', 'cadastros'], ['Financeiro', 'financeiro'],
  ['Relatórios', 'relatorios'], ['AuvoDesk', 'auvodesk'], ['AuvoChat', 'auvochat'],
];

function buildCoreShell(stage, { active, subs, activeSub, route }) {
  stage.innerHTML = '';
  const chrome = el('div', 'win-chrome');
  chrome.innerHTML = `<span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span>
    <div class="win-url"><span style="width:10px;height:10px;border:1.5px solid #c7bce0;border-radius:3px"></span>app.auvo.com.br/${route}</div>`;
  stage.appendChild(chrome);
  const body = el('div', 'win-body');
  const nav = el('div', 'topnav');
  nav.innerHTML = `<div class="logo">auvo</div>` +
    TOPNAV_CORE.map(([label, id]) => `<div class="item${id === active ? ' active' : ''}">${label}</div>`).join('') +
    `<div class="sp"></div><div class="pill">✦ Primeiros passos</div><div class="bell">🔔</div>`;
  body.appendChild(nav);
  let sub = null;
  if (subs && subs.length) {
    sub = el('div', 'subnav show');
    sub.innerHTML = subs.map(s => `<div class="s-item${s === activeSub ? ' active' : ''}">${s}</div>`).join('');
    body.appendChild(sub);
  }
  const content = el('div', 'content' + (subs && subs.length ? ' with-sub' : ''));
  body.appendChild(content);
  const cap = el('div', 'caption');
  body.appendChild(cap);
  stage.appendChild(body);
  return { body, content, sub };
}

function buildDeskShell(stage, { active }) {
  stage.innerHTML = '';
  const chrome = el('div', 'win-chrome desk');
  chrome.innerHTML = `<span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span>
    <div class="win-url">desk.auvo.com.br</div>`;
  stage.appendChild(chrome);
  const body = el('div', 'win-body');
  const nav = el('div', 'topnav');
  nav.style.background = '#ffffff';
  nav.style.color = '#1c2b24';
  nav.style.borderBottom = '1px solid var(--dk-line)';
  const items = ['Tickets', 'Cadastros', 'Configurações', 'Auvo', 'Auvochat'];
  nav.innerHTML = `<div class="logo" style="color:#16a34a">auvo<span style="color:#1c2b24">desk</span></div>` +
    items.map(l => `<div class="item" style="color:${l === active ? '#16a34a' : '#6b7d74'}">${l}</div>`).join('') +
    `<div class="sp"></div><div class="pill" style="background:#eaf6ee;color:#16a34a">🌐 PT</div>`;
  body.appendChild(nav);
  const content = el('div', 'content');
  content.style.top = '56px';
  body.appendChild(content);
  const cap = el('div', 'caption');
  body.appendChild(cap);
  stage.appendChild(body);
  return { body, content };
}

function pageHead(content, title, actionsHtml) {
  const h = el('div', 'p-head');
  h.innerHTML = `<h2 class="p-title rv">${title}</h2><div class="p-actions rv">${actionsHtml || ''}</div>`;
  content.appendChild(h);
  return h;
}

// ============================================================ OPERAÇÃO
const chOperacao = {
  id: 'operacao', title: 'Operação · Agenda', shell: 'core', top: 'operacao', route: 'planejamento',
  build(stage) {
    const { content } = buildCoreShell(stage, { active: 'operacao' });
    pageHead(content, 'Agenda de hoje', '<div class="btn rv">📍 Mapa</div><div class="btn pri rv">+ Nova tarefa</div>');
    const kpis = el('div', 'kpis rv');
    [['Tarefas hoje', '18'], ['Em rota', '4'], ['Concluídas', '9'], ['Atrasadas', '1']].forEach(([l, v]) => {
      const k = el('div', 'kpi'); k.innerHTML = `<div class="l">${l}</div><div class="v${l === 'Atrasadas' ? ' down' : ''}">${v}</div>`; kpis.appendChild(k);
    });
    content.appendChild(kpis);
    const list = el('div', 'rv');
    list.style.cssText = 'display:flex;flex-direction:column;gap:10px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:10px;flex:1;overflow:hidden';
    const tasks = [
      { h: '08:30', c: SC.clientes.belaVista, t: 'Manutenção preventiva — ar-condicionado central', tec: SC.tecnicos[0], st: 'Em rota', col: '#0ea5e9' },
      { h: '10:00', c: SC.clientes.studioNine, t: 'Instalação de split 18000 BTUs', tec: SC.tecnicos[1], st: 'Agendada', col: '#8a80a3' },
      { h: '13:30', c: SC.clientes.autoPecas, t: 'Revisão de compressor', tec: SC.tecnicos[0], st: 'Agendada', col: '#8a80a3' },
      { h: '15:00', c: SC.clientes.belaVista, t: 'Troca de filtro — bloco B', tec: SC.tecnicos[1], st: 'Agendada', col: '#8a80a3' },
    ];
    const rowEls = [];
    tasks.forEach(t => {
      const row = el('div');
      row.style.cssText = 'display:flex;align-items:center;gap:14px;padding:13px 14px;border-radius:12px;transition:background .3s';
      row.innerHTML = `<div style="font:600 13px var(--mono);color:var(--mute);width:44px">${t.h}</div>
        <span class="dot-status" style="background:${t.col}"></span>
        <div style="flex:1;min-width:0">
          <div style="font:600 14px var(--font);color:var(--ink)">${t.t}</div>
          <div style="font:500 12.5px var(--font);color:var(--mute)">${t.c.nome}</div>
        </div>
        <span class="chip" style="color:${t.c.cor};background:${t.c.cor}18">${t.c.seg}</span>`;
      const av = avatar(t.tec.nome, t.tec.cor, 34);
      row.appendChild(av);
      list.appendChild(row);
      rowEls.push(row);
    });
    content.appendChild(list);
    return { rows: rowEls, firstRow: rowEls[0] };
  },
  async play(stage, refs, signal) {
    const root = stage;
    await sleep(300, signal); reveal(root, '.rv'); await sleep(650, signal);
    if (signal.aborted) return;
    setCaption(root, `<b>${SC.clientes.belaVista.nome}</b> tem manutenção preventiva às 8h30 — o Carlos já está escalado.`);
    await clickEl(stage, refs.firstRow, { ms: 900 }, signal);
    if (signal.aborted) return;
    refs.firstRow.style.background = 'var(--soft)';
    refs.firstRow.style.boxShadow = '0 0 0 1.5px var(--accent) inset';
    await sleep(1400, signal);
    clearCaption(root);
    setCaption(root, 'Cada tarefa vira uma <b>Ordem de Serviço digital</b>: checklist, fotos e assinatura do cliente, tudo no celular do técnico.');
    await sleep(2600, signal);
  },
};

// ============================================================ CADASTROS
const chCadastros = {
  id: 'cadastros', title: 'Cadastros · Clientes', shell: 'core', top: 'cadastros', route: 'gerenciarClientes',
  build(stage) {
    const { content } = buildCoreShell(stage, { active: 'cadastros' });
    pageHead(content, 'Clientes', '<div class="btn pri rv">+ Novo cliente</div>');
    const search = el('div', 'rv');
    search.style.cssText = 'display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:16px;font:500 14px var(--font);color:var(--mute)';
    search.innerHTML = '🔎 <span id="qtxt">Buscar cliente…</span>';
    content.appendChild(search);
    const wrap = el('div', 'rv'); wrap.style.cssText = 'display:flex;gap:20px;flex:1;min-height:0';
    const listCol = el('div'); listCol.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:10px;overflow:hidden';
    const cs = Object.values(SC.clientes);
    const rows = [];
    cs.forEach(c => {
      const r = el('div');
      r.style.cssText = 'display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:13px 16px';
      r.appendChild(avatar(c.nome, c.cor, 40));
      const t = el('div'); t.innerHTML = `<div style="font:600 14.5px var(--font);color:var(--ink)">${c.nome}</div><div style="font:500 12.5px var(--font);color:var(--mute)">${c.seg}</div>`;
      r.appendChild(t);
      listCol.appendChild(r); rows.push(r);
    });
    wrap.appendChild(listCol);
    const detail = el('div', 'rv'); detail.id = 'detail';
    detail.style.cssText = 'width:320px;flex:0 0 auto;background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px;opacity:0;transform:scale(.97);transition:opacity .4s,transform .4s';
    detail.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:18px"></div>`;
    wrap.appendChild(detail);
    content.appendChild(wrap);
    return { search, rows, cs, detail };
  },
  async play(stage, refs, signal) {
    await sleep(300, signal); reveal(stage, '.rv'); await sleep(500, signal);
    const target = refs.rows[1]; const c = refs.cs[1];
    setCaption(stage, `Digitando <b>"Studio Nine"</b> na busca…`);
    const txt = stage.querySelector('#qtxt');
    const word = 'Studio Nine'; let i = 0;
    while (i <= word.length) { if (signal.aborted) return; txt.textContent = word.slice(0, i) || 'Buscar cliente…'; i++; await sleep(70, signal); }
    refs.rows.forEach((r, idx) => { if (idx !== 1) r.style.display = 'none'; });
    await sleep(400, signal); if (signal.aborted) return;
    await clickEl(stage, target, { ms: 700 }, signal); if (signal.aborted) return;
    clearCaption(stage);
    const av = avatar(c.nome, c.cor, 68);
    const box = refs.detail.querySelector('div');
    box.innerHTML = ''; box.appendChild(av);
    box.insertAdjacentHTML('beforeend', `<div style="font:700 17px var(--font);color:var(--ink);margin-top:10px">${c.nome}</div><div style="font:500 12.5px var(--font);color:var(--mute)">${c.seg}</div>`);
    [['Equipamentos', '3 cadastrados'], ['PMOC', 'Em dia'], ['OS no ano', '14'], ['Contrato', 'Mensal · R$ 890,00']].forEach(([l, v], idx) => {
      box.insertAdjacentHTML('beforeend', `<div style="display:flex;justify-content:space-between;padding:11px 0;border-top:${idx ? '1px solid var(--line)' : 'none'};width:100%"><span style="font:500 13px var(--font);color:var(--mute)">${l}</span><span style="font:600 13px var(--font);color:var(--ink)">${v}</span></div>`);
    });
    refs.detail.style.opacity = '1'; refs.detail.style.transform = 'none';
    setCaption(stage, 'Um cadastro só, usado por <b>toda a operação</b> — equipamentos, PMOC e financeiro puxam do mesmo lugar.');
    await sleep(2600, signal);
  },
};

// ============================================================ FINANCEIRO
const chFinanceiro = {
  id: 'financeiro', title: 'Financeiro · Fluxo de Caixa', shell: 'core', top: 'financeiro', route: 'fluxoDeCaixa',
  build(stage) {
    const { content } = buildCoreShell(stage, { active: 'financeiro', subs: ['Fluxo de Caixa', 'Faturas', 'Contratos', 'Contas a receber'], activeSub: 'Fluxo de Caixa' });
    pageHead(content, 'Fluxo de Caixa', '<div class="btn rv">⬇ Exportar</div>');
    const kpis = el('div', 'kpis rv');
    [['Saldo atual', money(44230), ''], ['Entradas previstas', money(68400), 'up'], ['Saídas previstas', money(21150), 'down'], ['Saldo final projetado', money(91480), 'up'], ['Menor saldo projetado', money(38900), '']]
      .forEach(([l, v, cls]) => { const k = el('div', 'kpi'); k.innerHTML = `<div class="l">${l}</div><div class="v ${cls}">${v}</div>`; kpis.appendChild(k); });
    content.appendChild(kpis);
    const chartCard = el('div', 'rv'); chartCard.style.cssText = 'background:var(--soft);border-radius:16px;padding:20px;flex:1;display:flex;flex-direction:column;min-height:0';
    chartCard.innerHTML = `<div style="font:600 13px var(--font);color:var(--ink);margin-bottom:12px">Evolução do saldo projetado — próximos 15 dias</div>`;
    const svgWrap = el('div'); svgWrap.style.cssText = 'flex:1;min-height:0';
    const pts = [44230, 51200, 49800, 58000, 62500, 60100, 68900, 71200, 75600, 79800, 77200, 83400, 87100, 89900, 91480];
    const max = Math.max(...pts), min = Math.min(...pts) * 0.9;
    const W = 900, H = 220;
    const path = pts.map((v, i) => { const x = (i / (pts.length - 1)) * W; const y = H - ((v - min) / (max - min)) * H; return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ');
    const area = path + ` L${W},${H} L0,${H} Z`;
    svgWrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%" preserveAspectRatio="none">
      <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7c3aed" stop-opacity="0.35"/><stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#fg)" id="areaPath" style="opacity:0;transition:opacity .6s"/>
      <path d="${path}" fill="none" stroke="#7c3aed" stroke-width="3" id="linePath" stroke-dasharray="2000" stroke-dashoffset="2000" style="transition:stroke-dashoffset 1.6s ease"/>
    </svg>`;
    chartCard.appendChild(svgWrap);
    content.appendChild(chartCard);
    return { chartCard };
  },
  async play(stage, refs, signal) {
    await sleep(300, signal); reveal(stage, '.rv'); await sleep(700, signal); if (signal.aborted) return;
    const line = stage.querySelector('#linePath'), area = stage.querySelector('#areaPath');
    if (line) line.style.strokeDashoffset = '0';
    if (area) area.style.opacity = '1';
    setCaption(stage, `Saldo projetado sobe pra <b>${money(91480)}</b> em 15 dias — sem surpresas no caixa.`);
    await sleep(2000, signal); if (signal.aborted) return;
    clearCaption(stage);
    const subItems = stage.querySelectorAll('.s-item');
    subItems.forEach(s => s.classList.remove('active'));
    const contratos = [...subItems].find(s => s.textContent.trim() === 'Contratos');
    await clickEl(stage, contratos, { ms: 700 }, signal); if (signal.aborted) return;
    contratos.classList.add('active');
    setCaption(stage, `<b>${SC.clientes.belaVista.nome}</b> tem contrato mensal — a régua de cobrança dispara a fatura automaticamente, sem planilha.`);
    await sleep(2600, signal);
  },
};

// ============================================================ PMOC
const chPmoc = {
  id: 'pmoc', title: 'PMOC', shell: 'core', top: 'operacao', route: 'gerenciarpmoc',
  build(stage) {
    const { content } = buildCoreShell(stage, { active: 'operacao', subs: ['PMOC', 'Equipamentos', 'Contratos'], activeSub: 'PMOC' });
    pageHead(content, 'Plano de Manutenção, Operação e Controle', '<div class="btn pri rv">+ Novo PMOC</div>');
    const tbl = el('div', 'rv'); tbl.style.cssText = 'background:#fff;border:1px solid var(--line);border-radius:16px;padding:6px;flex:1;overflow:hidden';
    const rows = [
      [SC.clientes.belaVista.nome, '02/01/2026 – 02/01/2027', SC.tecnicos[0].nome, 3, '#22c55e', 'Em dia'],
      [SC.clientes.autoPecas.nome, '18/11/2025 – 18/11/2026', SC.tecnicos[1].nome, 2, '#22c55e', 'Em dia'],
      [SC.clientes.shopping.nome, '05/09/2025 – 05/09/2026', SC.tecnicos[0].nome, 11, '#f59e0b', 'Vencendo'],
      [SC.clientes.clinica.nome, '20/06/2025 – 20/06/2026', SC.tecnicos[1].nome, 4, '#e11d48', 'Vencido'],
    ];
    tbl.innerHTML = `<table class="tbl"><thead><tr><th>Cliente</th><th>Período de vigência</th><th>Responsável</th><th>Equipamentos</th><th>Status</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td><span class="dot-status" style="background:${r[4]};display:inline-block;margin-right:7px"></span>${r[5]}</td></tr>`).join('')}</tbody></table>`;
    content.appendChild(tbl);
    return { tbl, firstRow: () => tbl.querySelector('tbody tr') };
  },
  async play(stage, refs, signal) {
    await sleep(300, signal); reveal(stage, '.rv'); await sleep(700, signal); if (signal.aborted) return;
    const row = refs.firstRow();
    setCaption(stage, `O PMOC de ar-condicionado é obrigatório por lei — o <b>${SC.clientes.belaVista.nome}</b> está em dia, tudo digital.`);
    await clickEl(stage, row, { ms: 800 }, signal); if (signal.aborted) return;
    row.style.background = 'var(--soft)';
    await sleep(1600, signal); if (signal.aborted) return;
    clearCaption(stage);
    setCaption(stage, 'Histórico de visitas, checklist e laudo — prontos pra apresentar numa fiscalização.');
    await sleep(2200, signal);
  },
};

// ============================================================ RELATÓRIOS
const chRelatorios = {
  id: 'relatorios', title: 'Relatórios · Dashboard', shell: 'core', top: 'relatorios', route: 'dashboard',
  build(stage) {
    const { content } = buildCoreShell(stage, { active: 'relatorios' });
    pageHead(content, 'Dashboard de produtividade');
    const kpis = el('div', 'kpis rv');
    [['Tarefas concluídas', '128'], ['SLA cumprido', '96%'], ['Satisfação média', '4.8 / 5'], ['Km rodado', '1.240 km']]
      .forEach(([l, v]) => { const k = el('div', 'kpi'); k.innerHTML = `<div class="l">${l}</div><div class="v">${v}</div>`; kpis.appendChild(k); });
    content.appendChild(kpis);
    const row = el('div', 'rv'); row.style.cssText = 'display:flex;gap:16px;flex:1;min-height:0';
    const bars = el('div'); bars.style.cssText = 'flex:1;background:var(--soft);border-radius:16px;padding:20px;display:flex;flex-direction:column;min-height:0';
    bars.innerHTML = '<div style="font:600 13px var(--font);color:var(--ink);margin-bottom:14px">Tarefas concluídas por técnico</div>';
    const bwrap = el('div'); bwrap.style.cssText = 'flex:1;display:flex;align-items:flex-end;gap:26px;padding:0 10px';
    const data = [['Carlos Mendes', 74, '#7c3aed'], ['Juliana Prado', 54, '#0ea5e9']];
    data.forEach(([n, v, c]) => {
      const col = el('div'); col.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end';
      const b = el('div'); b.className = 'bar-el'; b.style.cssText = `width:64px;height:0;background:linear-gradient(180deg,${c},${c}aa);border-radius:10px 10px 0 0;transition:height 1.1s ease`; b.dataset.h = (v / 80 * 100) + '%';
      col.appendChild(b);
      col.insertAdjacentHTML('beforeend', `<div style="font:700 15px var(--mono);color:var(--ink)">${v}</div><div style="font:500 12px var(--font);color:var(--mute)">${n}</div>`);
      bwrap.appendChild(col);
    });
    bars.appendChild(bwrap); row.appendChild(bars);
    const satis = el('div'); satis.style.cssText = 'width:280px;flex:0 0 auto;background:var(--soft);border-radius:16px;padding:20px';
    satis.innerHTML = `<div style="font:600 13px var(--font);color:var(--ink);margin-bottom:14px">Satisfação recente</div>` +
      [[SC.clientes.belaVista.nome, 5], [SC.clientes.studioNine.nome, 5], [SC.clientes.autoPecas.nome, 4]].map(([n, s]) => `<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:1px solid var(--line)"><span style="font:500 12.5px var(--font);color:var(--ink)">${n}</span><span style="color:#f59e0b">${'★'.repeat(s)}${'☆'.repeat(5 - s)}</span></div>`).join('');
    row.appendChild(satis);
    content.appendChild(row);
    return {};
  },
  async play(stage, refs, signal) {
    await sleep(300, signal); reveal(stage, '.rv'); await sleep(500, signal); if (signal.aborted) return;
    stage.querySelectorAll('.bar-el').forEach(b => { b.style.height = b.dataset.h; });
    setCaption(stage, 'Decisão com dado, não achismo: <b>quem produz mais</b>, onde o SLA aperta, quem tá satisfeito.');
    await sleep(2800, signal);
  },
};

// ============================================================ AUVODESK (bônus)
const chAuvodesk = {
  id: 'auvodesk', title: 'AuvoDesk · Tickets', shell: 'auvodesk', bonus: true, top: 'Tickets',
  build(stage) {
    const { content } = buildDeskShell(stage, { active: 'Tickets' });
    const h = el('div', 'p-head'); h.style.marginBottom = '16px';
    h.innerHTML = `<h2 class="p-title rv">Sexta-feira, 25 de setembro</h2><div class="p-actions rv"><div class="btn dk">+ Novo ticket</div></div>`;
    content.appendChild(h);
    const board = el('div', 'rv'); board.style.cssText = 'display:flex;gap:14px;flex:1;min-height:0';
    const cols = [
      { t: 'Novo', c: '#64748b', cards: [[SC.clientes.belaVista, 'Ar não gela — bloco B']] },
      { t: 'Em atendimento', c: '#0ea5e9', cards: [[SC.clientes.studioNine, 'Ruído no split da recepção']] },
      { t: 'Aguardando cliente', c: '#f59e0b', cards: [[SC.clientes.autoPecas, 'Orçamento de peça enviado']] },
      { t: 'Resolvido', c: '#16a34a', cards: [[SC.clientes.clinica, 'Manutenção concluída']] },
    ];
    let firstCard = null;
    cols.forEach(col => {
      const c = el('div'); c.style.cssText = 'flex:1;min-width:0;background:var(--dk-soft);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:10px';
      c.innerHTML = `<div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:${col.c}"></span><span style="font:600 13px var(--font);color:var(--dk-ink)">${col.t}</span></div>`;
      col.cards.forEach(([cli, txt]) => {
        const card = el('div'); card.style.cssText = 'background:#fff;border-radius:11px;padding:12px;box-shadow:0 3px 8px rgba(20,40,30,.06)';
        card.innerHTML = `<div style="font:600 13px var(--font);color:var(--dk-ink);margin-bottom:6px">${txt}</div><div style="font:500 11.5px var(--font);color:var(--dk-mute)">${cli.nome}</div>`;
        c.appendChild(card);
        if (!firstCard) firstCard = card;
      });
      board.appendChild(c);
    });
    content.appendChild(board);
    return { firstCard };
  },
  async play(stage, refs, signal) {
    await sleep(300, signal); reveal(stage, '.rv'); await sleep(700, signal); if (signal.aborted) return;
    setCaption(stage, `O mesmo <b>${SC.clientes.belaVista.nome}</b> do PMOC abriu um chamado — o AuvoDesk já sabe quem é o cliente.`);
    await clickEl(stage, refs.firstCard, { ms: 800, dk: true }, signal); if (signal.aborted) return;
    refs.firstCard.style.boxShadow = '0 0 0 2px #16a34a, 0 8px 18px rgba(20,140,60,.18)';
    await sleep(1600, signal); if (signal.aborted) return;
    clearCaption(stage);
    setCaption(stage, 'AuvoDesk é um sistema próprio, com a cara do seu cliente — mas conectado ao mesmo Auvo por trás.');
    await sleep(2600, signal);
  },
};

const CHAPTERS = [chOperacao, chCadastros, chFinanceiro, chPmoc, chRelatorios, chAuvodesk];
