// ============================================================
// catalog.js — Course Catalog.
// Lista todas as disciplinas do currículo (trabalho = base +
// tentativas) com busca por nome/código. Reusa o bootstrap
// compartilhado. Fase 6.5 (MPA).
// ============================================================

import { createApp } from './bootstrap.js';
import { STATUS, STATUS_LABELS } from '../domain/status.js';

function row(d, status) {
  const el = document.createElement('a');
  el.className = 'catalog-row';
  el.href = 'index.html';
  el.title = 'Abrir na matriz';

  const code = document.createElement('span');
  code.className = 'catalog-code';
  code.textContent = d.code || d.id;

  const name = document.createElement('span');
  name.className = 'catalog-name';
  name.textContent = (d.attempt ? `${d.name} (T${d.attempt})` : d.name);

  const badges = document.createElement('span');
  badges.className = 'catalog-badges';

  const type = document.createElement('span');
  type.className = 'catalog-type';
  type.textContent = d.type;

  const meta = document.createElement('span');
  meta.className = 'catalog-meta';
  const sem = d.recommendedSemester ? `S${d.recommendedSemester}` : d.type === 'Obrigatória' ? '—' : '—';
  meta.textContent = `${sem} · ${d.workload}${d.workload_unit || 'h'}${d.credits ? ` · ${d.credits}cr` : ''}`;

  badges.append(type);

  const statusEl = document.createElement('span');
  statusEl.className = 'catalog-status';
  statusEl.dataset.status = status ?? '';
  statusEl.textContent = status ? STATUS_LABELS[status] : 'Pendente';
  badges.appendChild(statusEl);

  el.append(code, name, badges, meta);
  return el;
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
  const status = app.getState().status;
  const disciplines = app.getWorkingCurriculum().disciplines;

  renderMeta(app.baseCurriculum);

  const list = document.getElementById('catalog-list');
  const count = document.getElementById('catalog-count');
  const filter = document.getElementById('catalog-filter');
  if (!list) return;

  let current = [];

  const render = () => {
    list.replaceChildren();
    for (const d of current) list.appendChild(row(d, status.get(d.id)));
    if (count) count.textContent = `${current.length} disciplinas`;
  };

  const applyFilter = () => {
    const q = (filter.value || '').trim().toLowerCase();
    current = q
      ? disciplines.filter(
          (d) =>
            (d.name || '').toLowerCase().includes(q) ||
            (d.code || '').toLowerCase().includes(q) ||
            (d.id || '').toLowerCase().includes(q)
        )
      : disciplines;
    render();
  };

  filter.addEventListener('input', applyFilter);
  applyFilter();

  // Re-renderiza quando o status muda (ex.: outra aba salvou algo novo).
  app.store.subscribe(() => {
    const fresh = app.getState().status;
    current = current.map((d) => d);
    list.replaceChildren(...current.map((d) => row(d, fresh.get(d.id))));
    if (count) count.textContent = `${current.length} disciplinas`;
  });
}

document.addEventListener('DOMContentLoaded', main);