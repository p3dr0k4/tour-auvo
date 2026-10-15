// ============================================================
// Modo explorar (Auvo OPS) como jogo: Guia (mascote com dicas), pontos, níveis,
// estrelas escondidas e conquistas. Só ativo no modo "explore".
// A dica NUNCA fica aberta por cima do conteúdo: aparece, digita, e se recolhe sozinha.
// ============================================================
const G = { xp: 30, simple: false, stars: new Set(), pages: new Set(), tips: new Set(), ach: new Set(), oses: 0, missions: 0, open: false, unread: false, tOpen: 0, tType: 0, tipIdx: 0, queue: [], started: false };
const LEVELS = [[0, 'Estagiário'], [150, 'Auxiliar de campo'], [350, 'Técnico'], [600, 'Supervisor'], [900, 'Gestor'], [1200, 'Diretor']];
const STAR_POS = { dashboard: [96, 92], wos: [3, 95], os: [60, 96], sr: [94, 93], assets: [97, 30], asset: [55, 95], preventive: [3, 96], sla: [96, 96], routing: [50, 95], analytics: [4, 96], jonas: [96, 12] };
const STAR_TOTAL = Object.keys(STAR_POS).length;

const TIPS = {
  dashboard: 'Este é o Painel: o que precisa de atenção agora, as próximas preventivas e os números do mês.',
  wos: 'A lista de OS tem filtros prontos: atrasadas, SLA em risco, sem assinatura do cliente. Também dá para ver em Kanban, Calendário e Despacho.',
  os: 'A OS junta tudo: ativos, SLA com o motivo do prazo, materiais, histórico, assinatura e o custo real.',
  sr: 'Aqui chegam os chamados, inclusive os abertos pelo cliente no Portal. Aprove para virar OS ou rejeite com motivo.',
  conv: 'Nas Conversas, o assistente responde os clientes na Área do Cliente e a equipe assume quando precisa.',
  assets: 'Cada ativo tem criticidade e cobertura de preventiva. O Chiller 01 tem a ficha completa: clique nele.',
  asset: 'A ficha do ativo mostra o que mais falha, o custo e o programa de manutenção. O QR Code vai colado no equipamento.',
  customers: 'Clientes com unidades, ativos e OS abertas. Tudo no OPS se liga a eles.',
  preventive: 'O calendário de preventivas mostra os planos do mês. A aderência diz quanto foi feito no prazo.',
  sla: 'Conformidade, violações e prazos correndo. As políticas definem resposta e solução por prioridade.',
  routing: 'Clique em “Montar rotas”: o Jonas encaixa as visitas por prioridade, prazo e distância e explica o que fez.',
  tracking: 'O rastreamento mostra quem está transmitindo, onde e em qual atendimento.',
  analytics: 'MTBF, MTTR, aderência de SLA e custo por OS. Cada cartão abre o relatório para agir.',
  jonas: 'O Jonas responde sobre OS, ativos e indicadores. Clique na primeira sugestão para ver uma resposta.',
};
const OS_TIP = 'No aplicativo do técnico ficam o check-in, o checklist, o material e a assinatura do cliente.';
const GENERIC = [
  () => `Missão atual: ${curMission().t}. ${hintFor(curMission().k)}.`,
  () => `Tem ${STAR_TOTAL} estrelas escondidas pelas telas. Você achou ${G.stars.size}. Elas piscam de leve, fique de olho.`,
  () => 'Passe pelo menu lateral: cada tela nova vale pontos.',
  () => 'Já pediu ao Jonas o resumo de uma OS? Abra a OS-00412 e clique em “Resumir com o Jonas”.',
  () => 'Na ficha do Chiller 01, a aba “Ordens de serviço” mostra todo o histórico do equipamento.',
];

const curMission = () => MISSIONS.find(m => !S.visited.has(m.k)) || MISSIONS[MISSIONS.length - 1];
const levelOf = xp => { let i = 0; LEVELS.forEach(([t], k) => { if (xp >= t) i = k; }); return i; };
const REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches;

