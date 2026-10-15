// ============================================================
// Tour guiado do Auvo OPS: uma história só, "do chamado ao indicador".
// Os capítulos clicam no mesmo app do modo explorar:
// Central de atendimento -> OS com SLA e resumo do Jonas -> Rotas -> Rastreamento e OS em andamento
// -> assinatura no aplicativo -> ficha do ativo e preventiva -> SLA e relatórios -> pergunta ao Jonas.
// ============================================================
let TC = null, tourIdx = 0, TDONE = false, nextRes = null, chapEl = 0, ticker = 0, autoPaused = false;
let FIN = null;

// coloca a história no ponto de cada capítulo (assim dá para começar de qualquer um)
function story(stage) {
  window.storyReset();
  if (stage >= 1) { MAIN.srSt = 'convertido'; }
  if (stage >= 2) { MAIN.summary = true; }
  if (stage >= 3) { S.route = 3; MAIN.st = 'atribuida'; MAIN.tech = 'Carlos Mendes'; }
  if (stage >= 4) { checkIn(); }
  if (stage >= 5) { MAIN.st = 'concluida'; MAIN.signed = true; }
  if (stage >= 7) { S.jonas = 0; }
}

const mk = sig => ({
  sig,
  async wait(ms) { await pwait(ms, sig); if (!sig.aborted) await window.narr.idle(); },
  say: (t, d, id) => { if (sig.aborted) return; say(t, d); if (id) window.narr.say(id, sig); },
  note: n => { if (!sig.aborted) window.notify(n); },
  async hover(sel, o = {}) {
    await camWait(sig);
    const el = typeof sel === 'string' ? $(sel, win) : sel;
    if (!el || sig.aborted) return false;
    if (el.scrollIntoView) { const c = $('#content', win); if (MOB || (c && c.contains(el) && (el.getBoundingClientRect().bottom > c.getBoundingClientRect().bottom || el.getBoundingClientRect().top < c.getBoundingClientRect().top))) { el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: MOB ? 'auto' : 'smooth' }); await pwait(MOB ? 90 : 450, sig); } }
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
  // menu lateral (no celular, abre a folha de menu primeiro)
  async nav(id) {
    if (sig.aborted) return false;
    if (MOB) { if (!$('#msheet', win) && !(await this.click('.mnav', { ms: 650 }))) return false; await this.wait(250); return this.click('#msheet [data-go="' + id + '"]', { ms: 500 }); }
    camSet('wide'); await camWait(sig);
    const ok = await this.click('.sb [data-go="' + id + '"]', { ms: 800 });
    camSet('in'); return ok;
  },
  // digita no campo do Jonas
  async type(text) {
    const el = $('#jinput', win); if (!el) return;
    el.classList.add('typing');
    for (let i = 1; i <= text.length && !sig.aborted; i += 2) { el.textContent = text.slice(0, i); S.jtyping = el.textContent; await pwait(28, sig); }
    el.textContent = text; S.jtyping = text;
  },
});
// assinatura: o cursor percorre o quadro e o traço aparece junto
const SIG_PTS = [[.10, .60], [.14, .34], [.18, .66], [.22, .30], [.27, .70], [.31, .40], [.36, .62], [.40, .36], [.45, .66], [.50, .42], [.56, .60], [.60, .34], [.66, .68], [.72, .44], [.78, .58], [.84, .38], [.90, .52], [.86, .72], [.62, .80], [.30, .78]];
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
async function until(fn, sig, max = 6000) { let t = 0; while (!fn() && !sig.aborted && t < max) { await pwait(100, sig); t += 100; } }

