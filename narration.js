// ============================================================
// Narração do tour guiado.
// Os textos da locução ficam aqui; cada id é também o nome do arquivo de áudio (audio/<id>.mp3).
// Enquanto a locução final não existir (audio/manifest.json vazio), a voz do próprio navegador faz o papel de protótipo.
// Regras: só toca depois de um clique (exigência dos navegadores), pode ser desligada a qualquer momento (M),
// pausa junto com o tour e, com o som ligado, a legenda mostra só o título (a frase de apoio vira fala).
// ============================================================
const NARR = {
  'c1-0': 'Quinta-feira, quatro e dez da tarde.',
  'c1-1': 'O ar do bloco B parou de gelar. O síndico chama no WhatsApp, e a mensagem cai aqui, no AuvoHub.',
  'c1-2': 'A equipe inteira atende no mesmo número.',
  'c1-3': 'Um clique, e a conversa vira chamado. Nada se perde.',
  'c2-0': 'Dois minutos depois.',
  'c2-1': 'O chamado já tem dono, prioridade e o prazo do contrato, contando sozinho.',
  'c2-2': 'Tudo fica no histórico.',
  'c2-3': 'E daqui ele vira ordem de serviço.',
  'c3-0': 'Quatro e quarenta e cinco.',
  'c3-1': 'Na agenda, cada cor é um status: vermelho em aberto, azul a caminho, verde em execução.',
  'c3-2': 'O chamado de hoje já está aqui: amanhã, oito e meia, com o Carlos.',
  'c3-3': 'Ele recebe tudo no celular.',
  'c3-4': 'E o cliente é avisado sozinho.',
  'c4-0': 'Sexta-feira, oito e doze.',
  'c4-1': 'O Carlos está a caminho, e o síndico já foi avisado. No mapa, você vê a equipe inteira, ao vivo.',
  'c4-2': 'Surgiu uma urgência? Mande quem está mais perto.',
  'c4-3': 'Na agenda, a tarefa está azul: a caminho.',
  'c4-4': 'Check-in feito. E fica verde.',
  'c5-0': 'Nove e trinta e um. Serviço feito.',
  'c5-1': 'Checklist, fotos e GPS: tudo registrado pelo aplicativo.',
  'c5-2': 'O relatório sai pronto, com a sua marca.',
  'c5-3': 'E o cliente assina ali mesmo, na tela, com validação por e-mail.',
  'c5-4': 'Sem papel. Sem prancheta.',
  'c6-0': 'Um minuto depois.',
  'c6-1': 'A fatura nasce da própria ordem de serviço. Ninguém digita nada de novo.',
  'c6-2': 'O síndico paga no Pix… e a baixa é automática.',
  'c6-3': 'E o caixa dos próximos dias fica à vista.',
  'c7-0': 'E o PMOC?',
  'c7-1': 'Verde, em dia. Amarelo, vencendo. Vermelho, vencido.',
  'c7-2': 'Você age antes da fiscalização.',
  'c8-0': 'Seis da tarde.',
  'c8-1': 'Produtividade, atrasos e tempo de atendimento de cada técnico.',
  'c8-2': 'E quanto entrou no mês. Decisão com número, não com palpite.',
  'fim': 'Do WhatsApp ao Pix, em menos de um dia. Tudo conectado. Isso é o Auvo.',
};
// pronúncia só para a voz do navegador (a locução final recebe o texto como está acima)
const PRON = [[/AuvoHub/g, 'Auvo Râb'], [/AuvoPay/g, 'Auvo Pêi'], [/PMOC/g, 'pêmóc']];

const QS = new URLSearchParams(location.search);
const VO = { ok: 'speechSynthesis' in window, pref: !PRESENT, blocked: false, files: null, voice: null, audio: null, cur: null, why: '', log: [] };
try { const s = localStorage.getItem('auvoTourSom'); if (s && !PRESENT) VO.pref = s === '1'; } catch (e) { /* sem storage */ }
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
    if (!PRESENT) try { localStorage.setItem('auvoTourSom', VO.pref ? '1' : '0'); } catch (e) { /* sem storage */ }
    if (!VO.pref) cutNow('skip');
    track('narration', { on: VO.pref, from: from || 'barra' });
    syncNarrUI();
  },
  est: c => (narrOn() && c.estN ? c.estN : c.est),
};
