// ============================================================
// Camada comercial do tour:
// - personalização em 3 toques (perguntas de situação e problema, no estilo SPIN)
// - cartões de capítulo (hora + promessa), legenda em duas linhas e notificações
// - final com o fio completo do chamado à cobrança, recomendação e chamadas para ação
// Tudo o que é fictício é o cenário da empresa de exemplo; prova social vem de auvo.com.
// ============================================================
const PRESENT = new URLSearchParams(location.search).get('apresentar') === '1';
if (PRESENT) document.body.classList.add('present');

/* ---------------- ícones de traço ---------------- */
const XP = {
  snow: '<path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M9 3.5 12 6l3-2.5M9 20.5 12 18l3 2.5"/>',
  lift: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 3v18M8.5 9.5 10 8l1.5 1.5M12.5 14.5 14 16l1.5-1.5"/>',
  cam: '<path d="M3 7.5h12.5l3-2.5v10l-3-2.5H3z"/><path d="M7 12.5v5.5M4 18h6"/>',
  bldg: '<path d="M4 21V5.5L12 3v18M12 8h8v13M7.5 8.5h1M7.5 12h1M7.5 15.5h1M15.5 11.5h1M15.5 15h1M3 21h18"/>',
  wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0"/><circle cx="12" cy="19.2" r="1.1" fill="currentColor"/>',
  tool: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19l-3 1 1-3 7.5-7.5a4 4 0 0 1-5-5z"/><path d="M4 14l6 6"/>',
  chat: '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-8l-5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z"/>',
  ticket: '<path d="M4 6.5h16v3.2a2.3 2.3 0 0 0 0 4.6v3.2H4v-3.2a2.3 2.3 0 0 0 0-4.6z"/><path d="M14 6.5v11" stroke-dasharray="2 2"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3"/>',
  pin: '<path d="M12 21.5s7-6.2 7-11.8a7 7 0 0 0-14 0c0 5.6 7 11.8 7 11.8z"/><circle cx="12" cy="9.7" r="2.6"/>',
  pen: '<path d="M4 20l1.2-4.2L16.5 4.5a2 2 0 0 1 3 3L8.2 18.8z"/><path d="M14.5 6.5l3 3"/>',
  money: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12l2.2 2.2 4.3-4.4"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5v6A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-6"/>',
  wa: '<path d="M4.5 19.5l1.2-3.6A8.2 8.2 0 1 1 8.3 18.4z"/><path d="M9.2 8.6c.2-.5.7-.5 1-.1l.7 1.4c.1.3 0 .6-.2.8l-.5.5c.5 1.1 1.4 2 2.6 2.6l.5-.5c.2-.2.5-.3.8-.2l1.4.7c.4.2.4.8-.1 1-1.9 1-5.9-2.4-6.2-5.2z" fill="currentColor" stroke="none"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
};
const xi = (n, s = 24) => '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + XP[n] + '</svg>';

