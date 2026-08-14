// ============================================================
// move-semester.js — Mover disciplina para outro semestre.
// Dialog com seletor de semestre (incluindo opção de semestre
// extra / 11º). Persistido no store como semesterOverride.
// Fase 5.
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
  btn.textContent = 'Mover';
  return btn;
}

/**
 * Abre o dialog de mover de semestre para uma disciplina.
 * @param {Object} deps
 * @param {Object} deps.store store central
 * @param {import('../../domain/graph.js').CurriculumGraph} deps.graph
 * @param {string} deps.disciplineId
 */
export function openMoveSemester({ store, graph, disciplineId }) {
  const g = typeof graph === 'function' ? graph() : graph;
  const discipline = g.getDiscipline(disciplineId);
  if (!discipline) return;
  const current = store.getSemesterOverride(disciplineId) ?? discipline.recommendedSemester;
  const max = computeSemesterCount(g);

  openModal({
    eyebrow: 'Mover de semestre',
    title: `Mover: ${discipline.name}`,
    content: (body) => {
      const field = document.createElement('div');
      field.className = 'move-field';

      const label = document.createElement('label');
      label.className = 'label-md';
      label.htmlFor = 'move-semester-select';
      label.textContent = 'Semestre de destino';

      const select = document.createElement('select');
      select.id = 'move-semester-select';
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

      field.append(label, select);
      body.appendChild(field);
    },
    footer: ({ close }) => {
      const cancel = makeCancelButton(close);
      const save = makeSaveButton();

      const doSave = () => {
        const select = save.closest('.modal-dialog').querySelector('#move-semester-select');
        if (!select) return;
        const value = Number(select.value);
        if (store.getSemesterOverride(disciplineId) === value) {
          close();
          return;
        }
        store.setSemesterOverride(disciplineId, value);
        close();
      };
      save.addEventListener('click', doSave);
      return [cancel, save];
    },
  });
}

/**
 * Configura a abertura do editor de mover via clique no cartão,
 * por delegação de eventos no board.
 * @param {Object} deps
 * @param {HTMLElement} deps.board container da grade
 * @param {Object} deps.store
 * @param {import('../../domain/graph.js').CurriculumGraph} deps.graph
 * @returns {Function} cleanup
 */
export function setupMoveSemester({ board, store, graph }) {
  const onBoardClick = (event) => {
    const trigger = event.target.closest('.card-move');
    if (!trigger) return;
    const id = trigger.closest('.card-disc')?.dataset.id;
    if (!id) return;
    event.stopPropagation();
    openMoveSemester({ store, graph, disciplineId: id });
  };

  board.addEventListener('click', onBoardClick);
  return () => board.removeEventListener('click', onBoardClick);
}