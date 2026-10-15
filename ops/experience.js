// ============================================================
// Camada de experiência do tour do Auvo OPS (convite para clientes selecionados):
// - personalização em 3 toques (operação, tamanho da equipe, principal desafio)
// - cartões de capítulo, legenda em duas linhas e notificações
// - final com o fio completo do chamado ao indicador e a conversa com o especialista
// O cenário é fictício. Não há promessa de preço, prazo ou condição: isso fica para a conversa.
// ============================================================
const PRESENT = new URLSearchParams(location.search).get('apresentar') === '1';
if (PRESENT) document.body.classList.add('present');

/* ---------------- ícones de traço ---------------- */
const XP = {
  hosp: '<path d="M4 21V7l8-4 8 4v14M9 21v-5h6v5M12 8v5M9.5 10.5h5M3 21h18"/>',
  fact: '<path d="M3 21V10l5 3V10l5 3V6h4l1 15M3 21h18M15.5 9.5h1"/>',
  snow: '<path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M9 3.5 12 6l3-2.5M9 20.5 12 18l3 2.5"/>',
  bldg: '<path d="M4 21V5.5L12 3v18M12 8h8v13M7.5 8.5h1M7.5 12h1M7.5 15.5h1M15.5 11.5h1M15.5 15h1M3 21h18"/>',
  cart: '<path d="M3.5 4.5h2.5l2.2 10.5h10l2-7.5H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
  tool: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19l-3 1 1-3 7.5-7.5a4 4 0 0 1-5-5z"/><path d="M4 14l6 6"/>',
  chat: '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-8l-5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z"/>',
  ticket: '<path d="M4 6.5h16v3.2a2.3 2.3 0 0 0 0 4.6v3.2H4v-3.2a2.3 2.3 0 0 0 0-4.6z"/><path d="M14 6.5v11" stroke-dasharray="2 2"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3"/>',
  pin: '<path d="M12 21.5s7-6.2 7-11.8a7 7 0 0 0-14 0c0 5.6 7 11.8 7 11.8z"/><circle cx="12" cy="9.7" r="2.6"/>',
  pen: '<path d="M4 20l1.2-4.2L16.5 4.5a2 2 0 0 1 3 3L8.2 18.8z"/><path d="M14.5 6.5l3 3"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12l2.2 2.2 4.3-4.4"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>',
  box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  spark: '<path d="M11 3.5l1.7 4.8 4.8 1.7-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.7z"/><path d="M18 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  wa: '<path d="M4.5 19.5l1.2-3.6A8.2 8.2 0 1 1 8.3 18.4z"/><path d="M9.2 8.6c.2-.5.7-.5 1-.1l.7 1.4c.1.3 0 .6-.2.8l-.5.5c.5 1.1 1.4 2 2.6 2.6l.5-.5c.2-.2.5-.3.8-.2l1.4.7c.4.2.4.8-.1 1-1.9 1-5.9-2.4-6.2-5.2z" fill="currentColor" stroke="none"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
};
const xi = (n, s = 24) => '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + XP[n] + '</svg>';

