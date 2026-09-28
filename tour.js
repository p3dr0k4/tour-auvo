// ============================================================
// Tour guiado: uma história só, "do chamado à cobrança".
// Capítulos que clicam no app de verdade (o mesmo código do modo explorar):
// WhatsApp (AuvoHub) -> ticket (AuvoDesk) -> agenda -> técnico em campo -> OS assinada
// -> fatura e Pix -> PMOC -> resultados. Com pausa, capítulos, teclado e modo apresentação.
// ============================================================
let TC = null, tourIdx = 0, TDONE = false, nextRes = null, chapEl = 0, ticker = 0, autoPaused = false;
let FIN = null; // fala de encerramento, sobre a tela final

// Estado da história: a cor da tarefa na agenda e a fatura mudam conforme o dia avança.
const MAIN_OS = EVENTS.find(e => e[4] === 'main' && e[2] === 'os');
const FAT = LISTS.faturas.rows[0];
function story(st, paid) { MAIN_OS[5] = st; FAT[5] = paid ? '{ok}Pago' : '{warn}Aguardando pagamento'; }
window.storyReset = () => story('pend', false);
// troca a cor da tarefa na tela, sem recarregar a agenda
function liveStatus(st) {
  story(st, st === 'done');
  const ev = $('.ev[data-m="os"][data-k="main"]', win); if (!ev) return;
  ev.dataset.s = st; ev.title = ST[st].label;
  const dot = $('i', ev); if (dot) dot.style.background = ST[st].color;
  ev.classList.remove('flash'); void ev.offsetWidth; ev.classList.add('flash');
}

// wait: espera o tempo mínimo da cena E a narração terminar (com narração o ritmo segue a fala)
const mk = sig => ({
  sig,
  async wait(ms) { await pwait(ms, sig); if (!sig.aborted) await window.narr.idle(); },
  say: (t, d, id) => { if (sig.aborted) return; say(t, d); if (id) window.narr.say(id, sig); },
  note: n => { if (!sig.aborted) window.notify(n); },
  async hover(sel, o = {}) {
    await camWait(sig);
    const el = typeof sel === 'string' ? $(sel, win) : sel;
    if (!el || sig.aborted) return false;
    if (MOB && el.scrollIntoView) { el.scrollIntoView({ block: 'center', inline: 'nearest' }); await pwait(90, sig); }
    const p = centerOf(el, o.fx ?? 0.5, o.fy ?? 0.5);
    window.capAt(p.y);
    await moveTo(p, o.ms ?? 800, sig);
    return !sig.aborted;
  },
  async click(sel, o = {}) {
    const el = typeof sel === 'string' ? $(sel, win) : sel;
    if (!(await this.hover(el, o))) return false;
    await pwait(o.pause ?? 220, sig);
    if (sig.aborted) return false;
    ripple(cur); el.click();
    await pwait(o.after ?? 350, sig);
    return !sig.aborted;
  },
  async nav(id) {
    if (sig.aborted) return false;
    if (MOB) { if (!$('#msheet', win) && !(await this.click('.mnav', { ms: 650 }))) return false; await this.wait(250); return this.click('#msheet [data-go="' + id + '"]', { ms: 500 }); }
    return this.click('[data-go="' + id + '"]', { ms: 800 });
  },
  async menu(id, item, o = {}) {
    if (sig.aborted) return false;
    if (MOB) return this.nav(item);
    camSet('wide'); await camWait(sig);
    if (!(await this.click(`[data-menu="${id}"]`, { ms: o.ms ?? 750 }))) return false;
    await this.wait(250);
    const ok = await this.click(`.tn.open [data-go="${item}"]`, { ms: 550 });
    camSet('in'); return ok;
  },
});
// assinatura: o cursor percorre o quadro e o traço aparece junto
const SIG_PTS = [[.10,.62],[.14,.34],[.18,.66],[.22,.30],[.27,.70],[.31,.40],[.36,.62],[.40,.36],[.45,.66],[.50,.42],[.56,.60],[.60,.34],[.66,.68],[.72,.44],[.78,.58],[.84,.38],[.90,.52],[.86,.72],[.62,.80],[.30,.78]];
async function scribble(T) {
  const cv = $('#sigpad'); if (!cv || T.sig.aborted) return;
  for (let i = 0; i < SIG_PTS.length; i++) {
    const [fx, fy] = SIG_PTS[i];
    await moveTo(centerOf(cv, fx, fy), i === 0 ? 700 : 130, T.sig);
    if (T.sig.aborted) return;
    window.padFrac(fx, fy, i === 0);
  }
  window.padEnd();
}
const rowCell = (i, sel) => { const r = $$('.tbl tbody tr', win)[i]; return r ? $(sel, r) : null; };

