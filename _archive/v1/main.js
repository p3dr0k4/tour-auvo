// ============================================================
// Hub cards + player wiring: chapter switching, play/pause,
// timeline dots, "assistir tudo" autoplay.
// ============================================================
const CARDS = [
  { id: 'operacao', title: 'Operação', desc: 'Agenda do dia, roteirização e ordem de serviço digital — do agendamento ao técnico em campo.', ic: '📋', bg: 'linear-gradient(135deg,#7c3aed,#a855f7)', kind: 'chapter' },
  { id: 'cadastros', title: 'Cadastros', desc: 'Um cadastro de cliente só, usado por toda a operação: equipamentos, PMOC e financeiro.', ic: '👥', bg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', kind: 'chapter' },
  { id: 'financeiro', title: 'Financeiro', desc: 'Fluxo de caixa em tempo real e cobrança automática por contrato — sem esquecer cliente.', ic: '💳', bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)', kind: 'chapter' },
  { id: 'pmoc', title: 'PMOC', desc: 'O plano de manutenção obrigatório por lei, 100% digital — pronto pra fiscalização.', ic: '🌡️', bg: 'linear-gradient(135deg,#22c55e,#4ade80)', kind: 'chapter' },
  { id: 'relatorios', title: 'Relatórios', desc: 'Produtividade por técnico, SLA e satisfação — decisão com dado, não achismo.', ic: '📊', bg: 'linear-gradient(135deg,#ec4899,#f472b6)', kind: 'chapter' },
  { id: 'auvohub', title: 'AuvoHub / AuvoChat', desc: 'Atendimento, CRM e IA num único WhatsApp. Já tem um tour próprio, completo.', ic: '💬', bg: 'linear-gradient(135deg,#a855f7,#c026d3)', kind: 'ext', href: 'https://tutorial-auvohub.vercel.app/' },
  { id: 'auvodesk', title: 'AuvoDesk', desc: 'Central de chamados com a cara do seu cliente — sistema próprio, conectado ao Auvo.', ic: '🎧', bg: 'linear-gradient(135deg,#16a34a,#22c55e)', kind: 'chapter', bonus: true },
];

function renderHub() {
  const grid = document.getElementById('cardGrid');
  grid.innerHTML = '';
  CARDS.forEach(c => {
    const card = el('div', 'card' + (c.kind === 'ext' ? ' ext' : '') + (c.bonus ? ' desk' : ''));
    if (c.bonus) card.innerHTML = `<span class="card-badge" style="background:rgba(34,197,94,.16);color:#4ade80">Bônus</span>`;
    if (c.kind === 'ext') card.innerHTML += `<span class="card-badge" style="background:rgba(56,189,248,.16);color:#38bdf8">Abre em nova aba</span>`;
    card.innerHTML += `<div class="card-ic" style="background:${c.bg}">${c.ic}</div>
      <h3 class="card-title">${c.title}</h3>
      <p class="card-desc">${c.desc}</p>
      <div class="card-foot">${c.kind === 'ext' ? 'Ver tour do AuvoHub' : 'Assistir capítulo'} →</div>`;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      if (c.kind === 'ext') { window.open(c.href, '_blank', 'noopener'); return; }
      openPlayer(CHAPTERS.findIndex(ch => ch.id === c.id));
    });
    grid.appendChild(card);
  });
  const names = Object.values(SC.clientes).slice(0, 3).map(c => c.nome);
  document.getElementById('threadLine').innerHTML =
    names.map((n, i) => `<span>${n}</span>${i < names.length - 1 ? '<span class="dot"></span>' : ''}`).join('') +
    '<span class="dot"></span><span>o mesmo cliente, em cinco telas diferentes</span>';
}

let curIdx = 0, curCtrl = null, playing = true, autoAdvance = true;

function buildTimeline() {
  const row = document.getElementById('timelineRow');
  row.innerHTML = '';
  CHAPTERS.forEach((c, i) => {
    const seg = el('div', 'tl-seg');
    seg.innerHTML = '<i></i>';
    seg.addEventListener('click', () => gotoChapter(i));
    row.appendChild(seg);
  });
}
function markTimeline() {
  document.querySelectorAll('.tl-seg').forEach((seg, i) => {
    seg.classList.toggle('done', i < curIdx);
    seg.querySelector('i').style.width = i === curIdx ? '35%' : (i < curIdx ? '100%' : '0%');
  });
  document.getElementById('ctrlLabel').textContent = `${curIdx + 1} / ${CHAPTERS.length}`;
}

function openPlayer(idx) {
  document.getElementById('hub').style.display = 'none';
  document.getElementById('player').classList.add('on');
  buildTimeline();
  autoAdvance = true;
  gotoChapter(idx);
  requestAnimationFrame(fitStage);
}
function closePlayer() {
  if (curCtrl) curCtrl.abort();
  document.getElementById('player').classList.remove('on');
  document.getElementById('hub').style.display = '';
}

async function gotoChapter(idx) {
  if (idx < 0 || idx >= CHAPTERS.length) { closePlayer(); return; }
  if (curCtrl) curCtrl.abort();
  curIdx = idx;
  const ch = CHAPTERS[idx];
  document.getElementById('pTitle').textContent = ch.title;
  document.getElementById('pBonus').style.display = ch.bonus ? '' : 'none';
  markTimeline();
  const stage = document.getElementById('stage');
  cursorEl = null; // rebuild cursor for fresh stage
  cursorPos = { x: STAGE_W * 0.5, y: STAGE_H * 0.15 };
  const refs = ch.build(stage);
  requestAnimationFrame(fitStage);
  const ctrl = new AbortController();
  curCtrl = ctrl;
  playing = true;
  document.getElementById('playBtn').textContent = '❚❚';
  try {
    await ch.play(stage, refs, ctrl.signal);
  } catch (e) { /* aborted mid-await, fine */ }
  if (!ctrl.signal.aborted && autoAdvance) gotoChapter(idx + 1);
}

document.getElementById('playAll').addEventListener('click', () => openPlayer(0));
document.getElementById('backBtn').addEventListener('click', closePlayer);
document.getElementById('nextBtn').addEventListener('click', () => gotoChapter(curIdx + 1));
document.getElementById('prevBtn').addEventListener('click', () => gotoChapter(curIdx - 1));
document.getElementById('playBtn').addEventListener('click', () => {
  playing = !playing;
  document.getElementById('playBtn').textContent = playing ? '❚❚' : '▶';
  autoAdvance = playing;
  if (!playing && curCtrl) curCtrl.abort();
});

renderHub();