// est = segundos do capítulo sem o cartão; estN = o mesmo com narração; chain = elo da história no cartão
const CHAPS = [
  { id: 'chamado', l: 'Chamado', chain: 0, nar: 'c1-0', est: 15, estN: 17, time: 'Quinta · 07:52', title: 'O chamado chega.', sub: 'Pelo Portal, direto na Central de atendimento.',
    setup: () => { story(0); S.srTab = 'pend'; go('sr'); camSet('in'); },
    run: async T => {
      T.note({ k: 'portal', title: 'Renata Prado · Hospital Santa Aurora', body: 'Chiller 01 desarmando por alta pressão. Precisamos de alguém hoje cedo.', time: 'qui 07:52' });
      await T.wait(400);
      T.say('O cliente abre o chamado no Portal.', 'A engenharia clínica do hospital pede ajuda, e o pedido cai na Central de atendimento, esperando triagem.', 'c1-1');
      await T.hover('#srmain h3', { ms: 900, fx: 0.25 }); await T.wait(3200);
      T.say('Tudo o que você precisa para decidir.', 'Solicitante, local, equipamento, categoria e origem, na mesma tela.', 'c1-2');
      await T.hover('#srmain .srf', { ms: 800, fx: 0.3 }); await T.wait(2400);
      await T.hover('#srmain .sra', { ms: 700, fx: 0.2 }); await T.wait(900);
      await T.click('[data-act="sr-ok"]', { ms: 900 });
      T.note({ k: 'ops', title: 'OS-00412 criada', body: 'Prioridade alta · SLA de resposta: 2 horas', time: '07:55' });
      T.say('Aprovou, virou OS.', 'O chamado vira a OS-00412, ligada ao cliente, ao local e ao Chiller 01.', 'c1-3');
      await T.hover('#srmain .lnk', { ms: 800 }); await T.wait(3200);
    } },
  { id: 'sla', l: 'OS + SLA', chain: 1, nar: 'c2-0', est: 18, estN: 16, time: 'Quinta · 07:55', title: 'Nasce com prazo.', sub: 'Prioridade, ativo e SLA contando sozinho.',
    setup: () => { story(1); go('os', { code: MAIN.code }); camSet('in'); },
    run: async T => {
      T.say('Prioridade, ativo e contrato.', 'A OS já sabe qual equipamento, de qual cliente, em qual contrato e com que prioridade.', 'c2-1');
      await T.hover('.ochips', { ms: 900, fx: 0.4 }); await T.wait(1500);
      await T.hover('#slabox .sr2', { ms: 800, fx: 0.4 }); await T.wait(1700);
      T.say('O SLA conta sozinho.', 'Resposta em 2 horas e solução em 8, pela política de alta prioridade. Sem planilha e sem cronômetro.', 'c2-2');
      await T.hover('#slabox .why', { ms: 800, fx: 0.4 }); await T.wait(2600);
      await T.click('[data-act="os-sum"]', { ms: 900 });
      T.say('O Jonas resume a OS.', 'Em segundos: o que aconteceu, o que vence e quando foi a última falha desse equipamento.', 'c2-3');
      await T.hover('#jsum', { ms: 800, fx: 0.35, fy: 0.4 }); await T.wait(4600);
    } },
  { id: 'rotas', l: 'Rotas', chain: 2, nar: 'c3-0', est: 19, estN: 17, time: 'Quinta · 08:10', title: 'O Jonas monta as rotas.', sub: 'A agenda da equipe em poucos cliques.',
    setup: () => { story(2); S.route = 0; go('routing'); camSet('in'); },
    run: async T => {
      T.say('Um clique para a agenda do dia.', 'Escolha o período e o Jonas encaixa as visitas por prioridade, prazo e distância.', 'c3-1');
      await T.hover('.rper .fl2', { ms: 900, fx: 0.15 }); await T.wait(900);
      await T.click('[data-act="route-go"]', { ms: 900 });
      await until(() => S.route === 2 && $('.rsum', win), T.sig);
      T.say('Ele explica o que fez.', 'A corretiva do chiller vai primeiro na rota do Carlos, porque o SLA está correndo. Nada ficou de fora.', 'c3-2');
      await T.hover('.rsum p', { ms: 900, fx: 0.4 }); await T.wait(2400);
      await T.hover('.rv.main', { ms: 800, fx: 0.4 }); await T.wait(2000);
      await T.click('[data-act="route-pub"]', { ms: 900 });
      T.note({ k: 'jonas', title: 'Rotas do dia publicadas', body: '9 visitas · 3 técnicos · 86 km', time: '08:10' });
      T.say('Revisou, publicou.', 'Cada técnico recebe a rota no aplicativo. Ajustes manuais são de graça.', 'c3-3');
      await T.wait(3200);
    } },
  { id: 'campo', l: 'Em campo', chain: 3, nar: 'c4-0', est: 19, estN: 15, time: 'Quinta · 09:05', title: 'O técnico chega.', sub: 'Você acompanha ao vivo, sem ligar para ninguém.',
    setup: () => { story(3); go('tracking'); camSet('in'); },
    run: async T => {
      T.say('A equipe inteira, ao vivo.', 'Quem está a caminho, quem está em atendimento e onde.', 'c4-1');
      await T.hover('.mpanel', { ms: 900, fx: 0.4, fy: 0.3 }); await T.wait(1600);
      const pin = $('#pin-carlos', win);
      if (pin && !T.sig.aborted) { await T.hover(pin, { ms: 700 }); pin.style.transition = 'left 1.8s ease-in-out, top 1.8s ease-in-out'; pin.style.left = px(640); pin.style.top = py(300); await T.wait(1900); }
      if (T.sig.aborted) return;
      checkIn(); rebuild();
      T.note({ k: 'app', title: 'Carlos fez check-in', body: 'Hospital Santa Aurora · a 24 m do local', time: '09:05' });
      T.say('Check-in feito.', 'O Carlos chegou ao hospital e a OS passa para Em andamento, sozinha.', 'c4-2');
      await T.hover('.mrow.main', { ms: 800, fx: 0.4 }); await T.wait(2200);
      await T.nav('wos');
      await T.click('tr.main', { ms: 900, fx: 0.3 });
      await T.click('[data-act="os-tab"][data-t="mat"]', { ms: 800 });
      T.say('O material entra na OS.', 'O que o técnico usou baixa do estoque e já aparece no custo real da OS e do ativo.', 'c4-3');
      await T.hover('#otp .tbl tbody tr', { ms: 800, fx: 0.3 }); await T.wait(1800);
      await T.hover('.cr.tot', { ms: 800 }); await T.wait(2000);
    } },
  { id: 'assinatura', l: 'Assinatura', chain: 4, nar: 'c5-0', est: 22, estN: 17, time: 'Quinta · 10:48', title: 'Serviço feito. Cliente assina.', sub: 'No aplicativo do técnico, sem papel.',
    setup: () => { story(4); go('os', { code: MAIN.code }); camSet('in'); },
    run: async T => {
      await T.click('[data-act="app-open"]', { ms: 900 });
      T.say('Tudo registrado em campo.', 'Check-in com GPS, checklist completo e material lançado pelo aplicativo do técnico.', 'c5-1');
      await T.hover('.pst', { ms: 800, fx: 0.4, fy: 0.4 }); await T.wait(2600);
      await T.click('[data-act="sig-start"]', { ms: 800 });
      T.say('A cliente assina na tela.', 'A engenharia clínica do hospital assina no celular do técnico, ao concluir o serviço.', 'c5-2');
      await T.wait(500);
      await scribble(T);
      await T.click('[data-act="sig-ok"]', { ms: 700 });
      T.note({ k: 'sign', title: 'OS-00412 concluída', body: 'Assinatura de Renata Prado no aplicativo', time: '10:48' });
      await T.wait(1600);
      await T.click('.appw [data-act="close"]', { ms: 800 });
      T.say('No painel, na mesma hora.', 'A OS aparece concluída, com a assinatura, o histórico e o custo real fechado.', 'c5-3');
      await T.hover('.sigok', { ms: 900, fx: 0.3 }); await T.wait(2200);
      await T.hover('.cr.tot', { ms: 800 }); await T.wait(2000);
    } },
  { id: 'ativo', l: 'Ativo', chain: 5, nar: 'c6-0', est: 24, estN: 20, time: 'Quinta · 11:00', title: 'O ativo tem memória.', sub: 'Histórico, custo, o que mais falha e a próxima preventiva.',
    setup: () => { story(5); go('asset'); camSet('in'); },
    run: async T => {
      T.say('Cada ativo com a sua ficha.', 'Fabricante, modelo, número de série, valor de compra e custo de manutenção.', 'c6-1');
      await T.hover('.kv', { ms: 900, fx: 0.3, fy: 0.3 }); await T.wait(2400);
      T.say('O que mais falha, em números.', '4 corretivas em 12 meses, 3 por alta pressão de descarga. Dá para agir na causa.', 'c6-2');
      await T.hover('#falha', { ms: 800, fx: 0.4, fy: 0.4 }); await T.wait(2800);
      await T.click('[data-act="qr"]', { ms: 800 });
      T.say('QR Code no equipamento.', 'Quem ler a etiqueta abre a ficha e o histórico ali mesmo, na frente da máquina.', 'c6-3');
      await T.wait(2800);
      await T.click('.ov [data-act="close"]', { ms: 700 });
      await T.nav('preventive');
      T.say('E a preventiva no calendário.', 'Planos por tempo ou por uso, aderência do mês e capacidade da equipe à vista.', 'c6-4');
      await T.hover('.hlc', { ms: 900 }); await T.wait(1600);
      await T.hover('.pnx .pmr.main', { ms: 800, fx: 0.4 }); await T.wait(2000);
    } },
  { id: 'gestao', l: 'Gestão', chain: 6, nar: 'c7-0', est: 16, estN: 13, time: 'Quinta · 18:00', title: 'O dia em indicadores.', sub: 'SLA, confiabilidade e custo. Em um olhar.',
    setup: () => { story(5); go('sla'); camSet('in'); },
    run: async T => {
      T.say('O SLA da operação inteira.', 'Conformidade, violações, tempo médio de resposta e os prazos que ainda estão correndo.', 'c7-1');
      await T.hover('.kr', { ms: 900, fx: 0.3 }); await T.wait(1800);
      await T.hover('#prazos .przr.main', { ms: 800, fx: 0.4 }); await T.wait(1600);
      await T.nav('analytics');
      T.say('Confiabilidade e custo.', 'MTBF, MTTR, aderência de SLA e custo por OS, com relatório pronto para cada um.', 'c7-2');
      await T.hover('#anak', { ms: 900, fx: 0.3 }); await T.wait(2400);
      await T.hover('.rpc', { ms: 800 }); await T.wait(1400);
    } },
  { id: 'jonas', l: 'Jonas', chain: 7, nar: 'c8-0', est: 16, estN: 13, time: 'Sempre que precisar', title: 'Pergunte ao Jonas.', sub: 'A IA que conhece a sua operação.',
    setup: () => { story(7); go('jonas'); camSet('in'); },
    run: async T => {
      T.say('Pergunte como perguntaria à equipe.', 'O Jonas consulta OS, ativos e indicadores, e pede confirmação antes de gravar qualquer coisa.', 'c8-1');
      await T.hover('#jinput', { ms: 900, fx: 0.2 });
      await T.type(JQ);
      await T.click('.jsend', { ms: 600 });
      await until(() => S.jonas === 2, T.sig);
      T.say('Resposta com os números.', 'O Chiller 01 lidera as corretivas dos últimos 90 dias. E o Jonas diz como contou.', 'c8-2');
      await T.hover('#jans', { ms: 900, fx: 0.35, fy: 0.35 }); await T.wait(4400);
    } },
];
let ACTIVE = CHAPS.slice();
window.activeChapters = () => CHAPS.slice();
window.tourChapter = () => (S.mode === 'guided' && !TDONE ? ACTIVE[tourIdx] : null);

