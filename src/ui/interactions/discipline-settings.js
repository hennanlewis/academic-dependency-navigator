// ============================================================
// discipline-settings.js — Modal de configuração da disciplina.
// Reúne, em um único lugar, todas as alterações possíveis hoje:
// status acadêmico, semestre (mover) e nova/remoção de tentativa.
// Aberto a partir do Catálogo ao clicar numa disciplina.
// ============================================================

import { STATUS, STATUS_OPTIONS } from '../../domain/status.js';
import { openModal } from '../render/modal.js';

const EXTRA_SEMESTER = 11;

/** Número de semestres regulares da matriz (derivado dos dados). */
function computeSemesterCount(graph) {
  const max = graph.getMaxRecommendedSemester ? graph.getMaxRecommendedSemester() : 10;
  return typeof max === 'number' && max > 0 ? max : 10;
}

function label(text, htmlFor, className = 'label-md') {
  const el = document.createElement('label');
  el.className = className;
  el.textContent = text;
  if (htmlFor) el.htmlFor = htmlFor;
  return el;
}

/**
 * Abre o modal de configuração de uma disciplina.
 * @param {Object} deps
 * @param {Object} deps.store store central
 * @param {Function|import('../../domain/graph.js').CurriculumGraph} deps.graph grafo (ou getter)
 * @param {string} deps.disciplineId
 */
