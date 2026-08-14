// ============================================================
// attempts.js — Nova tentativa (reprovação).
// Um botão no cartão abre um dialog para criar uma tentativa
// (cópia) da disciplina no semestre escolhido. A cópia vira um nó
// real do grafo via store.createAttempt + applyAttempts.
// Cópias exibem um badge com o número da tentativa e um botão para
// removê-la.
// Fase 6.
// ============================================================

import { openModal } from '../render/modal.js';

const EXTRA_SEMESTER = 11;

/** Número de semestres regulares da matriz (derivado dos dados). */
function computeSemesterCount(graph) {
  const max = graph.getMaxRecommendedSemester ? graph.getMaxRecommendedSemester() : 10;
  return typeof max === 'number' && max > 0 ? max : 10;
}

function makeCancelButton(close) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-outline';
  btn.type = 'button';
  btn.textContent = 'Cancelar';
  btn.addEventListener('click', close);
  return btn;
}

function makeSaveButton() {
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.type = 'button';
  btn.textContent = 'Criar tentativa';
  return btn;
}

/**
 * Abre o dialog de "Nova tentativa" para uma disciplina.
 * @param {Object} deps
 * @param {Object} deps.store store central
 * @param {Function|import('../../domain/graph.js').CurriculumGraph} deps.graph grafo (ou getter)
 * @param {string} deps.originalId id da disciplina a refazer
 */
export function openNewAttempt({ store, graph, originalId }) {
  const g = typeof graph === 'function' ? graph() : graph;
  const original = g.getDiscipline(originalId);
  if (!original) return;

  const current = store.getSemesterOverride(originalId) ?? original.recommendedSemester;
  const max = computeSemesterCount(g);

  openModal({
    eyebrow: 'Nova tentativa',
    title: `Refazer: ${original.name}`,
    content: (body) => {
      const field = document.createElement('div');
      field.className = 'move-field';

      const label = document.createElement('label');
      label.className = 'label-md';
      label.htmlFor = 'attempt-semester-select';
      label.textContent = 'Semestre da nova tentativa';

      const select = document.createElement('select');
      select.id = 'attempt-semester-select';
      select.name = 'semester';
      select.className = 'move-select';

      const options = [...Array(max).keys()].map((i) => i + 1);
      options.push(EXTRA_SEMESTER);

      for (const sem of options) {
        const opt = document.createElement('option');
        opt.value = String(sem);
        opt.textContent = sem === EXTRA_SEMESTER ? `Semestre ${sem} (extra)` : `Semestre ${String(sem).padStart(2, '0')}`;
        if (current === sem) opt.selected = true;
        select.appendChild(opt);
      }

      const hint = document.createElement('p');
      hint.className = 'status-hint';
      hint.textContent =
        'Cria uma cópia da disciplina no semestre escolhido. Use para refazer uma disciplina reprovada.';

      field.append(label, select);
      body.append(field, hint);
    },
    footer: ({ close }) => {
      const cancel = makeCancelButton(close);
      const save = makeSaveButton();

      const doSave = () => {
        const select = save.closest('.modal-dialog').querySelector('#attempt-semester-select');
        if (!select) return;
        const semester = Number(select.value);
        store.createAttempt(originalId, semester);
        close();
      };
      save.addEventListener('click', doSave);
      return [cancel, save];
    },
  });
}

/**
 * Configura os botões de tentativa no board (delegação de eventos).
 * - `.card-attempt`: abre o dialog de nova tentativa.
 * - `.card-attempt-remove`: remove a tentativa (cópia).
 * @param {Object} deps
 * @param {HTMLElement} deps.board container da grade
 * @param {Object} deps.store store central
 * @param {Function|import('../../domain/graph.js').CurriculumGraph} deps.graph grafo (ou getter)
 * @returns {Function} cleanup
 */
export function setupAttempts({ board, store, graph }) {
  const onBoardClick = (event) => {
    const create = event.target.closest('.card-attempt');
    if (create) {
      const id = create.closest('.card-disc')?.dataset.id;
      if (!id) return;
      event.stopPropagation();
      openNewAttempt({ store, graph, originalId: id });
      return;
    }

    const remove = event.target.closest('.card-attempt-remove');
    if (remove) {
      const id = remove.closest('.card-disc')?.dataset.id;
      if (!id) return;
      event.stopPropagation();
      store.removeAttempt(id);
    }
  };

  board.addEventListener('click', onBoardClick);
  return () => board.removeEventListener('click', onBoardClick);
}