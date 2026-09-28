// ============================================================
// Tour engine: stage scaling, cursor tweening, reveal sequencer.
// Every chapter gets a fresh AbortController; every await checks
// it, so skipping chapters never leaves a stray animation running.
// ============================================================
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function sleep(ms, signal) {
  return new Promise((res, rej) => {
    if (signal && signal.aborted) return res('aborted');
    const id = setTimeout(() => res('done'), ms);
    if (signal) signal.addEventListener('abort', () => { clearTimeout(id); res('aborted'); }, { once: true });
  });
}

function reveal(root, sel) {
  root.querySelectorAll(sel).forEach(el => el.classList.add('show'));
}
function hideAll(root) {
  root.querySelectorAll('.rv').forEach(el => el.classList.remove('show'));
}

// ---------------- cursor ----------------
const STAGE_W = 1600, STAGE_H = 900;
let cursorEl = null;
let cursorPos = { x: STAGE_W * 0.5, y: STAGE_H * 0.5 };

function ensureCursor(stage) {
  if (!cursorEl) {
    cursorEl = document.createElement('div');
    cursorEl.id = 'cursor';
    cursorEl.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.6 L12 14 L19 14 Z" fill="#fff" stroke="#170b30" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  }
  stage.appendChild(cursorEl);
  cursorEl.style.transform = `translate(${cursorPos.x}px,${cursorPos.y}px)`;
  return cursorEl;
}
function setCursorVisible(v) { if (cursorEl) cursorEl.classList.toggle('hidden', !v); }

// moves the cursor smoothly to a target point (stage px), resolves when done
function moveCursor(stage, x, y, ms, signal) {
  return new Promise(res => {
    ensureCursor(stage);
    setCursorVisible(true);
    const from = { ...cursorPos };
    const to = { x, y };
    const t0 = performance.now();
    if (signal && signal.aborted) { cursorPos = to; cursorEl.style.transform = `translate(${to.x}px,${to.y}px)`; return res('aborted'); }
    function step(now) {
      if (signal && signal.aborted) { cursorPos = to; return res('aborted'); }
      const k = clamp((now - t0) / ms);
      const e = easeInOut(k);
      const x = lerp(from.x, to.x, e), y = lerp(from.y, to.y, e);
      cursorPos = { x, y };
      cursorEl.style.transform = `translate(${x}px,${y}px)`;
      if (k < 1) requestAnimationFrame(step);
      else res('done');
    }
    requestAnimationFrame(step);
  });
}

function clickRipple(stage, x, y, dk) {
  const r = document.createElement('div');
  r.className = 'ripple' + (dk ? ' dk' : '');
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  stage.appendChild(r);
  setTimeout(() => r.remove(), 520);
}

// click on a DOM element: moves the cursor to its center, ripples, resolves
async function clickEl(stage, el, opts = {}, signal) {
  if (!el) return;
  const sr = stage.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  const x = er.left - sr.left + er.width * (opts.fx ?? 0.5);
  const y = er.top - sr.top + er.height * (opts.fy ?? 0.5);
  await moveCursor(stage, x, y, opts.ms || 750, signal);
  if (signal && signal.aborted) return;
  await sleep(90, signal);
  clickRipple(stage, x, y, opts.dk);
  el.classList.add('pulse-hit');
  setTimeout(() => el.classList.remove('pulse-hit'), 300);
}

function setCaption(root, html) {
  const cap = root.querySelector('.caption');
  if (!cap) return;
  cap.innerHTML = html;
  cap.classList.add('show');
}
function clearCaption(root) {
  const cap = root.querySelector('.caption');
  if (cap) cap.classList.remove('show');
}

// ---------------- stage scaling ----------------
function fitStage() {
  const stage = document.getElementById('stage');
  const wrap = document.querySelector('.stage-wrap');
  if (!stage || !wrap) return;
  const pad = 24;
  const availW = wrap.clientWidth - pad * 2;
  const availH = wrap.clientHeight - pad * 2;
  const scale = Math.min(availW / STAGE_W, availH / STAGE_H, 1.15);
  stage.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fitStage);

// ---------------- small DOM builders reused by chapters ----------------
function el(tag, cls, html) {
  const e = document.createElement('div');
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  e.setAttribute('data-tag', tag);
  return e;
}
function avatar(name, bg, sz = 40) {
  const init = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const a = document.createElement('div');
  a.className = 'avatar';
  a.style.cssText = `width:${sz}px;height:${sz}px;background:${bg};font-size:${sz * 0.36}px`;
  a.textContent = init;
  return a;
}
function money(v) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