// est = segundos de cada capítulo sem o cartão (medido no navegador); estN = o mesmo com narração; chain = elo da história no cartão
const CHAPS = [
  { id: 'chamado', l: 'Chamado', chain: 0, nar: 'c1-0', est: 16, estN: 14, time: 'Quinta · 16:10', title: 'O cliente chama.', sub: 'No WhatsApp, como ele prefere. E nada se perde.',
    setup: () => { story('open'); window.hubStoryReset(); go('hubapp', { conv: 0 }); camSet('in'); },
    run: async T => {
      T.note({ k: 'hub', title: 'Marcos Tavares · Condomínio Bela Vista', body: 'O ar do bloco B parou de gelar. Conseguem vir amanhã cedo?', time: 'qui 16:10' });
      await T.wait(500);
      T.say('Todo cliente num só lugar.', 'O WhatsApp da empresa chega no AuvoHub: a equipe inteira atende no mesmo número, com histórico.', 'c1-1');
      await T.hover('.hcv.on', { ms: 900 }); await T.wait(3300);
      T.say('Você sabe com quem está falando.', 'Contato, empresa e fila de atendimento na mesma tela.', 'c1-2');
      await T.hover('.hthh', { ms: 800, fx: 0.3 }); await T.wait(2800);
      await T.click('.hbtn[data-k="ticket"]', { ms: 900 });
      T.say('Um clique e vira chamado.', 'O ticket nasce no AuvoDesk sem sair da conversa. Nada fica esquecido no celular de ninguém.', 'c1-3');
      await T.wait(4200);
    } },
  { id: 'ticket', l: 'Ticket', chain: 1, nar: 'c2-0', est: 15, estN: 10, time: 'Quinta · 16:12', title: 'Vira um chamado.', sub: 'Com dono, prioridade e prazo. Tudo registrado.',
    setup: () => { story('open'); go('dticket'); camSet('in'); },
    run: async T => {
      T.note({ k: 'desk', title: 'Chamado #0250 aberto', body: 'Prioridade alta · prazo do contrato: 4 horas', time: 'qui 16:12' });
      T.say('Com dono, prioridade e prazo.', 'Prioridade alta e o prazo de atendimento do contrato. O relógio começa a contar sozinho.', 'c2-1');
      await T.hover($$('.tkr .opt.on', win)[1], { ms: 900 }); await T.wait(3000);
      T.say('Tudo fica registrado.', 'Cada passo entra no histórico: quem abriu, quem mudou e quando.', 'c2-2');
      await T.hover('.hist', { ms: 800, fx: 0.35 }); await T.wait(2800);
      await T.click('.tabs2 [data-t="k"]', { ms: 800 });
      T.say('O chamado vira ordem de serviço.', 'A tarefa nasce ligada ao ticket, ao cliente e ao equipamento, direto na agenda do técnico.', 'c2-3');
      await T.hover('[data-act="os-from-ticket"]', { ms: 800 }); await T.wait(3600);
    } },
  { id: 'agenda', l: 'Agenda', chain: 2, nar: 'c3-0', est: 20, estN: 15, time: 'Quinta · 16:45', title: 'Entra na agenda.', sub: 'O técnico certo, no horário certo.',
    setup: () => { story('open'); go('agenda'); camSet('in'); },
    run: async T => {
      T.say('A agenda da equipe inteira.', 'Cada cor é um status: vermelho em aberto, azul a caminho, verde em execução, cinza finalizada.', 'c3-1');
      await T.click('.lgc[data-s="open"]', { ms: 900 }); await T.wait(2600);
      await T.click('.ev[data-m="os"][data-k="main"]', { ms: 900 });
      T.say('O chamado de hoje já está aqui.', 'Amanhã às 8h30, com o Carlos. Prioridade alta, endereço e o ticket de origem.', 'c3-2');
      await T.wait(3600);
      await T.click('.mtr [data-t="eq"]', { ms: 700 });
      T.say('Tudo o que o técnico precisa.', 'Equipamento, checklist e orientação, no celular dele.', 'c3-3');
      await T.wait(3000);
      await T.click('.mtr [data-t="not"]', { ms: 600 });
      T.say('E o cliente é avisado sozinho.', 'Agendamento, técnico a caminho e pesquisa de satisfação, sem ninguém digitar.', 'c3-4');
      await T.wait(3400);
    } },
  { id: 'campo', l: 'Em campo', chain: 3, nar: 'c4-0', est: 20, estN: 15, time: 'Sexta · 08:12', title: 'O técnico sai.', sub: 'O cliente é avisado. Você acompanha no mapa.',
    setup: () => { story('route'); go('mapa'); camSet('in'); },
    run: async T => {
      T.note({ k: 'auvo', title: 'Carlos está a caminho', body: 'Chegada ao Bela Vista às 8h30 · cliente avisado', time: 'sex 08:12' });
      T.say('A equipe inteira, ao vivo.', 'Onde cada técnico está, o que está fazendo e o caminho até o cliente.', 'c4-1');
      await T.hover('.pin', { ms: 1000 }); await T.wait(3000);
      T.say('Urgência? Mande o mais próximo.', 'Você vê quem está livre e perto, sem ligar para ninguém.', 'c4-2');
      await T.hover($$('.mrow', win)[2], { ms: 900 }); await T.wait(2800);
      await T.menu('op', 'agenda');
      T.say('Na agenda, a cor muda sozinha.', 'Azul: a caminho. No check-in do Carlos, fica verde.', 'c4-3');
      await T.hover('.ev[data-m="os"][data-k="main"]', { ms: 900 }); await T.wait(2200);
      if (T.sig.aborted) return;
      T.note({ k: 'auvo', title: 'Check-in no Bela Vista', body: '08:33 · a 38 m do local · GPS de alta precisão', time: 'sex 08:33' });
      liveStatus('run');
      T.say('Check-in feito. Fica verde.', 'A 38 metros do cliente, com GPS de alta precisão.', 'c4-4');
      await T.wait(3200);
    } },
  { id: 'assinatura', l: 'Assinatura', chain: 4, nar: 'c5-0', est: 25, estN: 14, time: 'Sexta · 09:31', title: 'Serviço feito. Cliente assina.', sub: 'Checklist, fotos, GPS e assinatura. Sem papel.',
    setup: () => { story('pend'); go('agenda'); S.modal = { type: 'os', ev: MAIN_OS, tab: 'mon' }; renderModal(); camSet('in'); },
    run: async T => {
      T.say('Tudo registrado em campo.', 'Check-in e check-out com GPS, checklist e fotos. Você sabe o que foi feito, e quando.', 'c5-1');
      await T.hover('.tl', { ms: 900, fx: 0.3, fy: 0.45 }); await T.wait(3200);
      await T.click('[data-act="rel-open"]', { ms: 900 });
      T.say('O relatório sai pronto.', 'Com a sua marca, os serviços e os valores. Ninguém digita OS no fim do dia.', 'c5-2');
      await T.wait(3400);
      const rb = $('#rbody'); if (rb && !T.sig.aborted) rb.scrollTo({ top: rb.scrollHeight, behavior: 'smooth' });
      await T.wait(1300);
      await T.click('[data-act="sig-start"]', { ms: 900 });
      T.say('O cliente assina na tela.', 'Validada por e-mail, com data, hora, GPS e dispositivo registrados.', 'c5-3');
      await T.wait(700);
      await scribble(T);
      await T.click('[data-act="sig-ok"]', { ms: 750 });
      T.note({ k: 'os', title: 'OS #80412 assinada pelo cliente', body: 'Marcos Tavares · validada por e-mail', time: 'sex 09:31' });
      T.say('Assinado. Sem papel.', 'A OS assinada fica guardada e pode ir para o cliente por e-mail.', 'c5-4');
      await T.wait(3600);
    } },
  { id: 'cobranca', l: 'Cobrança', chain: 5, nar: 'c6-0', est: 19, estN: 12, time: 'Sexta · 09:32', title: 'A cobrança sai da OS.', sub: 'Sem digitar de novo. E o pagamento dá baixa sozinho.',
    setup: () => { story('pend', false); go('faturas', { hl: true }); camSet('in'); },
    run: async T => {
      T.say('A fatura nasce da OS.', '“Serviços prestados à Tarefa #80412”: os valores do relatório, sem digitar de novo.', 'c6-1');
      await T.hover('tr.hl td:nth-child(2)', { ms: 900 }); await T.wait(3400);
      await T.hover('tr.hl td:last-child', { ms: 800 }); await T.wait(500);
      if (T.sig.aborted) return;
      T.note({ k: 'pay', title: 'Pix recebido · R$ 890,00', body: 'Fatura #1042 · baixa automática', time: 'sex 09:32' });
      story('done', true);
      const cell = $('tr.hl td:last-child', win); if (cell) cell.innerHTML = '<span class="chip ok live">Pago</span>';
      T.say('Pagou, baixou.', 'Pix e boleto saem da própria fatura pelo AuvoPay, com baixa automática.', 'c6-2');
      await T.wait(3800);
      await T.menu('fin', 'fluxo');
      T.say('E o caixa sempre à vista.', 'O fluxo de caixa projeta os próximos 15 dias com o que já está lançado.', 'c6-3');
      await T.wait(4200);
    } },
  { id: 'pmoc', l: 'PMOC', only: 'clima', chain: 6, nar: 'c7-0', est: 9, estN: 7, time: 'Sempre em dia', title: 'O PMOC se cuida.', sub: 'Vencimentos à vista, antes da fiscalização.',
    setup: () => { story('done', true); go('pmoc', { hl: true }); camSet('in'); },
    run: async T => {
      T.say('PMOC em dia, sem susto.', 'Verde em dia, amarelo perto de vencer, vermelho vencido.', 'c7-1');
      await T.hover(rowCell(2, 'td:last-child'), { ms: 900 }); await T.wait(3000);
      T.say('Você age antes de vencer.', 'Equipamentos, responsável técnico e vigência de cada plano, organizados por cliente.', 'c7-2');
      await T.hover(rowCell(3, 'td:nth-child(3)'), { ms: 800 }); await T.wait(3400);
    } },
  { id: 'resultados', l: 'Resultados', chain: 6, nar: 'c8-0', est: 15, estN: 9, time: 'Sexta · 18:00', title: 'O dia em números.', sub: 'Produtividade, atrasos e faturamento. Em um olhar.',
    setup: () => { story('done', true); go('dashboard'); camSet('in'); },
    run: async T => {
      T.say('Quem produziu, quem atrasou.', 'Produtividade, atraso médio e tempo de atendimento de cada técnico.', 'c8-1');
      await T.hover('.kp', { ms: 900, fx: 0.3 }); await T.wait(2400);
      await T.hover('.tbl tbody tr', { ms: 800, fx: 0.4 }); await T.wait(1600);
      await T.menu('rel', 'dashfin');
      T.say('E quanto entrou no mês.', 'Recebido, pago e inadimplência, mês a mês. Decisão com número, não com palpite.', 'c8-2');
      await T.wait(4200);
    } },
];
let ACTIVE = CHAPS.slice();
window.activeChapters = () => CHAPS.filter(c => !c.only || !Q.area || c.only === Q.area);
window.tourChapter = () => (S.mode === 'guided' && !TDONE ? ACTIVE[tourIdx] : null);

