// ============================================================
// catalog.js — Course Catalog.
// Lista todas as disciplinas do currículo (trabalho = base +
// tentativas) com busca por nome/código. Reusa o bootstrap
// compartilhado. Fase 6.5 (MPA).
// ============================================================

import { createApp } from './bootstrap.js';
import { STATUS, STATUS_LABELS } from '../domain/status.js';
import { saveState } from '../state/store-persistence.js';
import { setupDisciplineSettings } from './interactions/discipline-settings.js';

function row(d, status) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'catalog-row';
  el.dataset.id = d.id;
  el.title = 'Configurar disciplina';

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

  // Não-pendentes primeiro; dentro de cada grupo, ordenado por ID.
  const groupAndSort = (list) => {
    const nonPending = [];
    const pending = [];
    for (const d of list) {
      if (status.get(d.id)) nonPending.push(d);
      else pending.push(d);
    }
    const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    nonPending.sort(byId);
    pending.sort(byId);
    return [...nonPending, ...pending];
  };

  const render = () => {
    list.replaceChildren();
    for (const d of current) list.appendChild(row(d, status.get(d.id)));
    if (count) count.textContent = `${current.length} disciplinas`;
  };

  const applyFilter = () => {
    const q = (filter.value || '').trim().toLowerCase();
    const filtered = q
      ? disciplines.filter(
          (d) =>
            (d.name || '').toLowerCase().includes(q) ||
            (d.code || '').toLowerCase().includes(q) ||
            (d.id || '').toLowerCase().includes(q)
        )
      : disciplines;
    current = groupAndSort(filtered);
    render();
  };

  filter.addEventListener('input', applyFilter);
  applyFilter();

  setupDisciplineSettings({ container: list, store: app.store, graph: () => app.getGraph() });

  // Re-renderiza e persiste quando algo muda (status, semestre, tentativa).
  app.store.subscribe(() => {
    saveState(app.getState());
    const fresh = app.getState().status;
    current = groupAndSort(current);
    list.replaceChildren(...current.map((d) => row(d, fresh.get(d.id))));
    if (count) count.textContent = `${current.length} disciplinas`;
  });
}

document.addEventListener('DOMContentLoaded', main);