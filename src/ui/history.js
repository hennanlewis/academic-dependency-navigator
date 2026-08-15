// ============================================================
// history.js — Academic History (dashboard de progresso).
// Reusa o bootstrap compartilhado + selectors (deriveCompleted,
// deriveAvailable) para exibir o panorama do currículo.
// Fase 6.5 (MPA).
// ============================================================

import { createApp } from './bootstrap.js';
import { deriveAvailable, deriveCompleted } from '../state/selectors.js';
import { STATUS } from '../domain/status.js';

function stat(label, value, sub = '') {
  const card = document.createElement('div');
  card.className = 'stat-card';

  const v = document.createElement('div');
  v.className = 'stat-value';
  v.textContent = value;

  const t = document.createElement('div');
  t.className = 'stat-label';
  t.textContent = label;

  card.append(t, v);
  if (sub) {
    const s = document.createElement('div');
    s.className = 'stat-sub';
    s.textContent = sub;
    card.appendChild(s);
  }
  return card;
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
  let chCursada = 0;
  let cursando = 0;
  let reprovadas = 0;
  let obrig = 0;
  let opt = 0;
  let comp = 0;

  for (const d of disciplines) {
    chTotal += d.workload || 0;
    if (d.type === 'Obrigatória') obrig++;
    else if (d.type === 'Optativa') opt++;
    else if (d.type === 'Complementar') comp++;

    const st = status.get(d.id);
    if (st === STATUS.COMPLETED) chCursada += d.workload || 0;
    else if (st === STATUS.CURRENT) cursando++;
    else if (st === STATUS.FAILED) reprovadas++;
  }

  const pct = chTotal > 0 ? Math.round((chCursada / chTotal) * 100) : 0;

  const container = document.getElementById('history-stats');
  if (!container) return;
  container.replaceChildren();

  container.append(
    stat('Total de disciplinas', disciplines.length),
    stat('Obrigatórias', obrig),
    stat('Optativas', opt),
    stat('Complementares', comp),
    stat('Aprovadas', completed.size),
    stat('Cursando', cursando),
    stat('Reprovadas', reprovadas),
    stat('Disponíveis agora', available.size),
    stat('Carga horária', `${chTotal}h`),
    stat('CH cursada', `${chCursada}h`, `${pct}% do total`)
  );

  const done = document.createElement('div');
  done.className = 'stat-note';
  done.textContent = `Progresso: ${pct}% da carga horária aprovada.`;
  container.appendChild(done);
}

document.addEventListener('DOMContentLoaded', main);