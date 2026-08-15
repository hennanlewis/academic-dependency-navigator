// ============================================================
// dashboard.js — Dashboard (página inicial / index.html).
// Exibe as disciplinas com status "Cursando" (à esquerda) em cards
// de **apenas leitura** e, à direita, as estatísticas do currículo
// (via selectors). Fase 6.5 (MPA).
// ============================================================

import { createApp } from './bootstrap.js';
import { deriveAvailable, deriveCompleted } from '../state/selectors.js';
import { STATUS } from '../domain/status.js';
import { renderCard } from './render/card.js';

// Carga horária mínima total para se formar
// (vem do PPC; aqui como constante explícita).
const MIN_GRADUATION_LOAD = 4000;

// Estatística compacta: rótulo à esquerda, valor à direita
// (altura próxima às linhas do catálogo).
function stat(label, value, sub = '') {
  const row = document.createElement('div');
  row.className = 'stat-row';

  const t = document.createElement('span');
  t.className = 'stat-label';
  t.textContent = label;

  const right = document.createElement('span');
  right.className = 'stat-right';

  const v = document.createElement('span');
  v.className = 'stat-value';
  v.textContent = value;
  right.appendChild(v);

  if (sub) {
    const s = document.createElement('span');
    s.className = 'stat-sub';
    s.textContent = sub;
    right.appendChild(s);
  }

  row.append(t, right);
  return row;
}

function renderMeta(curriculum) {
  const el = document.getElementById('course-meta');
  if (el) {
    const m = curriculum.meta;
    el.textContent = [m.curso, m.instituicao, m.versao].filter(Boolean).join(' — ');
  }
}

function main() {
  const app = createApp();
  const graph = app.getGraph();
  const state = app.getState();
  const disciplines = app.getWorkingCurriculum().disciplines;

  renderMeta(app.baseCurriculum);

  const status = state.status;
  const completed = deriveCompleted(status);
  const available = deriveAvailable(graph, status);

  let chTotal = 0;
  let chObrigatoria = 0;
  let chCursada = 0;
  let cursando = 0;
  let reprovadas = 0;
  let obrig = 0;
  let opt = 0;
  let comp = 0;
  const cursandoIds = [];

  for (const d of disciplines) {
    const ch = d.workload || 0;
    chTotal += ch;
    if (d.type === 'Obrigatória') {
      obrig++;
      chObrigatoria += ch;
    } else if (d.type === 'Optativa') opt++;
    else if (d.type === 'Complementar') comp++;

    const st = status.get(d.id);
    if (st === STATUS.COMPLETED) chCursada += ch;
    else if (st === STATUS.CURRENT) {
      cursando++;
      cursandoIds.push(d);
    } else if (st === STATUS.FAILED) reprovadas++;
  }

  const pct = MIN_GRADUATION_LOAD > 0 ? Math.min(100, Math.round((chCursada / MIN_GRADUATION_LOAD) * 100)) : 0;
  const faltam = Math.max(0, MIN_GRADUATION_LOAD - chCursada);

  const statsEl = document.getElementById('history-stats');
  if (statsEl) {
    statsEl.replaceChildren();
    statsEl.append(
      stat('Total de disciplinas', disciplines.length),
      stat('Carga obrigatória', `${chObrigatoria}h`),
      stat('Mínimo para formar', `${MIN_GRADUATION_LOAD}h`),
      stat('Obrigatórias', obrig),
      stat('Optativas', opt),
      stat('Complementares', comp),
      stat('Aprovadas', completed.size),
      stat('Cursando', cursando),
      stat('Reprovadas', reprovadas),
      stat('Disponíveis agora', available.size),
      stat('CH cursada', `${chCursada}h`, `${pct}% do mínimo`),
      stat('Falta para formar', `${faltam}h`)
    );
    const done = document.createElement('div');
    done.className = 'stat-note';
    done.textContent =
      `Carga horária mínima total para se formar: ${MIN_GRADUATION_LOAD}h. ` +
      `As obrigatórias somam ${chObrigatoria}h; ` +
      'complementares e optativas completam a diferença para quem quiser fazer mais.';
    statsEl.appendChild(done);
  }

  const list = document.getElementById('cursando-list');
  const count = document.getElementById('cursando-count');
  if (list) {
    list.replaceChildren();
    const sorted = cursandoIds.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    for (const d of sorted) {
      const card = renderCard(d, { readOnly: true, status: STATUS.CURRENT });
      list.appendChild(card);
    }
    if (count) count.textContent = `${sorted.length} disciplina(s)`;
  }
}

document.addEventListener('DOMContentLoaded', main);