/* ---------------- personalização ---------------- */
const AREAS = [
  { k: 'saude', t: 'Hospitais e saúde', s: 'Engenharia clínica, utilidades e climatização', short: 'saúde', ic: 'hosp' },
  { k: 'industria', t: 'Indústria', s: 'Máquinas, utilidades e manutenção da planta', short: 'indústria', ic: 'fact' },
  { k: 'clima', t: 'Climatização e refrigeração', s: 'Chillers, câmaras frias e PMOC', short: 'climatização', ic: 'snow' },
  { k: 'predial', t: 'Edifícios e shoppings', s: 'Facilities, elevadores e sistemas prediais', short: 'manutenção predial', ic: 'bldg' },
  { k: 'varejo', t: 'Redes e varejo', s: 'Várias unidades, equipamentos espalhados', short: 'redes com várias unidades', ic: 'cart' },
  { k: 'outros', t: 'Outros serviços em campo', s: 'Contratos de manutenção em geral', short: 'manutenção em campo', ic: 'tool' },
];
const TEAMS = ['Até 10', '11 a 30', '31 a 80', 'Mais de 80'];
// v = o desafio dentro de uma frase ("O ponto de partida para ...")
const PAINS = [
  { k: 'chamados', t: 'Não perder chamados', v: 'não perder nenhum chamado', s: 'Portal do cliente e triagem num lugar só', ch: ['chamado'], mods: ['Central de atendimento', 'Chamados pelo Portal'], ic: 'chat' },
  { k: 'sla', t: 'Cumprir o SLA dos contratos', v: 'cumprir o SLA dos contratos', s: 'Prazo calculado sozinho e aviso antes de vencer', ch: ['sla', 'gestao'], mods: ['Políticas de SLA', 'Avisos de prazo'], ic: 'shield' },
  { k: 'rotas', t: 'Organizar a equipe e as rotas', v: 'organizar a equipe e as rotas', s: 'Quem vai, em que ordem e por qual caminho', ch: ['rotas', 'campo'], mods: ['Rotas com IA', 'Rastreamento ao vivo'], ic: 'route' },
  { k: 'ativos', t: 'Conhecer cada ativo', v: 'conhecer o histórico e o custo de cada ativo', s: 'Histórico, custo e o que mais falha', ch: ['ativo'], mods: ['Ficha do ativo com QR Code', 'Custo real por OS'], ic: 'box' },
  { k: 'preventiva', t: 'Preventiva e PMOC em dia', v: 'manter a preventiva e o PMOC em dia', s: 'Planos, calendário e aderência', ch: ['ativo'], mods: ['Planos de preventiva', 'Gerar PMOC'], ic: 'cal' },
  { k: 'dados', t: 'Decidir com dados', v: 'decidir com dados', s: 'MTBF, MTTR, custo e o Jonas respondendo', ch: ['gestao', 'jonas'], mods: ['Relatórios de confiabilidade', 'Jonas, a IA da Auvo'], ic: 'chart' },
];
const Q = { area: null, team: null, pain: null, done: false };
try { Object.assign(Q, JSON.parse(sessionStorage.getItem('auvoOpsQ') || '{}')); } catch (e) { /* sem storage */ }
const saveQ = () => { try { sessionStorage.setItem('auvoOpsQ', JSON.stringify(Q)); } catch (e) { /* sem storage */ } };
const areaOf = () => AREAS.find(a => a.k === Q.area) || null;
const painOf = () => PAINS.find(p => p.k === Q.pain) || null;
const chapMine = ch => { const p = painOf(); return !!(p && ch && p.ch.includes(ch.id)); };
const painsFor = () => PAINS;

function waUrl() {
  const a = areaOf();
  let t = SALES.waText;
  if (a) t += ' Nosso segmento: ' + a.t.toLowerCase() + (Q.team ? ', com ' + Q.team.toLowerCase() + ' técnicos' : '') + '.';
  const p = painOf(); if (p) t += ' O que mais queremos resolver: ' + p.v + '.';
  return 'https://wa.me/' + SALES.waNumber + '?text=' + encodeURIComponent(t);
}
function refreshCta() { const c = $('#hCta'); if (c) c.href = waUrl(); }
refreshCta();
$('#hCta').addEventListener('click', () => track('cta_whatsapp', { from: 'topo' }));