/* ---------------- barra do tour guiado ---------------- */
const CARD_S = 3.1;
const estOf = c => window.narr.est(c);
function remSecs() {
  let s = Math.max(0, estOf(ACTIVE[tourIdx]) - chapEl / 1000);
  for (let j = tourIdx + 1; j < ACTIVE.length; j++) s += estOf(ACTIVE[j]) + CARD_S;
  return Math.round(s);
}
const sndBtn = () => window.narr.available() ? '<button class="ib snd' + (window.narr.blocked() ? ' nextcue' : '') + '" data-t="sound" aria-pressed="' + window.narr.on() + '" aria-label="' + window.narr.label() + '" title="' + window.narr.label() + '">' + window.narr.icon() + '</button>' : '';
const remText = () => TDONE ? '' : PAUSED ? 'Pausado' : Math.floor(remSecs() / 60) + ':' + String(remSecs() % 60).padStart(2, '0') + ' restantes';
const capHTML = () => S.cap ? '<b>' + S.cap + '</b>' + (S.capd ? '<p>' + S.capd + '</p>' : '') : '';
const playIcon = () => TDONE ? IC.replay : PAUSED ? IC.play : IC.pause;
const playLabel = () => TDONE ? 'Rever o tour' : PAUSED ? 'Continuar (Espaço)' : 'Pausar (Espaço)';

