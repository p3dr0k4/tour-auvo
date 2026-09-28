// Utilidades: seletores, sleep cancelável, cursor animado e escala do palco.
let SW = 1600, SH = 840;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function sleep(ms, sig) {
  return new Promise(res => {
    if (sig && sig.aborted) return res();
    const id = setTimeout(res, ms);
    if (sig) sig.addEventListener('abort', () => { clearTimeout(id); res(); }, { once: true });
  });
}

// ---- pausa (usada pelo tour guiado) ----
let PAUSED = false;
const pauseQ = new Set();
function setPaused(v) {
  const was = PAUSED;
  PAUSED = !!v; document.body.classList.toggle('paused', PAUSED);
  if (!PAUSED) { pauseQ.forEach(f => f()); pauseQ.clear(); }
  if (was !== PAUSED && window.onPause) window.onPause(PAUSED); // narração acompanha a pausa
}
function untilRunning(sig) {
  if (!PAUSED) return Promise.resolve();
  return new Promise(res => { pauseQ.add(res); if (sig) sig.addEventListener('abort', () => { pauseQ.delete(res); res(); }, { once: true }); });
}
// espera que para enquanto o tour está pausado
async function pwait(ms, sig) {
  let left = ms;
  while (left > 0 && !(sig && sig.aborted)) {
    if (PAUSED) { await untilRunning(sig); continue; }
    const step = Math.min(left, 100);
    await sleep(step, sig);
    if (!PAUSED) left -= step;
  }
}

// ---- cursor (coordenadas do palco) ----
let cur = { x: 800, y: 140 };
function cursorEl() {
  let c = $('#cursor');
  if (!c) {
    c = document.createElement('div');
    c.id = 'cursor';
    c.className = 'hidden';
    c.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.6 L12 14 L19 14 Z" fill="#fff" stroke="#170b30" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    $('#stage').appendChild(c);
    c.style.transform = `translate(${cur.x}px,${cur.y}px)`;
  }
  return c;
}
function showCursor(v) { cursorEl().classList.toggle('hidden', !v); }

// converte o retângulo de um elemento para coordenadas do palco (desfaz o scale do fit)
function centerOf(el, fx = 0.5, fy = 0.5) {
  const s = $('#stage').getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / SW;
  return { x: (r.left - s.left + r.width * fx) / k, y: (r.top - s.top + r.height * fy) / k };
}

function spotTo(p) { const s = $('#spot'); if (s) { s.style.setProperty('--sx', p.x + 'px'); s.style.setProperty('--sy', p.y + 'px'); } }
function moveTo(p, ms, sig) {
  return new Promise(res => {
    const c = cursorEl(); c.classList.remove('hidden');
    const from = { ...cur }; let el = 0, last = null;
    function step(now) {
      if (sig && sig.aborted) return res();
      if (last !== null && !PAUSED) el += now - last;
      last = now;
      const k = clamp(el / ms), e = ease(k);
      cur = { x: lerp(from.x, p.x, e), y: lerp(from.y, p.y, e) };
      c.style.transform = `translate(${cur.x}px,${cur.y}px)`;
      spotTo(cur); panTo(cur.x);
      k < 1 ? requestAnimationFrame(step) : res();
    }
    requestAnimationFrame(step);
  });
}
function ripple(p) {
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.left = p.x + 'px'; r.style.top = p.y + 'px';
  $('#stage').appendChild(r);
  setTimeout(() => r.remove(), 560);
}

// ---- escala do palco ----
// Telas largas: o palco 1600x900 encolhe para caber. Celular: escala pela altura e a tela rola/segue o cursor (pan).
let PAN = false, PANK = 1, MOB = false;
function fitStage() {
  const wrap = $('.stage-wrap'), stage = $('#stage');
  if (!wrap || !stage) return;
  const was = MOB; MOB = innerWidth <= 900;
  document.body.classList.toggle('mob', MOB); document.body.classList.toggle('pan', MOB);
  if (MOB) {
    // celular/tablet vertical: o palco vira o próprio viewport (layout nativo, sem escala)
    SW = wrap.clientWidth; SH = wrap.clientHeight;
    stage.style.width = SW + 'px'; stage.style.height = SH + 'px'; stage.style.transform = 'none'; stage.style.margin = '0';
    stage.style.setProperty('--k', 1); wrap.style.overflowX = 'hidden'; wrap.style.justifyContent = 'flex-start'; PANK = 1;
    wrap.scrollLeft = 0; // nada de palco deslocado para o lado no celular
  } else {
    SW = 1600; SH = 840; stage.style.width = ''; stage.style.height = '';
    const k = Math.max(Math.min((wrap.clientWidth - 24) / SW, (wrap.clientHeight - 16) / SH, 1.25), 0.2);
    PANK = k; stage.style.transform = 'scale(' + k + ')';
    stage.style.margin = (-(SH * (1 - k)) / 2) + 'px ' + (-(SW * (1 - k)) / 2) + 'px';
    stage.style.setProperty('--k', k); wrap.style.overflowX = 'hidden'; wrap.style.justifyContent = 'center';
  }
  if (was !== MOB && typeof go === 'function' && typeof S !== 'undefined' && S.mode !== 'hero') go(S.page, S.opts);
}
function panTo(x) { if (!PAN) return; const w = $('.stage-wrap'); w.scrollLeft = x * PANK - w.clientWidth / 2; }
window.addEventListener('resize', fitStage);
if (window.ResizeObserver) new ResizeObserver(fitStage).observe($('.stage-wrap'));