let qStep = 0;
window.quizOpen = () => {
  qStep = Q.area ? (Q.team ? (Q.pain ? 3 : 2) : 1) : 0;
  if (window.heroNotes) window.heroNotes(false);
  renderQuiz(); $('#quiz').classList.add('on'); track('quiz_open');
};
function quizClose() { $('#quiz').classList.remove('on'); }
function renderQuiz() {
  const z = $('#quiz');
  const dots = [0, 1, 2].map(i => '<i class="' + (i === qStep ? 'on' : i < qStep ? 'd' : '') + '"></i>').join('');
  let body = '';
  if (qStep === 0) {
    body = '<div class="qeb">Seu tour do Auvo OPS · 1 de 3</div><h2>Qual é a sua operação?</h2><p class="qs">O tour dá destaque ao que importa para vocês. Leva 10 segundos.</p>' +
      '<div class="qgrid">' + AREAS.map(a => '<button class="qo' + (Q.area === a.k ? ' sel' : '') + '" data-q="area" data-v="' + a.k + '"><span class="qi">' + xi(a.ic) + '</span><span>' + a.t + '<br><small>' + a.s + '</small></span></button>').join('') + '</div>';
  } else if (qStep === 1) {
    body = '<div class="qeb">Seu tour do Auvo OPS · 2 de 3</div><h2>Quantos técnicos vocês têm em campo?</h2><p class="qs">Para mostrar o OPS no tamanho da sua equipe.</p>' +
      '<div class="qchips">' + TEAMS.map(t => '<button class="qchip' + (Q.team === t ? ' sel' : '') + '" data-q="team" data-v="' + t + '">' + t + '</button>').join('') + '</div>';
  } else if (qStep === 2) {
    body = '<div class="qeb">Seu tour do Auvo OPS · 3 de 3</div><h2>O que vocês mais querem resolver?</h2><p class="qs">Esse capítulo vem marcado no caminho.</p>' +
      '<div class="qgrid">' + painsFor().map(p => '<button class="qo' + (Q.pain === p.k ? ' sel' : '') + '" data-q="pain" data-v="' + p.k + '"><span class="qi">' + xi(p.ic) + '</span><span>' + p.t + '<br><small>' + p.s + '</small></span></button>').join('') + '</div>';
  } else {
    const chs = window.activeChapters ? window.activeChapters() : [], a = areaOf(), p = painOf();
    const estC = c => (window.narr ? window.narr.est(c) : c.est);
    const mins = Math.max(2, Math.round(chs.reduce((s, c) => s + estC(c) + 3.1, 0) / 60));
    body = '<div class="qeb">Seu tour está pronto</div><h2>' + chs.length + ' capítulos. Cerca de ' + mins + ' minutos.</h2>' +
      '<p class="qs">Um dia de manutenção no Auvo OPS, do chamado no Portal ao indicador.' + (p ? ' O capítulo do seu desafio vem marcado.' : '') + '</p>' +
      (a && a.k !== 'saude' ? '<p class="qnote">O exemplo é de um hospital. Em ' + a.short + ', o fluxo é o mesmo.</p>' : '') +
      '<div class="qplan">' + chs.map((c, i) => '<span class="' + (chapMine(c) ? 'mine' : '') + '"><b>' + (i + 1) + '</b>' + c.l + '</span>').join('') + '</div>' +
      '<button class="pbtn" data-q="go"><span class="pi">' + xi('play', 15) + '</span>Começar o tour</button>' +
      '<div class="qvrow">' + (window.narr ? window.narr.pill() : '') + '</div>';
  }
  const foot = qStep < 3 ? (qStep > 0 ? '<button class="qlink" data-q="back">‹ Voltar</button>' : '') + '<button class="qlink" data-q="skip">Pular e começar o tour</button>' : '<button class="qlink" data-q="back">‹ Voltar</button>';
  z.innerHTML = '<div class="qz"><div class="qdots">' + dots + '</div>' + body + '<div class="qfoot">' + foot + '</div></div>';
  const f = $('.qo.sel,.qchip.sel,[data-q="go"],.qo,.qchip', z); if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
}
$('#quiz').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const q = b.dataset.q, v = b.dataset.v;
  if (q === 'area' || q === 'team' || q === 'pain') {
    Q[q] = v; saveQ(); refreshCta(); track('quiz', { step: q, value: v });
    $$('[data-q="' + q + '"]', $('#quiz')).forEach(x => x.classList.toggle('sel', x === b));
    setTimeout(() => { qStep++; renderQuiz(); }, 220);
  } else if (q === 'back') { qStep = Math.max(0, qStep - 1); renderQuiz(); }
  else if (q === 'vo') { window.narr.toggle('personalizacao'); renderQuiz(); }
  else if (q === 'skip') { track('quiz_skip', { step: qStep }); quizClose(); startGuided(0); }
  else if (q === 'go') { Q.done = true; saveQ(); refreshCta(); track('quiz_done', { area: Q.area, team: Q.team, pain: Q.pain }); quizClose(); startGuided(0); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#quiz').classList.contains('on')) { quizClose(); if (S.mode === 'hero' && window.heroNotes) window.heroNotes(true); }
});
window.beginTour = () => {
  if (PRESENT || Q.done) return startGuided(0);
  if (S.mode !== 'hero') setMode('hero');
  window.quizOpen();
};

