// ============================================================
// Narração do tour guiado.
// Os textos da locução ficam aqui; cada id é também o nome do arquivo de áudio (audio/<id>.mp3).
// Enquanto a locução final não existir (audio/manifest.json vazio), a voz do próprio navegador faz o papel de protótipo.
// Regras: só toca depois de um clique (exigência dos navegadores), pode ser desligada a qualquer momento (M),
// pausa junto com o tour e, com o som ligado, a legenda mostra só o título (a frase de apoio vira fala).
// ============================================================
const NARR = {
  'c1-0': 'Quinta-feira, sete e cinquenta e dois da manhã.',
  'c1-1': 'O Chiller 01 do hospital desarmou de novo. A engenharia clínica abre o chamado pelo Portal, e ele cai aqui, na Central de atendimento.',
  'c1-2': 'Quem pediu, onde, qual equipamento e o que está acontecendo. Tudo na mesma tela.',
  'c1-3': 'Um clique, e o chamado vira ordem de serviço.',
  'c2-0': 'Três minutos depois.',
  'c2-1': 'A OS já nasce com prioridade, ativo e o prazo do SLA contando sozinho.',
  'c2-2': 'E mostra por que esse é o prazo: a política de alta prioridade do contrato.',
  'c2-3': 'Quer entender a OS em segundos? O Jonas resume pra você.',
  'c3-0': 'Oito e dez.',
  'c3-1': 'Agora, a agenda do dia. Em Rotas, um clique, e o Jonas monta a rota de cada técnico.',
  'c3-2': 'Ele explica o que fez: a corretiva do chiller vai primeiro, porque o SLA está correndo.',
  'c3-3': 'Revisou? Publica. Cada técnico recebe a rota no aplicativo.',
  'c4-0': 'Nove e cinco.',
  'c4-1': 'No rastreamento, a equipe inteira, ao vivo.',
  'c4-2': 'O Carlos chegou ao hospital. Check-in feito, e a OS fica em andamento.',
  'c4-3': 'O material usado entra na OS… com o custo real.',
  'c5-0': 'Dez e quarenta e oito. Serviço feito.',
  'c5-1': 'No aplicativo, check-in, checklist e material já estão registrados.',
  'c5-2': 'A cliente assina ali mesmo, na tela do celular.',
  'c5-3': 'E no painel, a OS aparece concluída, com a assinatura e o custo real.',
  'c6-0': 'E o chiller?',
  'c6-1': 'Cada ativo tem a sua ficha: fabricante, modelo, custo e localização.',
  'c6-2': 'O histórico mostra o que mais falha. Alta pressão, de novo.',
  'c6-3': 'O QR Code vai colado no equipamento.',
  'c6-4': 'E a preventiva fica no calendário, sem depender da memória de ninguém.',
  'c7-0': 'Seis da tarde.',
  'c7-1': 'No SLA, a conformidade da operação, as violações e os prazos que ainda estão correndo.',
  'c7-2': 'Nos relatórios, MTBF, MTTR e custo por OS. Decisão com número, não com palpite.',
  'c8-0': 'E se você só quiser perguntar?',
  'c8-1': 'Pergunte ao Jonas, como perguntaria a alguém da equipe.',
  'c8-2': 'Ele consulta a operação e responde com os números.',
  'fim': 'Do chamado ao indicador, no mesmo dia. Isso é o Auvo OPS.',
};
// pronúncia só para a voz do navegador (a locução final recebe o texto como está acima)
const PRON = [[/\bOPS\b/g, 'ópis'], [/\bOS\b/g, 'ô ésse'], [/\bSLA\b/g, 'ésse éle á'], [/MTBF/g, 'ême tê bê éfe'], [/MTTR/g, 'ême tê tê érre'], [/QR Code/g, 'quiú-ár côudi'], [/Chiller/g, 'chíler'], [/chiller/g, 'chíler']];