/* ---------------- barra do tour guiado ---------------- */
const CARD_S = 3.1; // tempo do cartão de capítulo
const estOf = c => window.narr.est(c); // com narração o capítulo dura o tempo da fala (estN)
function remSecs() {
  let s = Math.max(0, estOf(ACTIVE[tourIdx]) - chapEl / 1000);
  for (let j = tourIdx + 1; j < ACTIVE.length; j++) s += estOf(ACTIVE[j]) + CARD_S;
  return Math.round(s);
}
const sndBtn = () => window.narr.available() ? `<button class="ib snd${window.narr.blocked() ? ' nextcue' : ''}" data-t="sound" aria-pressed="${window.narr.on()}" aria-label="${window.narr.label()}" title="${window.narr.label()}">${window.narr.icon()}</button>` : '';
const remText = () => TDONE ? '' : PAUSED ? 'Pausado' : Math.floor(remSecs() / 60) + ':' + String(remSecs() % 60).padStart(2, '0') + ' restantes';
const capHTML = () => S.cap ? `<b>${S.cap}</b>${S.capd ? `<p>${S.capd}</p>` : ''}` : '';
const playIcon = () => TDONE ? IC.replay : PAUSED ? IC.play : IC.pause;
const playLabel = () => TDONE ? 'Rever o tour' : PAUSED ? 'Continuar (Espaço)' : 'Pausar (Espaço)';