/* ---------------- cartão de capítulo ---------------- */
const CHAIN = ['Chamado', 'OS + SLA', 'Rotas', 'Em campo', 'Assinatura', 'Ativo', 'Gestão'];
const chainHTML = at => '<div class="chain" aria-hidden="true">' + CHAIN.map((c, i) => '<span class="' + (i < at ? 'd' : i === at ? 'on' : '') + '"><i></i>' + c + '</span>' + (i < CHAIN.length - 1 ? '<em></em>' : '')).join('') + '</div>';
let cardSeq = 0;
window.showCard = async (ch, idx, total, sig, setup) => {
  const c = $('#card'), p = painOf(), my = ++cardSeq;
  const sub = typeof ch.sub === 'function' ? ch.sub() : ch.sub;
  const voHint = idx === 0 && window.narr && window.narr.on() ? '<div class="cvo">' + window.narr.icon() + (MOB ? 'Com narração · toque no alto-falante da barra para silenciar' : 'Com narração · M ou o alto-falante da barra desligam') + '</div>' : '';
  c.innerHTML = '<div class="cc"><div class="cn">Capítulo ' + (idx + 1) + ' de ' + total + '</div>' + (chapMine(ch) ? '<div><span class="mine">★ Seu desafio · ' + p.t + '</span></div>' : '') + '<div class="ce">' + ch.time + '</div><h2>' + ch.title + '</h2><p>' + sub + '</p>' + chainHTML(ch.chain) + '</div>' + voHint + '<div class="cskip">Clique para continuar</div>';
  c.classList.remove('out'); c.classList.add('on'); document.body.classList.add('carding');
  say(''); showCursor(false); window.capAt(null);
  const end = () => { if (my === cardSeq) { c.classList.remove('on', 'out'); document.body.classList.remove('carding'); } };
  let skip = false; const onClick = () => { skip = true; };
  c.addEventListener('click', onClick, { once: true });
  let spoke = !window.narr; if (window.narr) window.narr.say(ch.nar, sig).then(() => { spoke = true; });
  await sleep(380, sig);
  if (setup && !sig.aborted) setup();
  const hold = matchMedia('(prefers-reduced-motion:reduce)').matches ? 1300 : 2300;
  let t = 0; while ((t < hold || !spoke) && !skip && !sig.aborted) { await pwait(100, sig); t += 100; }
  if (skip && !spoke && window.narr) window.narr.cut();
  c.removeEventListener('click', onClick);
  if (sig.aborted) return end();
  c.classList.add('out'); await sleep(420, sig);
  end();
  if (S.mode === 'guided' && my === cardSeq) showCursor(true);
};
function hideCard() { cardSeq++; const c = $('#card'); c.classList.remove('on', 'out'); document.body.classList.remove('carding'); }
window.hideCard = hideCard;

/* ---------------- legenda ---------------- */
let capTop = false;
window.capAt = y => {
  const top = y == null ? false : y > SH * 0.6 ? true : y < SH * 0.45 ? false : capTop;
  if (top === capTop) return;
  capTop = top; $('#lt').classList.toggle('up', top);
};
window.lowerThird = (t, d) => {
  const lt = $('#lt'), gc = $('#gcap');
  if (!t) { lt.innerHTML = ''; if (gc) gc.innerHTML = ''; return; }
  const ch = window.tourChapter ? window.tourChapter() : null;
  lt.innerHTML = '<div class="ltc">' + (ch ? '<span class="lk">' + ch.l + '</span>' : '') + '<div class="lx"><b>' + t + '</b>' + (d ? '<p>' + d + '</p>' : '') + '</div></div>';
  if (gc) gc.innerHTML = '<b>' + t + '</b>' + (d ? '<p>' + d + '</p>' : '');
};