const QS = new URLSearchParams(location.search);
const VO = { ok: 'speechSynthesis' in window, pref: !PRESENT, blocked: false, files: null, voice: null, audio: null, cur: null, why: '', log: [] };
try { const s = localStorage.getItem('auvoOpsSom'); if (s && !PRESENT) VO.pref = s === '1'; } catch (e) { /* sem storage */ }
const MUTE = QS.get('voz') === 'mudo'; // testes automáticos: fala sem som, mas com o tempo real
const vlog = (id, ev) => { VO.log.push([Math.round(performance.now()), id, ev]); if (VO.log.length > 80) VO.log.shift(); };

// locução gravada: audio/manifest.json = { "files": { "c1-0": 1.9, ... } } (segundos)
fetch('audio/manifest.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null)).then(m => {
  if (m && m.files && Object.keys(m.files).length) { VO.files = m.files; syncNarrUI(); }
}).catch(() => { /* sem locução gravada: usa a voz do navegador */ });

function pickVoice() {
  const vs = VO.ok ? speechSynthesis.getVoices() : [];
  const pt = vs.filter(v => /^pt[-_]BR/i.test(v.lang)), any = pt.length ? pt : vs.filter(v => /^pt/i.test(v.lang));
  const by = re => any.find(v => re.test(v.name));
  return by(/Antonio.*(Natural|Online)/i) || by(/(Natural|Online)/i) || by(/Google/i) || by(/Daniel/i) || any[0] || null;
}
if (VO.ok) { VO.voice = pickVoice(); speechSynthesis.addEventListener('voiceschanged', () => { VO.voice = pickVoice(); syncNarrUI(); }); }

const hasVoice = () => !!(VO.files || (VO.ok && VO.voice));
const narrOn = () => VO.pref && !VO.blocked && hasVoice();
function block() { if (VO.blocked) return; VO.blocked = true; vlog('', 'bloqueado'); syncNarrUI(); }