window.tourBottom = () => {
  const n = ACTIVE.length, ch = ACTIVE[tourIdx];
  return `<div class="bg" data-i="${tourIdx}" data-n="${n}" data-done="${TDONE ? 1 : 0}">
    <div class="gcap" id="gcap" aria-live="polite">${capHTML()}</div>
    <button class="ib" data-t="prev" aria-label="Capítulo anterior" title="Capítulo anterior (←)"${tourIdx === 0 && !TDONE ? ' disabled' : ''}>${IC.left}</button>
    <button class="ib play" data-t="pause" aria-label="${playLabel()}" title="${playLabel()}">${playIcon()}</button>
    <div class="gmid"><div class="glab"><span>${TDONE ? 'Tour concluído' : `Capítulo ${tourIdx + 1} de ${n} · <b>${ch.l}</b>`}</span><span class="rem" id="trem">${remText()}</span></div>
      <div class="steps">${ACTIVE.map((c, i) => `<button class="st${TDONE || i < tourIdx ? ' d' : i === tourIdx ? ' on' : ''}${chapMine(c) ? ' mine' : ''}" data-t="go" data-i="${i}" style="--d:${estOf(c)}s" aria-label="Capítulo ${i + 1}: ${c.l}"${i === tourIdx && !TDONE ? ' aria-current="step"' : ''}><i></i><span>${c.l}</span></button>`).join('')}</div></div>
    ${sndBtn()}
    <button class="ib" data-t="next" aria-label="Próximo capítulo" title="Próximo capítulo (→)"${TDONE ? ' disabled' : ''}>${IC.right}</button>
    <button class="take" data-t="take">${IC.hand}<span>Assumir o controle</span></button></div>`;
};
// atualiza só o que mudou (recriar a barra reiniciaria a animação de progresso do capítulo)
window.tourBottomSync = () => {
  const b = $('#bot'), bg = $('.bg', b);
  // redesenha só quando muda o capítulo ou quando a narração passa a existir (vozes carregam depois do início)
  if (!bg || +bg.dataset.i !== tourIdx || +bg.dataset.n !== ACTIVE.length || bg.dataset.done !== (TDONE ? '1' : '0') || !!$('[data-t="sound"]', bg) !== window.narr.available()) { b.innerHTML = window.tourBottom(); return; }
  const p = $('[data-t="pause"]', bg); p.innerHTML = playIcon(); p.setAttribute('aria-label', playLabel()); p.title = playLabel();
  const sb = $('[data-t="sound"]', bg);
  if (sb) { sb.innerHTML = window.narr.icon(); sb.setAttribute('aria-pressed', window.narr.on()); sb.setAttribute('aria-label', window.narr.label()); sb.title = window.narr.label(); sb.classList.toggle('nextcue', window.narr.blocked()); }
  const g = $('#gcap'); if (g) g.innerHTML = capHTML();
  const r = $('#trem'); if (r) r.textContent = remText();
};
function startTicker() {
  clearInterval(ticker); chapEl = 0;
  ticker = setInterval(() => {
    if (S.mode !== 'guided' || TDONE) return clearInterval(ticker);
    if (!PAUSED && !document.body.classList.contains('carding')) chapEl += 250;
    const r = $('#trem'); if (r) r.textContent = remText();
  }, 250);
}