// ---------- ícones ----------
const SVG = {
  guide: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M11 3.2l1.9 5.1 5.1 1.9-5.1 1.9L11 17.2l-1.9-5.1-5.1-1.9 5.1-1.9z" fill="#fff"/><path d="M18.2 14.6l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z" fill="#fff" opacity=".85"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="#fde047" stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8.5 20h7" fill="none" stroke="#1a1200" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

// ---------- interface do guia ----------
function ensureGuide() {
  let g = $('#guide');
  if (g) return g;
  g = document.createElement('div');
  g.id = 'guide';
  g.innerHTML = `<div class="gbub" role="status" aria-live="polite"><div class="gh"><b>Guia</b><button class="gx" data-g="close" aria-label="Fechar dica">×</button></div><p id="gtext"></p><div class="gact"><button data-g="next">Outra dica</button><button class="ok" data-g="close">Entendi</button></div></div>
    <button class="gav" data-g="toggle" aria-label="Abrir dicas do Guia">${SVG.guide}<i class="gdot"></i></button>`;
  document.body.appendChild(g);
  const a = document.createElement('div'); a.id = 'ach'; document.body.appendChild(a);
  g.addEventListener('click', e => {
    const b = e.target.closest('[data-g]'); if (!b) return;
    if (b.dataset.g === 'close') closeGuide();
    else if (b.dataset.g === 'toggle') G.open ? closeGuide() : (G.unread && G.last ? openGuide(G.last, true) : nextTip());
    else if (b.dataset.g === 'next') nextTip();
  });
  g.addEventListener('mouseenter', () => clearTimeout(G.tOpen));
  return g;
}
function typeInto(el, text) {
  clearInterval(G.tType);
  if (REDUCED) { el.textContent = text; return; }
  let i = 0; el.textContent = '';
  G.tType = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(G.tType); }, 16);
}
function openGuide(text, keep) {
  const g = ensureGuide();
  G.last = text; G.open = true; G.unread = false;
  g.classList.add('open'); g.classList.remove('new');
  typeInto($('#gtext'), text);
  clearTimeout(G.tOpen);
  if (!keep) G.tOpen = setTimeout(closeGuide, 6500 + text.length * 40);
}
function closeGuide() { const g = $('#guide'); if (!g) return; G.open = false; g.classList.remove('open'); clearInterval(G.tType); clearTimeout(G.tOpen); }
// dica que chega sem interromper: se o Guia estiver fechado, só pisca o avatar (e abre sozinho nas primeiras)
function tip(text, { force = false, key } = {}) {
  if (!text || G.simple) return;
  if (key) { if (G.tips.has(key)) return; G.tips.add(key); }
  const g = ensureGuide(); G.last = text;
  if (force || G.tips.size <= 2) openGuide(text);
  else { G.unread = true; g.classList.add('new'); }
}
function nextTip() { const f = GENERIC[G.tipIdx++ % GENERIC.length]; openGuide(f(), true); clearTimeout(G.tOpen); G.tOpen = setTimeout(closeGuide, 12000); }

// ---------- pontos, nível, conquistas ----------
const ACH = [
  { id: 'p8', t: 'Explorador', d: 'Visitou 8 telas', ok: () => G.pages.size >= 8 },
  { id: 'p20', t: 'Cartógrafo', d: 'Visitou 20 telas', ok: () => G.pages.size >= 20 },
  { id: 's3', t: 'Caçador de estrelas', d: '3 estrelas encontradas', ok: () => G.stars.size >= 3 },
  { id: 'sall', t: 'Constelação completa', d: 'Todas as estrelas', ok: () => G.stars.size >= STAR_TOTAL },
  { id: 'os3', t: 'Detetive de OS', d: 'Abriu 3 OS', ok: () => G.oses >= 3 },
  { id: 'm4', t: 'Meio caminho', d: '4 missões cumpridas', ok: () => G.missions >= 4 },
  { id: 'mall', t: 'Especialista OPS', d: 'Todas as missões', ok: () => G.missions >= MISSIONS.length },
];
const achQueue = []; let achBusy = false;
function popAch(title, sub) {
  if (G.simple) return;
  achQueue.push([title, sub]);
  if (achBusy) return; achBusy = true;
  const run = () => {
    const n = achQueue.shift(); if (!n) { achBusy = false; return; }
    const a = ensureGuide() && $('#ach');
    a.innerHTML = `<span class="ai">${SVG.trophy}</span><div><small>Conquista desbloqueada</small><b>${n[0]}</b><em>${n[1]}</em></div>`;
    a.classList.add('on');
    setTimeout(() => { a.classList.remove('on'); setTimeout(run, 400); }, 3600);
  };
  run();
}
function checkAch() { ACH.forEach(a => { if (!G.ach.has(a.id) && a.ok()) { G.ach.add(a.id); popAch(a.t, a.d); } }); }
function addXp(n) {
  const before = levelOf(G.xp); G.xp += n; const after = levelOf(G.xp);
  if (after > before) { popAch(`Nível ${after + 1}: ${LEVELS[after][1]}`, `${G.xp} pontos`); tip(`Subiu de nível! Agora você é ${LEVELS[after][1]}.`, { force: true }); }
  checkAch(); updateBottom();
}
window.gameHud = () => {
  if (G.simple) return '';
  const l = levelOf(G.xp), lo = LEVELS[l][0], hi = (LEVELS[l + 1] || [lo + 1])[0], pct = l === LEVELS.length - 1 ? 100 : Math.round(((G.xp - lo) / (hi - lo)) * 100);
  return `<div class="hud" aria-label="Sua pontuação"><div class="lv"><small>Nível ${l + 1}</small><b>${LEVELS[l][1]}</b></div><div class="xpb" role="img" aria-label="${pct}% para o próximo nível"><i style="width:${pct}%"></i></div><div class="pts"><b>${G.xp}</b><small>pontos</small></div><div class="stc" title="Estrelas escondidas">${SVG.star}<b>${G.stars.size}/${STAR_TOTAL}</b></div></div>`;
};