/* ---------------- personalização ---------------- */
const AREAS = [
  { k: 'clima', t: 'Climatização e refrigeração', s: 'Ar-condicionado, câmaras frias e PMOC', short: 'climatização', ic: 'snow' },
  { k: 'elevador', t: 'Elevadores', s: 'Preventivas, chamados e contratos', short: 'elevadores', ic: 'lift' },
  { k: 'seguranca', t: 'Segurança eletrônica', s: 'CFTV, alarmes e portaria remota', short: 'segurança eletrônica', ic: 'cam' },
  { k: 'predial', t: 'Manutenção predial', s: 'Facilities, elétrica e hidráulica', short: 'manutenção predial', ic: 'bldg' },
  { k: 'telecom', t: 'Internet e telecom', s: 'Instalação e suporte em campo', short: 'internet e telecom', ic: 'wifi' },
  { k: 'outros', t: 'Outros serviços em campo', s: 'Limpeza, dedetização, jardinagem…', short: 'serviços em campo', ic: 'tool' },
];
const TEAMS = ['1 a 5', '6 a 20', '21 a 50', 'Mais de 50'];
// v = o desafio dentro de uma frase ("Comece por aqui para ...")
const PAINS = [
  { k: 'chamados', t: 'Não perder chamados', v: 'não perder nenhum chamado', s: 'WhatsApp, e-mail e telefone num só lugar', ch: ['chamado', 'ticket'], mods: ['AuvoHub', 'AuvoDesk'], ic: 'chat' },
  { k: 'agenda', t: 'Organizar agenda e técnicos', v: 'organizar a agenda e os técnicos', s: 'Quem vai, quando e por qual caminho', ch: ['agenda', 'campo'], mods: ['Agenda e OS', 'Mapa em tempo real'], ic: 'cal' },
  { k: 'papel', t: 'Acabar com a OS de papel', v: 'acabar com a OS de papel', s: 'Checklist, fotos e assinatura no celular', ch: ['assinatura'], mods: ['OS digital', 'Assinatura na tela'], ic: 'pen' },
  { k: 'receber', t: 'Receber em dia', v: 'receber em dia', s: 'Fatura gerada da OS e Pix com baixa automática', ch: ['cobranca'], mods: ['Financeiro', 'AuvoPay'], ic: 'money' },
  { k: 'pmoc', t: 'Manter o PMOC em dia', v: 'manter o PMOC em dia', s: 'Planos, equipamentos e vencimentos sob controle', ch: ['pmoc'], mods: ['PMOC digital'], ic: 'shield', only: 'clima' },
  { k: 'numeros', t: 'Ver os números da operação', v: 'ver os números da operação', s: 'Produtividade, atrasos e faturamento', ch: ['resultados'], mods: ['Relatórios', 'Dashboard financeira'], ic: 'chart' },
];
const Q = { area: null, team: null, pain: null, done: false };
try { Object.assign(Q, JSON.parse(sessionStorage.getItem('auvoTourQ') || '{}')); } catch (e) { /* sem storage */ }
const saveQ = () => { try { sessionStorage.setItem('auvoTourQ', JSON.stringify(Q)); } catch (e) { /* sem storage */ } };
const areaOf = () => AREAS.find(a => a.k === Q.area) || null;
const painOf = () => PAINS.find(p => p.k === Q.pain) || null;
const chapMine = ch => { const p = painOf(); return !!(p && ch && p.ch.includes(ch.id)); };
const painsFor = () => PAINS.filter(p => !p.only || !Q.area || p.only === Q.area);

function waUrl() {
  const a = areaOf();
  let t = 'Olá! Fiz o tour interativo do Auvo e quero agendar uma apresentação.';
  if (a) t += ' Trabalho com ' + a.short + (Q.team ? ', com ' + Q.team + ' técnicos em campo' : '') + '.';
  const p = painOf(); if (p) t += ' Meu maior desafio hoje: ' + p.v + '.';
  return 'https://wa.me/' + SALES.waNumber + '?text=' + encodeURIComponent(t);
}
const demoFor = () => demoUrl(Q.area || 'geral');
function refreshCta() { const c = $('#hCta'); if (c) c.href = demoFor(); }
refreshCta();
$('#hCta').addEventListener('click', () => track('cta_demo', { from: 'topo' }));