/* ---------------- notificações ---------------- */
const NAPP = { portal: ['Portal do cliente', '#1d4ed8', 'chat'], ops: ['Auvo OPS', '#6d26c2', 'ticket'], jonas: ['Jonas', '#7c3aed', 'spark'], app: ['App do técnico', '#4d7a04', 'pin'], sign: ['Assinatura', '#4d7a04', 'pen'] };
window.notify = (n, host) => {
  const box = host || $('#nt'); if (!box) return;
  const [app, color, ic] = NAPP[n.k];
  const el = document.createElement('div'); el.className = 'nt';
  el.innerHTML = '<span class="ni" style="background:' + color + '">' + xi(ic, 20) + '</span><div class="nb"><div class="nh"><span>' + app + '</span><span>' + (n.time || 'agora') + '</span></div><b>' + n.title + '</b><p>' + n.body + '</p></div>';
  box.appendChild(el);
  while (box.children.length > 3) box.firstElementChild.remove();
  if (n.ttl !== 0) setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 460); }, n.ttl || 4600);
  return el;
};
const STORY = [
  { k: 'portal', title: 'Renata Prado · Hospital Santa Aurora', body: 'Chiller 01 desarmando por alta pressão. Precisamos de alguém hoje cedo.', time: 'qui 07:52' },
  { k: 'ops', title: 'OS-00412 criada', body: 'Prioridade alta · SLA de resposta: 2 horas', time: '07:55' },
  { k: 'jonas', title: 'Rotas do dia prontas', body: '9 visitas · 3 técnicos · 86 km', time: '08:10' },
  { k: 'app', title: 'Carlos fez check-in', body: 'Hospital Santa Aurora · a 24 m do local', time: '09:05' },
  { k: 'sign', title: 'OS-00412 concluída', body: 'Assinatura de Renata Prado no aplicativo', time: '10:48' },
];
let heroNT = null;
window.heroNotes = on => {
  if (heroNT) { heroNT.abort(); heroNT = null; }
  const clear = h => { if (h) h.innerHTML = ''; };
  clear($('#nt')); clear($('#hnt'));
  if (!on) return;
  heroNT = new AbortController(); const sig = heroNT.signal;
  (async () => {
    await sleep(1200, sig);
    while (!sig.aborted) {
      const host = MOB ? $('#hnt') : $('#nt');
      for (const n of STORY) { if (sig.aborted) return; window.notify({ ...n, ttl: 0 }, host); await sleep(2300, sig); }
      await sleep(2600, sig);
      if (host) [...host.children].forEach(x => x.classList.add('out'));
      await sleep(600, sig); clear(host);
    }
  })();
};