// corta a frase atual; why = 'pause' (repete ao voltar), 'skip' (segue em frente) ou 'stop'
function cutNow(why) {
  VO.why = why;
  if (VO.cur) VO.cur(why);
  if (VO.ok) speechSynthesis.cancel();
}
function utter(id, sig) {
  return new Promise(res => {
    const text = PRON.reduce((t, [re, s]) => t.replace(re, s), NARR[id]);
    const u = new SpeechSynthesisUtterance(text);
    // um pouco mais rápida que o padrão: aproxima o ritmo de um locutor profissional
    u.lang = 'pt-BR'; if (VO.voice) u.voice = VO.voice; u.rate = 1.1; u.pitch = 1; if (MUTE) u.volume = 0;
    let fin = false;
    const done = r => { if (fin) return; fin = true; clearTimeout(guard); sig.removeEventListener('abort', onAbort); if (VO.cur === stopMe) VO.cur = null; vlog(id, r); res(r); };
    const stopMe = why => done(why);
    const onAbort = () => cutNow('stop');
    u.onstart = () => vlog(id, 'início');
    u.onend = () => done('end');
    u.onerror = e => { if (e.error === 'not-allowed') { block(); return done('error'); } done(VO.why || 'error'); };
    // alguns navegadores não avisam o fim da fala: encerra pelo tempo estimado
    const guard = setTimeout(() => done('end'), 2500 + text.length * 95);
    sig.addEventListener('abort', onAbort, { once: true });
    VO.why = ''; VO.cur = stopMe;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  });
}
function playFile(id, sig) {
  return new Promise(res => {
    const a = VO.audio || (VO.audio = new Audio());
    let fin = false;
    const done = r => { if (fin) return; fin = true; a.onended = a.onerror = null; sig.removeEventListener('abort', onAbort); if (VO.cur === stopMe) VO.cur = null; vlog(id, r); res(r); };
    const stopMe = why => { if (why === 'pause') { a.pause(); return; } a.pause(); done(why); };
    const onAbort = () => stopMe('stop');
    a.onended = () => done('end'); a.onerror = () => done('error');
    a.muted = MUTE; a.src = 'audio/' + id + '.mp3';
    sig.addEventListener('abort', onAbort, { once: true });
    VO.cur = stopMe; vlog(id, 'início');
    a.play().catch(err => { if (err && err.name === 'NotAllowedError') block(); done('error'); });
  });
}
// as vozes do navegador carregam depois da página: espera até 1,5 s por elas antes da primeira fala
const voicesReady = () => new Promise(res => {
  if (!VO.ok || speechSynthesis.getVoices().length) return res();
  const t = setTimeout(res, 1500);
  speechSynthesis.addEventListener('voiceschanged', () => { clearTimeout(t); res(); }, { once: true });
});
async function speak(id, sig) {
  if (!id || !NARR[id] || !sig || sig.aborted) return;
  if (!VO.files && VO.ok && !VO.voice && VO.pref) { await voicesReady(); VO.voice = pickVoice(); syncNarrUI(); }
  const file = !!(VO.files && VO.files[id] != null);
  while (!sig.aborted && narrOn()) {
    if (PAUSED) { await untilRunning(sig); continue; }
    const r = file ? await playFile(id, sig) : await utter(id, sig);
    if (r !== 'pause' || file) return; // voz do navegador não retoma do meio: repete a frase depois da pausa
  }
}
// fila única: uma frase por vez; o tour espera a fila esvaziar antes de seguir
let vq = Promise.resolve();
window.onPause = p => {
  if (!VO.cur) return;
  if (p) cutNow('pause');
  else if (VO.audio && VO.files && VO.audio.src && VO.audio.paused && !VO.audio.ended) VO.audio.play().catch(() => {});
};
function syncNarrUI() {
  document.body.classList.toggle('narr', S.mode === 'guided' && narrOn());
  if (S.mode === 'guided' && window.tourBottomSync) window.tourBottomSync();
  const q = $('#quiz [data-q="vo"]'); if (q) q.outerHTML = voPill();
  // aviso do primeiro cartão acompanha o estado real do som
  const cv = $('#card .cvo');
  if (cv) {
    if (VO.blocked && VO.pref) cv.innerHTML = ICV.on + (MOB ? 'Toque no alto-falante da barra para ouvir a narração' : 'Clique no alto-falante da barra para ouvir a narração');
    else if (!narrOn()) cv.remove();
  }
}
const SPK = '<path d="M4 9.5h3.2L12 5.6v12.8l-4.8-3.9H4z" fill="currentColor" stroke="none"/>';
const ICV = {
  on: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">${SPK}<path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>`,
  off: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">${SPK}<path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>`,
};
const voPill = () => hasVoice() ? `<button class="qvo${VO.pref ? ' on' : ''}" data-q="vo" aria-pressed="${VO.pref}">${VO.pref ? ICV.on : ICV.off}${VO.pref ? 'Com narração' : 'Sem narração'}</button>` : '';

window.narr = {
  texts: NARR, log: VO.log,
  available: hasVoice,
  on: narrOn,
  blocked: () => VO.blocked && VO.pref,
  say(id, sig) { if (!id || !NARR[id]) return vq; vq = vq.then(() => speak(id, sig)).catch(() => {}); return vq; },
  idle: () => vq,
  cut: () => cutNow('skip'),
  stop() { cutNow('stop'); syncNarrUI(); },
  sync: syncNarrUI,
  pill: voPill,
  icon: () => (narrOn() || VO.blocked) && VO.pref ? ICV.on : ICV.off,
  label: () => !VO.pref ? 'Ligar narração (M)' : VO.blocked ? 'Ativar narração (M)' : 'Desligar narração (M)',
  // o clique no botão também libera o áudio quando o navegador bloqueou o início automático
  toggle(from) {
    if (VO.blocked && VO.pref) VO.blocked = false; else VO.pref = !VO.pref;
    if (!PRESENT) try { localStorage.setItem('auvoOpsSom', VO.pref ? '1' : '0'); } catch (e) { /* sem storage */ }
    if (!VO.pref) cutNow('skip');
    track('narration', { on: VO.pref, from: from || 'barra' });
    syncNarrUI();
  },
  est: c => (narrOn() && c.estN ? c.estN : c.est),
};