let qStep = 0;
window.quizOpen = () => {
  qStep = Q.area ? (Q.team ? (Q.pain ? 3 : 2) : 1) : 0;
  if (window.heroNotes) window.heroNotes(false);
  renderQuiz(); $('#quiz').classList.add('on'); track('quiz_open');
};
function quizClose() { $('#quiz').classList.remove('on'); }
function renderQuiz() {
  const z = $('#quiz');
  const dots = [0, 1, 2].map(i => `<i class="${i === qStep ? 'on' : i < qStep ? 'd' : ''}"></i>`).join('');
  let body = '';
  if (qStep === 0) {
    body = `<div class="qeb">Personalize seu tour · 1 de 3</div><h2>Qual é a sua operação?</h2><p class="qs">Assim o tour mostra o que importa para o seu negócio. Leva 10 segundos.</p>
      <div class="qgrid">${AREAS.map(a => `<button class="qo${Q.area === a.k ? ' sel' : ''}" data-q="area" data-v="${a.k}"><span class="qi">${xi(a.ic)}</span><span>${a.t}<br><small>${a.s}</small></span></button>`).join('')}</div>`;
  } else if (qStep === 1) {
    body = `<div class="qeb">Personalize seu tour · 2 de 3</div><h2>Quantos técnicos você tem em campo?</h2><p class="qs">Para mostrar o Auvo no tamanho da sua equipe.</p>
      <div class="qchips">${TEAMS.map(t => `<button class="qchip${Q.team === t ? ' sel' : ''}" data-q="team" data-v="${t}">${t}</button>`).join('')}</div>`;
  } else if (qStep === 2) {
    body = `<div class="qeb">Personalize seu tour · 3 de 3</div><h2>O que você mais quer resolver?</h2><p class="qs">Vamos dar destaque a isso no caminho.</p>
      <div class="qgrid">${painsFor().map(p => `<button class="qo${Q.pain === p.k ? ' sel' : ''}" data-q="pain" data-v="${p.k}"><span class="qi">${xi(p.ic)}</span><span>${p.t}<br><small>${p.s}</small></span></button>`).join('')}</div>`;
  } else {
    const chs = window.activeChapters ? window.activeChapters() : [], a = areaOf(), p = painOf();
    const estC = c => (window.narr ? window.narr.est(c) : c.est);
    const mins = Math.max(2, Math.round(chs.reduce((s, c) => s + estC(c) + 3.1, 0) / 60)); // 3,1 s = cartão de capítulo
    body = `<div class="qeb">Seu tour está pronto</div><h2>${chs.length} capítulos. Cerca de ${mins} minutos.</h2>
      <p class="qs">Um dia real numa empresa de serviços: do chamado no WhatsApp ao Pix na conta.${p ? ' O capítulo do seu desafio vem marcado.' : ''}</p>
      ${a && a.k !== 'clima' ? `<p class="qnote">A empresa do exemplo é de climatização. Em ${a.short}, o fluxo é o mesmo.</p>` : ''}
      <div class="qplan">${chs.map((c, i) => `<span class="${chapMine(c) ? 'mine' : ''}"><b>${i + 1}</b>${c.l}</span>`).join('')}</div>
      <button class="pbtn" data-q="go"><span class="pi">${xi('play', 15)}</span>Começar o tour</button>
      <div class="qvrow">${window.narr ? window.narr.pill() : ''}</div>`;
  }
  const foot = qStep < 3 ? `${qStep > 0 ? '<button class="qlink" data-q="back">‹ Voltar</button>' : ''}<button class="qlink" data-q="skip">Pular e começar o tour</button>` : '<button class="qlink" data-q="back">‹ Voltar</button>';
  z.innerHTML = `<div class="qz"><div class="qdots">${dots}</div>${body}<div class="qfoot">${foot}</div></div>`;
  const f = $('.qo.sel,.qchip.sel,[data-q="go"],.qo,.qchip', z); if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
}
$('#quiz').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const q = b.dataset.q, v = b.dataset.v;
  if (q === 'area' || q === 'team' || q === 'pain') {
    Q[q] = v; if (q === 'area' && Q.pain === 'pmoc' && v !== 'clima') Q.pain = null;
    saveQ(); refreshCta(); track('quiz', { step: q, value: v });
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
const CHAIN = ['Chamado', 'Ticket', 'Agenda', 'Em campo', 'Assinatura', 'Cobrança'];
const chainHTML = at => `<div class="chain" aria-hidden="true">${CHAIN.map((c, i) => `<span class="${i < at ? 'd' : i === at ? 'on' : ''}"><i></i>${c}</span>${i < CHAIN.length - 1 ? '<em></em>' : ''}`).join('')}</div>`;
// cardSeq: um cartão interrompido (troca de capítulo) não pode esconder o cartão novo que já entrou
let cardSeq = 0;
window.showCard = async (ch, idx, total, sig, setup) => {
  const c = $('#card'), p = painOf(), my = ++cardSeq;
  const sub = typeof ch.sub === 'function' ? ch.sub() : ch.sub;
  const voHint = idx === 0 && window.narr && window.narr.on() ? `<div class="cvo">${window.narr.icon()}${MOB ? 'Com narração · toque no alto-falante da barra para silenciar' : 'Com narração · M ou o alto-falante da barra desligam'}</div>` : '';
  c.innerHTML = `<div class="cc"><div class="cn">Capítulo ${idx + 1} de ${total}</div>${chapMine(ch) ? `<div><span class="mine">★ Seu desafio · ${p.t}</span></div>` : ''}<div class="ce">${ch.time}</div><h2>${ch.title}</h2><p>${sub}</p>${chainHTML(ch.chain)}</div>${voHint}<div class="cskip">Clique para continuar</div>`;
  c.classList.remove('out'); c.classList.add('on'); document.body.classList.add('carding');
  say(''); showCursor(false); window.capAt(null);
  const end = () => { if (my === cardSeq) { c.classList.remove('on', 'out'); document.body.classList.remove('carding'); } };
  let skip = false; const onClick = () => { skip = true; };
  c.addEventListener('click', onClick, { once: true });
  // a abertura do capítulo é narrada ("Quinta-feira, quatro e dez da tarde."): o cartão fica até a fala acabar
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
// A legenda sobe para o topo quando a ação acontece na metade de baixo da tela (e volta quando sobe),
// para nunca cobrir o que o cursor está mostrando. Faixa neutra entre 45% e 60% evita vai e vem.
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
  lt.innerHTML = `<div class="ltc">${ch ? `<span class="lk">${ch.l}</span>` : ''}<div class="lx"><b>${t}</b>${d ? `<p>${d}</p>` : ''}</div></div>`;
  if (gc) gc.innerHTML = `<b>${t}</b>${d ? `<p>${d}</p>` : ''}`;
};

/* ---------------- notificações ---------------- */
const NAPP = { hub: ['WhatsApp · AuvoHub', '#22c55e', 'chat'], desk: ['AuvoDesk', '#0ea5e9', 'ticket'], auvo: ['Auvo', '#7c3aed', 'pin'], os: ['OS digital', '#6366f1', 'pen'], pay: ['AuvoPay', '#10b981', 'money'] };
window.notify = (n, host) => {
  const box = host || $('#nt'); if (!box) return;
  const [app, color, ic] = NAPP[n.k];
  const el = document.createElement('div'); el.className = 'nt';
  el.innerHTML = `<span class="ni" style="background:${color}">${xi(ic, 20)}</span><div class="nb"><div class="nh"><span>${app}</span><span>${n.time || 'agora'}</span></div><b>${n.title}</b><p>${n.body}</p></div>`;
  box.appendChild(el);
  while (box.children.length > 3) box.firstElementChild.remove();
  if (n.ttl !== 0) setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 460); }, n.ttl || 4600);
  return el;
};
const STORY = [
  { k: 'hub', title: 'Marcos Tavares · Condomínio Bela Vista', body: 'O ar do bloco B parou de gelar. Conseguem vir amanhã cedo?', time: 'qui 16:10' },
  { k: 'desk', title: 'Chamado #0250 aberto', body: 'Prioridade alta · prazo do contrato: 4 horas', time: 'qui 16:12' },
  { k: 'auvo', title: 'Carlos está a caminho', body: 'Chegada ao Bela Vista às 8h30 · cliente avisado', time: 'sex 08:12' },
  { k: 'os', title: 'OS #80412 assinada pelo cliente', body: 'Marcos Tavares · validada por e-mail', time: 'sex 09:31' },
  { k: 'pay', title: 'Pix recebido · R$ 890,00', body: 'Fatura #1042 · baixa automática', time: 'sex 09:32' },
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
  const text = 'Veja o Auvo funcionando neste tour interativo de 3 minutos: ' + url;
  if (MOB && navigator.share) { try { await navigator.share({ title: 'Tour Auvo', text, url }); track('share', { via: 'nativo' }); return; } catch (e) { /* cancelado */ } }
  try { await navigator.clipboard.writeText(url); stageToast('Link copiado. Envie para quem decide com você.'); track('share', { via: 'copiar' }); }
  catch (e) { stageToast('Copie o link: ' + url); }
}