/* ---------------- avisos do palco ---------------- */
function stageToast(msg) {
  let t = $('#stoast');
  if (!t) { t = document.createElement('div'); t.id = 'stoast'; $('#stage').appendChild(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600);
}
async function shareTour() {
  const url = location.origin + location.pathname;
  const text = 'Veja o Auvo OPS neste tour de 3 minutos: ' + url;
  if (MOB && navigator.share) { try { await navigator.share({ title: 'Tour Auvo OPS', text, url }); track('share', { via: 'nativo' }); return; } catch (e) { /* cancelado */ } }
  try { await navigator.clipboard.writeText(url); stageToast('Link copiado. Envie para quem decide com você.'); track('share', { via: 'copiar' }); }
  catch (e) { stageToast('Copie o link: ' + url); }
}

/* ---------------- final ---------------- */
const MORE = [['tracking', 'Rastreamento ao vivo'], ['analytics', 'Relatórios'], ['preventive', 'Preventiva'], ['customers', 'Clientes'], ['conv', 'Conversas do Portal'], ['wos', 'Ordens de serviço']];
const FLOW = [['chat', 'Chamado', 'qui 07:52'], ['ticket', 'OS + SLA', '07:55'], ['route', 'Rotas', '08:10'], ['pin', 'Em campo', '09:05'], ['pen', 'Assinatura', '10:48'], ['chart', 'Indicadores', '18:00']];
function recoCard() {
  const a = areaOf(), p = painOf();
  if (p) {
    const who = a ? 'Para ' + a.short + (Q.team ? ', com ' + Q.team.toLowerCase() + ' técnicos' : '') : 'Para a sua operação';
    return '<div class="fcard"><h3>' + who + '</h3><p>O ponto de partida para ' + p.v + '. E tudo conversa com ativos, SLA e indicadores.</p><div class="fmods">' + p.mods.map(m => '<span>' + xi('check', 16) + m + '</span>').join('') + '</div></div>';
  }
  return '<div class="fcard"><h3>Qual é o maior desafio de vocês hoje?</h3><p>Escolha um. O especialista já chega sabendo por onde começar.</p><div class="fmods">' + painsFor().map(x => '<button data-f="pain" data-v="' + x.k + '">' + x.t + '</button>').join('') + '</div></div>';
}
window.finale = explored => {
  const e = $('#end');
  hideCard(); say('');
  const simple = document.body.classList.contains('simple');
  let stat = '', sub = 'Do Portal ao indicador no mesmo dia. Cada ativo com histórico, cada prazo com dono e o Jonas respondendo sobre a operação.';
  if (explored && typeof G !== 'undefined') {
    const seen = new Set(); G.pages.forEach(pg => { if (MOD_NAME[pg]) seen.add(pg); });
    sub = 'Você explorou ' + seen.size + ' de ' + Object.keys(MOD_NAME).length + ' áreas do Auvo OPS e viu, na prática, como tudo se conecta.';
    if (!simple) stat = '<div class="fstat"><span>' + G.xp + ' pontos</span><span>Nível ' + (levelOf(G.xp) + 1) + ' · ' + LEVELS[levelOf(G.xp)][1] + '</span><span>' + G.stars.size + ' de ' + STAR_TOTAL + ' estrelas</span></div>';
  }
  e.innerHTML = '<div class="fin">' +
    '<div class="feb">' + (explored ? 'Modo explorar concluído' : 'Um dia no Auvo OPS') + '</div>' +
    '<h2>Tudo <span class="g">conectado.</span></h2>' +
    '<p class="fsub">' + sub + '</p>' + stat +
    '<div class="flow">' + FLOW.map(([ic, l, t], i) => '<div class="fstep" style="animation-delay:' + (0.45 + i * 0.12) + 's"><span class="fi">' + xi(ic, 28) + '</span><b>' + l + '</b><small>' + t + '</small></div>').join('') + '</div>' +
    '<div class="fgrid"><div id="freco">' + recoCard() + '</div>' +
    '<div class="fcard fact"><div class="fexc">' + xi('spark', 18) + 'O Auvo OPS está sendo liberado por convite, para um grupo selecionado de clientes.</div><a class="pbtn" id="fWa" href="' + waUrl() + '" target="_blank" rel="noopener"><span class="pi">' + xi('wa', 16) + '</span>Quero conversar sobre o acesso</a>' +
    '<div class="ftrust">' + SALES.trust.map(t => '<span>' + t + '</span>').join('') + '</div></div></div>' +
    '<div class="fmore"><b>Veja também:</b>' + MORE.map(([id, l]) => '<button class="gbtn" data-f="more" data-v="' + id + '">' + l + '</button>').join('') + '</div>' +
    '<div class="flinks"><button class="lnkbtn" data-f="explore">Explorar por conta própria <span class="ch">›</span></button><button class="lnkbtn" data-f="share">Compartilhar com quem decide <span class="ch">›</span></button><button class="lnkbtn" data-f="replay">Rever o tour <span class="ch">›</span></button></div>' +
    '</div>';
  e.classList.add('on'); e.scrollTop = 0;
  track('finish', { explored: !!explored, area: Q.area, pain: Q.pain });
};
$('#end').addEventListener('click', ev => {
  const b = ev.target.closest('[data-f],#fWa'); if (!b) return;
  if (b.id === 'fWa') return track('cta_whatsapp', { from: 'final', area: Q.area, pain: Q.pain });
  const f = b.dataset.f, e = $('#end');
  if (f === 'pain') { Q.pain = b.dataset.v; saveQ(); refreshCta(); track('final_pain', { pain: Q.pain }); $('#freco').innerHTML = recoCard(); $('#fWa').href = waUrl(); return; }
  if (f === 'share') return shareTour();
  if (f === 'replay') { e.classList.remove('on'); return startGuided(0); }
  if (f === 'explore') { e.classList.remove('on'); return enterExplore(); }
  if (f === 'more') { e.classList.remove('on'); track('final_more', { page: b.dataset.v }); if (S.mode !== 'explore') enterExplore(); go(b.dataset.v); }
});

if (S.mode === 'hero') window.heroNotes(true);