/* ---------------- controle ---------------- */
window.stopTour = () => {
  if (TC) { TC.abort(); TC = null; }
  if (FIN) { FIN.abort(); FIN = null; }
  nextRes = null; clearInterval(ticker);
};
window.runTour = async (i, fresh) => {
  window.stopTour();
  if (fresh) ACTIVE = window.activeChapters();
  TDONE = false; tourIdx = clamp(i, 0, ACTIVE.length - 1);
  TC = new AbortController();
  const sig = TC.signal, ch = ACTIVE[tourIdx], T = mk(sig);
  setPaused(false); autoPaused = false;
  $('#end').classList.remove('on');
  say(''); updateBottom(); startTicker();
  setHash(ch.id); track('chapter', { chapter: ch.id, index: tourIdx });
  try {
    await window.showCard(ch, tourIdx, ACTIVE.length, sig, () => ch.setup());
    if (!sig.aborted) await ch.run(T);
  } catch (e) { console.error(e); }
  if (sig.aborted) return;
  if (PRESENT) { await waitNext(sig); if (sig.aborted) return; }
  if (tourIdx + 1 < ACTIVE.length) window.runTour(tourIdx + 1);
  else finishTour();
};
function finishTour() {
  window.stopTour(); TDONE = true; setPaused(false);
  say(''); showCursor(false); updateBottom();
  track('tour_complete', { chapters: ACTIVE.length });
  window.finale(false);
  FIN = new AbortController(); window.narr.say('fim', FIN.signal);
}
// modo apresentação: o capítulo termina e espera o apresentador avançar
function waitNext(sig) {
  return new Promise(res => {
    nextRes = res;
    const b = $('#bot [data-t="next"]'); if (b) b.classList.add('nextcue');
    sig.addEventListener('abort', () => { if (nextRes === res) nextRes = null; res(); }, { once: true });
  });
}
function nextChapter() {
  if (S.mode !== 'guided' || TDONE) return;
  if (nextRes) { const r = nextRes; nextRes = null; return r(); }
  if (tourIdx + 1 < ACTIVE.length) window.runTour(tourIdx + 1); else finishTour();
}
function prevChapter() {
  if (S.mode !== 'guided') return;
  if (TDONE) return window.runTour(ACTIVE.length - 1);
  if (tourIdx > 0) window.runTour(tourIdx - 1);
}
function togglePause() {
  if (S.mode !== 'guided') return;
  if (TDONE) return startGuided(0);
  autoPaused = false; setPaused(!PAUSED);
  track(PAUSED ? 'pause' : 'resume', { chapter: ACTIVE[tourIdx].id });
  window.tourBottomSync();
}
// botão grande no meio do palco enquanto está pausado
const pz = document.createElement('button');
pz.id = 'pz'; pz.type = 'button'; pz.setAttribute('aria-label', 'Continuar o tour');
pz.innerHTML = `<i>${IC.play}</i><span>Continuar</span>`;
pz.addEventListener('click', togglePause);
$('#stage').appendChild(pz);