window.tourBottom = () => {
  const n = ACTIVE.length, ch = ACTIVE[tourIdx];
  return '<div class="bg" data-i="' + tourIdx + '" data-n="' + n + '" data-done="' + (TDONE ? 1 : 0) + '">' +
    '<div class="gcap" id="gcap" aria-live="polite">' + capHTML() + '</div>' +
    '<button class="ib" data-t="prev" aria-label="Capítulo anterior" title="Capítulo anterior (←)"' + (tourIdx === 0 && !TDONE ? ' disabled' : '') + '>' + IC.left + '</button>' +
    '<button class="ib play" data-t="pause" aria-label="' + playLabel() + '" title="' + playLabel() + '">' + playIcon() + '</button>' +
    '<div class="gmid"><div class="glab"><span>' + (TDONE ? 'Tour concluído' : 'Capítulo ' + (tourIdx + 1) + ' de ' + n + ' · <b>' + ch.l + '</b>') + '</span><span class="rem" id="trem">' + remText() + '</span></div>' +
    '<div class="steps">' + ACTIVE.map((c, i) => '<button class="st' + (TDONE || i < tourIdx ? ' d' : i === tourIdx ? ' on' : '') + (chapMine(c) ? ' mine' : '') + '" data-t="go" data-i="' + i + '" style="--d:' + estOf(c) + 's" aria-label="Capítulo ' + (i + 1) + ': ' + c.l + '"' + (i === tourIdx && !TDONE ? ' aria-current="step"' : '') + '><i></i><span>' + c.l + '</span></button>').join('') + '</div></div>' +
    sndBtn() +
    '<button class="ib" data-t="next" aria-label="Próximo capítulo" title="Próximo capítulo (→)"' + (TDONE ? ' disabled' : '') + '>' + IC.right + '</button>' +
    '<button class="take" data-t="take">' + IC.hand + '<span>Assumir o controle</span></button></div>';
};
window.tourBottomSync = () => {
  const b = $('#bot'), bg = $('.bg', b);
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
const pz = document.createElement('button');
pz.id = 'pz'; pz.type = 'button'; pz.setAttribute('aria-label', 'Continuar o tour');
pz.innerHTML = '<i>' + IC.play + '</i><span>Continuar</span>';
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
  else if (t === 'take') { track('take_control', { chapter: TDONE ? 'fim' : ACTIVE[tourIdx].id }); S.modal = null; enterExplore(true); }
});

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
document.addEventListener('visibilitychange', () => {
  if (S.mode !== 'guided' || TDONE) return;
  if (document.hidden) { if (!PAUSED) { autoPaused = true; setPaused(true); window.tourBottomSync(); } }
  else if (autoPaused) { autoPaused = false; setTimeout(() => { if (S.mode === 'guided' && PAUSED) { setPaused(false); window.tourBottomSync(); } }, 500); }
});