export function openDisciplineSettings({ store, graph, disciplineId }) {
  const resolve = () => (typeof graph === 'function' ? graph() : graph);
  const g = resolve();
  const discipline = g.getDiscipline(disciplineId);
  if (!discipline) return;

  const currentStatus = store.getStatus(disciplineId);
  const currentSemester = store.getSemesterOverride(disciplineId) ?? discipline.recommendedSemester;
  const originalId = store.getOriginalId(disciplineId);
  const max = computeSemesterCount(g);

  openModal({
    eyebrow: 'Configurações da disciplina',
    title: discipline.name,
    content: (body) => {
      const info = document.createElement('p');
      info.className = 'status-hint';
      info.textContent =
        `${discipline.code || discipline.id} · ${discipline.type} · ` +
        `${discipline.workload}${discipline.workload_unit}` +
        (discipline.credits ? ` · ${discipline.credits} cr` : '') +
        (originalId ? ' · cópia de tentativa' : '');
      body.appendChild(info);

      // ---- Status acadêmico ----
      const statusSection = document.createElement('section');
      statusSection.className = 'settings-section';
      statusSection.appendChild(label('Status acadêmico'));

      const fieldset = document.createElement('div');
      fieldset.className = 'status-options';
      fieldset.setAttribute('role', 'radiogroup');
      fieldset.setAttribute('aria-label', 'Status da disciplina');

      const picked = new Set([currentStatus === null ? 'none' : currentStatus]);
      for (const opt of STATUS_OPTIONS) {
        const key = opt.value === null ? 'none' : opt.value;
        const lbl = document.createElement('label');
        lbl.className = 'status-option';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'status';
        input.className = 'status-radio';
        input.value = key;
        input.checked = picked.has(key);

        const span = document.createElement('span');
        span.className = 'status-option-label';
        span.textContent = opt.label;

        lbl.append(input, span);
        fieldset.appendChild(lbl);
      }
      statusSection.appendChild(fieldset);
      body.appendChild(statusSection);

      // ---- Semestre (mover) ----
      const semSection = document.createElement('section');
      semSection.className = 'settings-section';
      semSection.appendChild(label('Semestre', 'discipline-semester'));

      const select = document.createElement('select');
      select.id = 'discipline-semester';
      select.name = 'semester';
      select.className = 'move-select';

      const numbers = [...Array(max).keys()].map((i) => i + 1);
      numbers.push(EXTRA_SEMESTER);
      for (const sem of numbers) {
        const opt = document.createElement('option');
        opt.value = String(sem);
        opt.textContent = sem === EXTRA_SEMESTER ? `Semestre ${sem} (extra)` : `Semestre ${String(sem).padStart(2, '0')}`;
        if (currentSemester === sem) opt.selected = true;
        select.appendChild(opt);
      }
      semSection.appendChild(select);
      body.appendChild(semSection);

      // ---- Tentativas ----
      if (!originalId && currentStatus === STATUS.FAILED) {
        const attemptSection = document.createElement('section');
        attemptSection.className = 'settings-section';
        attemptSection.appendChild(label('Nova tentativa'));
        const hint = document.createElement('p');
        hint.className = 'status-hint';
        hint.textContent = 'Cria uma cópia desta disciplina no semestre escolhido para refazer.';
        attemptSection.appendChild(hint);
        body.appendChild(attemptSection);
      }

      if (originalId) {
        const removeSection = document.createElement('section');
        removeSection.className = 'settings-section';
        removeSection.appendChild(label('Tentativa'));
        const hint = document.createElement('p');
        hint.className = 'status-hint';
        hint.textContent = 'Esta disciplina é uma cópia de tentativa. Você pode removê-la.';
        removeSection.appendChild(hint);
        body.appendChild(removeSection);
      }
    },
    footer: ({ close }) => {
      const cancel = document.createElement('button');
      cancel.className = 'btn btn-outline';
      cancel.type = 'button';
      cancel.textContent = 'Cancelar';
      cancel.addEventListener('click', close);

      const commit = (dialog) => {
        const sel = dialog.querySelector('input[name="status"]:checked');
        const value = sel ? sel.value : 'none';
        const nextStatus = value === 'none' ? STATUS.NONE : value;
        if (nextStatus !== store.getStatus(disciplineId)) {
          store.setStatus(disciplineId, nextStatus, g);
        }
        const semEl = dialog.querySelector('#discipline-semester');
        if (semEl) {
          const nextSem = Number(semEl.value);
          if (store.getSemesterOverride(disciplineId) !== nextSem) {
            store.setSemesterOverride(disciplineId, nextSem);
          }
        }
      };

      const save = document.createElement('button');
      save.className = 'btn btn-primary';
      save.type = 'button';
      save.textContent = 'Salvar';
      save.addEventListener('click', () => {
        commit(save.closest('.modal-dialog'));
        close();
      });

      const actions = [save, cancel];

      // Botões de tentativa agem imediatamente (commit + ação + fechar).
      if (!originalId && currentStatus === STATUS.FAILED) {
        const create = document.createElement('button');
        create.className = 'btn btn-primary';
        create.type = 'button';
        create.textContent = 'Criar tentativa';
        create.addEventListener('click', () => {
          const dialog = create.closest('.modal-dialog');
          commit(dialog);
          const semEl = dialog.querySelector('#discipline-semester');
          const semester = semEl ? Number(semEl.value) : currentSemester;
          store.createAttempt(disciplineId, semester);
          close();
        });
        actions.unshift(create);
      }

      if (originalId) {
        const remove = document.createElement('button');
        remove.className = 'btn btn-danger';
        remove.type = 'button';
        remove.textContent = 'Remover tentativa';
        remove.addEventListener('click', () => {
          commit(remove.closest('.modal-dialog'));
          store.removeAttempt(disciplineId);
          close();
        });
        actions.unshift(remove);
      }

      return actions;
    },
  });
}

/**
 * Configura a abertura do modal via clique nas linhas do catálogo
 * (delegação de eventos no container). O container é um elemento
 * que contém `.catalog-row`.
 * @param {Object} deps
 * @param {HTMLElement} deps.container container da lista
 * @param {Object} deps.store
 * @param {Function|import('../../domain/graph.js').CurriculumGraph} deps.graph grafo (ou getter)
 * @returns {Function} cleanup
 */
export function setupDisciplineSettings({ container, store, graph }) {
  const onClick = (event) => {
    const row = event.target.closest('.catalog-row');
    if (!row) return;
    const id = row.dataset.id;
    if (!id) return;
    openDisciplineSettings({ store, graph, disciplineId: id });
  };
  container.addEventListener('click', onClick);
  return () => container.removeEventListener('click', onClick);
}