$('#bot').addEventListener('click', e => {
  const b = e.target.closest('[data-t]'); if (!b) return;
  const t = b.dataset.t;
  if (t === 'tour') return startGuided(0);
  if (t === 'list') { S.listOpen = !S.listOpen; if (S.listOpen && typeof closeGuide === 'function') closeGuide(); return updateBottom(); }
  if (t === 'skip') { const nx = MISSIONS.find(m => !S.visited.has(m.k)); if (nx) { S.skipped.add(nx.k); S.visited.add(nx.k); track('mission_skip', { mission: nx.k }); refreshHints(); if (S.visited.size === MISSIONS.length) setTimeout(() => showEnd(true), 700); } return; }
  if (t === 'simple') { window.gameToggleSimple && window.gameToggleSimple(b.checked); return; }
  if (S.mode !== 'guided') return;
  if (t === 'prev') prevChapter();
  else if (t === 'next') nextChapter();
  else if (t === 'pause') togglePause();
  else if (t === 'sound') window.narr.toggle('barra');
  else if (t === 'go') window.runTour(+b.dataset.i);
  else if (t === 'take') { track('take_control', { chapter: TDONE ? 'fim' : ACTIVE[tourIdx].id }); enterExplore(true); }
});

// teclado: Espaço pausa, setas trocam de capítulo, M liga/desliga a narração; Esc fecha o modal no modo explorar
document.addEventListener('keydown', e => {
  if ($('#quiz').classList.contains('on') || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === 'Escape' && S.modal && S.mode !== 'guided') { S.modal = null; renderModal(); return; }
  if (S.mode !== 'guided') return;
  if (e.key === ' ') {
    if (e.target.closest && e.target.closest('button,a,input,textarea,select,[role="button"]')) return;
    e.preventDefault(); togglePause();
  } else if (e.key === 'ArrowRight') nextChapter();
  else if (e.key === 'ArrowLeft') prevChapter();
  else if ((e.key === 'm' || e.key === 'M') && window.narr.available()) window.narr.toggle('teclado');
});
// aba escondida: pausa sozinho e retoma quando a pessoa volta
document.addEventListener('visibilitychange', () => {
  if (S.mode !== 'guided' || TDONE) return;
  if (document.hidden) { if (!PAUSED) { autoPaused = true; setPaused(true); window.tourBottomSync(); } }
  else if (autoPaused) { autoPaused = false; setTimeout(() => { if (S.mode === 'guided' && PAUSED) { setPaused(false); window.tourBottomSync(); } }, 500); }
});