// entrada: #capítulo abre o tour ali, #explorar abre o modo livre, #tour começa do início
const ALIAS = { os: 'sla', rota: 'rotas', mapa: 'campo', relatorios: 'gestao', ia: 'jonas', chamados: 'chamado' };
function startAt(id) {
  ACTIVE = window.activeChapters();
  const i = Math.max(0, ACTIVE.findIndex(c => c.id === id));
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

// Tela de abertura: um cursor "usa" o OPS por trás do texto (em loop)
let HC = null;
window.heroDemo = on => {
  if (HC) { HC.abort(); HC = null; }
  if (!on || MOB) return;
  HC = new AbortController();
  const sig = HC.signal, T = mk(sig);
  (async () => {
    await T.wait(1400);
    while (!sig.aborted) {
      window.storyReset(); go('dashboard'); win.classList.add('hero'); await T.wait(1200);
      await T.click('.sb [data-go="sr"]', { ms: 1000 }); await T.wait(900);
      await T.click('[data-act="sr-ok"]', { ms: 900 }); await T.wait(900);
      await T.click('#srmain .lnk', { ms: 800 }); await T.wait(1000);
      await T.click('[data-act="os-sum"]', { ms: 900 }); await T.wait(3200);
      await T.click('.sb [data-go="routing"]', { ms: 1000 }); await T.wait(500);
      await T.click('[data-act="route-go"]', { ms: 800 }); await T.wait(3600);
      await T.click('.sb [data-go="assets"]', { ms: 1000 }); await T.wait(900);
      await T.click('tr.main', { ms: 900 }); await T.wait(2600);
    }
  })();
};
if (S.mode === 'hero') window.heroDemo(true);

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