/* ---------------- final ---------------- */
const MORE = [['hub_ia', 'Agente de IA'], ['hub_campanhas', 'Campanhas no WhatsApp'], ['contratos', 'Contratos e cobrança'], ['nf', 'Notas fiscais'], ['orcamentos', 'Orçamentos'], ['produtos', 'Estoque'], ['monitor', 'Monitoramento']];
const FLOW = [['chat', 'Chamado', 'qui 16:10'], ['ticket', 'Ticket', '16:12'], ['cal', 'Agenda', '16:45'], ['pin', 'Em campo', 'sex 08:12'], ['pen', 'Assinatura', '09:31'], ['money', 'Pix recebido', '09:32']];
function recoCard() {
  const a = areaOf(), p = painOf();
  if (p) {
    const who = a ? `Para ${a.short}${Q.team ? ', com ' + Q.team + ' técnicos' : ''}` : 'Para a sua operação';
    return `<div class="fcard"><h3>${who}</h3><p>Comece por aqui para ${p.v}. E tudo conversa com agenda, financeiro e relatórios.</p><div class="fmods">${p.mods.map(m => `<span>${xi('check', 16)}${m}</span>`).join('')}</div></div>`;
  }
  return `<div class="fcard"><h3>Qual é o seu maior desafio hoje?</h3><p>Escolha um. O consultor já chega sabendo por onde começar.</p><div class="fmods">${painsFor().map(x => `<button data-f="pain" data-v="${x.k}">${x.t}</button>`).join('')}</div></div>`;
}
window.finale = explored => {
  const e = $('#end');
  hideCard(); say('');
  const simple = document.body.classList.contains('simple');
  let stat = '', sub = 'Do WhatsApp ao Pix em menos de um dia. Sem planilha, sem papel e sem ninguém esquecer nada.';
  if (explored && typeof G !== 'undefined') {
    const seen = new Set(); G.pages.forEach(pg => { const P = PAGES[pg]; if (!P) return; const k = P.app === 'desk' ? 'desk' : P.app === 'hub' ? 'hub' : P.menu; if (MOD_NAME[k]) seen.add(k); });
    sub = `Você explorou ${seen.size} de 6 módulos e viu, na prática, como tudo se conecta.`;
    if (!simple) stat = `<div class="fstat"><span>${G.xp} pontos</span><span>Nível ${levelOf(G.xp) + 1} · ${LEVELS[levelOf(G.xp)][1]}</span><span>${G.stars.size} de ${STAR_TOTAL} estrelas</span></div>`;
  }
  e.innerHTML = `<div class="fin">
    <div class="feb">${explored ? 'Modo explorar concluído' : 'Um dia na Frio Total'}</div>
    <h2>Tudo <span class="g">conectado.</span></h2>
    <p class="fsub">${sub}</p>
    ${stat}
    <div class="flow">${FLOW.map(([ic, l, t], i) => `<div class="fstep" style="animation-delay:${0.45 + i * 0.12}s"><span class="fi">${xi(ic, 28)}</span><b>${l}</b><small>${t}</small></div>`).join('')}</div>
    <div class="fgrid"><div id="freco">${recoCard()}</div>
      <div class="fcard fact"><a class="pbtn" id="fDemo" href="${demoFor()}" target="_blank" rel="noopener"><span class="pi">${xi('cal', 16)}</span>Agendar apresentação gratuita</a>
        <a class="wbtn" id="fWa" href="${waUrl()}" target="_blank" rel="noopener">${xi('wa', 20)}Falar no WhatsApp</a>
        <div class="ftrust">${SALES.trust.map(t => `<span>${t}</span>`).join('')}</div></div></div>
    <div class="fmore"><b>E tem mais:</b>${MORE.map(([id, l]) => `<button class="gbtn" data-f="more" data-v="${id}">${l}</button>`).join('')}</div>
    <div class="flinks"><button class="lnkbtn" data-f="explore">Explorar por conta própria <span class="ch">›</span></button><button class="lnkbtn" data-f="share">Compartilhar este tour <span class="ch">›</span></button><button class="lnkbtn" data-f="replay">Rever o tour <span class="ch">›</span></button></div>
  </div>`;
  e.classList.add('on'); e.scrollTop = 0;
  track('finish', { explored: !!explored, area: Q.area, pain: Q.pain });
};
$('#end').addEventListener('click', ev => {
  const b = ev.target.closest('[data-f],#fDemo,#fWa'); if (!b) return;
  if (b.id === 'fDemo') return track('cta_demo', { from: 'final', area: Q.area, pain: Q.pain });
  if (b.id === 'fWa') return track('cta_whatsapp', { from: 'final', area: Q.area, pain: Q.pain });
  const f = b.dataset.f, e = $('#end');
  if (f === 'pain') { Q.pain = b.dataset.v; saveQ(); track('final_pain', { pain: Q.pain }); $('#freco').innerHTML = recoCard(); $('#fWa').href = waUrl(); return; }
  if (f === 'share') return shareTour();
  if (f === 'replay') { e.classList.remove('on'); return startGuided(0); }
  if (f === 'explore') { e.classList.remove('on'); return enterExplore(); }
  if (f === 'more') { e.classList.remove('on'); track('final_more', { page: b.dataset.v }); if (S.mode !== 'explore') enterExplore(); go(b.dataset.v); }
});

if (S.mode === 'hero') window.heroNotes(true);