// ---------- estrelas escondidas ----------
function placeStar() {
  $$('.gstar').forEach(s => s.remove());
  const pos = STAR_POS[S.page], c = $('#content'); if (!pos || !c || G.stars.has(S.page) || G.simple) return;
  const s = document.createElement('button');
  s.className = 'gstar'; s.dataset.act = 'star'; s.setAttribute('aria-label', 'Estrela escondida'); s.innerHTML = SVG.star;
  s.style.left = pos[0] + '%'; s.style.top = pos[1] + '%';
  c.appendChild(s);
}
window.gameStar = el => {
  if (G.stars.has(S.page)) return;
  G.stars.add(S.page);
  const r = document.createElement('div'); r.className = 'sburst'; r.innerHTML = '<span>+25</span>';
  el.replaceWith(r); setTimeout(() => r.remove(), 1100);
  addXp(25);
  const left = STAR_TOTAL - G.stars.size;
  tip(left ? `Estrela encontrada! Faltam ${left}. Elas ficam nos cantos vazios das telas.` : 'Você achou todas as estrelas!', { force: true });
};

// ---------- ganchos chamados por app.js ----------
window.gameOnMode = m => {
  const g = ensureGuide();
  g.style.display = m === 'explore' ? '' : 'none';
  if (m !== 'explore') { closeGuide(); return; }
  if (!G.started) {
    G.started = true;
    setTimeout(() => S.mode === 'explore' && openGuide('Oi! Eu sou o Guia. Explore o Auvo OPS como num jogo: cumpra as missões, junte pontos (você já começa com 30) e ache as ★ escondidas. Prefere sem pontos? Ative o “Modo simples” em Missões.'), 1200);
  }
};
window.gameOnRender = () => {
  if (S.mode !== 'explore') return;
  const g = ensureGuide(); g.style.display = '';
  if (!G.pages.has(S.page)) { G.pages.add(S.page); G.pages.size > 1 && addXp(10); }
  if (S.page === 'os') { G.oses++; checkAch(); }
  placeStar(); const pg = S.page, txt = TIPS[pg]; if (txt) setTimeout(() => S.mode === 'explore' && S.page === pg && !S.modal && tip(txt, { key: 'page:' + pg }), 900);
};
window.gameOnModal = type => {
  if (S.mode !== 'explore') return;
  if (type === 'app') setTimeout(() => S.mode === 'explore' && tip(OS_TIP + ' Toque em “Coletar assinatura” e assine no quadro.', { key: 'app' }), 700);
  if (type === 'qr') setTimeout(() => S.mode === 'explore' && tip('Quem ler este QR com o celular abre a ficha do ativo na frente da máquina.', { key: 'qr' }), 700);
};
window.gameOnMission = k => {
  G.missions++; addXp(100);
  const nx = MISSIONS.find(m => !S.visited.has(m.k));
  tip(nx ? `Missão cumprida! +100 pontos. Próxima: ${nx.t}. ${hintFor(nx.k)}.` : 'Missões concluídas! Ainda dá para achar as estrelas que faltam.', { force: true });
};

// se a página abriu direto no modo explorar (#explorar), os ganchos ainda não existiam
if (S.mode === 'explore') { window.gameOnMode('explore'); window.gameOnRender(); updateBottom(); }

// Modo simples: sem pontos, estrelas, conquistas nem Guia (só as missões e as dicas na barra)
// no modo apresentação (?apresentar=1) o jogo fica desligado para não disputar atenção com quem apresenta
try { G.simple = PRESENT || localStorage.getItem('auvoOpsSimple') === '1'; } catch (e) { G.simple = PRESENT; }
document.body.classList.toggle('simple', G.simple);
window.gameToggleSimple = v => {
  G.simple = !!v; try { localStorage.setItem('auvoOpsSimple', v ? '1' : '0'); } catch (e) { /* sem storage */ }
  document.body.classList.toggle('simple', G.simple);
  if (G.simple) { closeGuide(); $$('.gstar').forEach(s => s.remove()); } else placeStar();
  updateBottom();
};