// entrada: #capítulo abre o tour ali, #explorar abre o modo livre, #tour começa do início
const ALIAS = { os: 'assinatura', desk: 'ticket', financeiro: 'cobranca', relatorios: 'resultados', mapa: 'campo', hub: 'chamado', cadastros: 'agenda' };
function startAt(id) {
  ACTIVE = window.activeChapters();
  let i = ACTIVE.findIndex(c => c.id === id);
  if (i < 0) { ACTIVE = CHAPS.slice(); i = ACTIVE.findIndex(c => c.id === id); }
  setMode('guided'); window.runTour(i);
}
function boot(h = location.hash.slice(1)) {
  h = ALIAS[h] || h;
  if (h === 'explorar') enterExplore();
  else if (h === 'tour') startGuided(0);
  else if (CHAPS.some(c => c.id === h)) startAt(h);
}
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1), ch = window.tourChapter();
  if ((ch && h === ch.id) || (S.mode === 'explore' && h === 'explorar')) return;
  boot(h);
});
boot(INIT_HASH);

// Tela de abertura: um cursor "usa" o sistema por trás do texto (em loop) para mostrar que a tela é viva.
let HC = null;
window.heroDemo = on => {
  if (HC) { HC.abort(); HC = null; }
  if (!on || MOB) return;
  HC = new AbortController();
  const sig = HC.signal, T = mk(sig);
  (async () => {
    await T.wait(1400);
    while (!sig.aborted) {
      go('agenda'); win.classList.add('hero'); await T.wait(900);
      for (const k of ['open', 'pend', 'done']) { await T.click(`.lgc[data-s="${k}"]`, { ms: 900, pause: 60, after: 100 }); await T.wait(700); }
      const ev = [...$$('.ev', win)].find(e => e.textContent.includes('Bloco A'));
      await T.click(ev, { ms: 1000 }); await T.wait(900);
      await T.click('.mtr [data-t="mon"]', { ms: 800 }); await T.wait(1300);
      await T.click('.mtr [data-t="val"]', { ms: 600 }); await T.wait(1300);
      await T.click('.ov .x', { ms: 700 }); await T.wait(900);
      await T.click('[data-menu="fin"]', { ms: 900 }); await T.wait(900);
      await T.click('.tn.open [data-go="fluxo"]', { ms: 500 }); await T.wait(3200);
    }
  })();
};
if (S.mode === 'hero') window.heroDemo(true);

// Tela de abertura: a janela inclina levemente seguindo o mouse real (só em ponteiro fino, sem "reduzir movimento").
if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  let raf = 0, ts = null;
  const apply = () => { raf = 0; if (!ts) return; win.style.setProperty('--ry', (ts.x * 6).toFixed(2) + 'deg'); win.style.setProperty('--rx', (-ts.y * 4).toFixed(2) + 'deg'); win.style.setProperty('--px', (-ts.x * 18).toFixed(1) + 'px'); win.style.setProperty('--py', (ts.y * 10).toFixed(1) + 'px'); };
  const reset = () => { ts = { x: 0, y: 0 }; apply(); setTimeout(() => win.classList.remove('follow'), 400); };
  document.addEventListener('mousemove', e => {
    if (S.mode !== 'hero') return;
    win.classList.add('follow');
    ts = { x: (e.clientX / innerWidth - 0.5) * 2, y: (e.clientY / innerHeight - 0.5) * 2 };
    if (!raf) raf = requestAnimationFrame(apply);
  });
  document.addEventListener('mouseleave', reset);
}
