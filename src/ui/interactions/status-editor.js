// ============================================================
// status-editor.js — Modal de edição de status (estilo example3).
// Botão de status no cartão abre o modal com radios:
// Pendente / Aprovada / Cursando / Reprovada.
// Salvar chama store.setStatus (auto-completa prereqs no Cursando).
// ============================================================

import { STATUS, STATUS_OPTIONS, STATUS_LABELS } from '../../domain/status.js';
import { openModal } from '../render/modal.js';

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
  btn.textContent = 'Salvar';
  return btn;
}

/**
 * Abre o modal de edição de status para uma disciplina.
 * @param {Object} deps
 * @param {Object} deps.store store central
 * @param {import('../../domain/graph.js').CurriculumGraph} deps.graph
 * @param {string} deps.disciplineId
 */
export function openStatusEditor({ store, graph, disciplineId }) {
  const g = typeof graph === 'function' ? graph() : graph;
  const discipline = g.getDiscipline(disciplineId);
  if (!discipline) return;
  const current = store.getStatus(disciplineId);

  openModal({
    eyebrow: 'Status acadêmico',
    title: `Editar status: ${discipline.name}`,
    content: (body) => {
      const fieldset = document.createElement('div');
      fieldset.className = 'status-options';
      fieldset.setAttribute('role', 'radiogroup');
      fieldset.setAttribute('aria-label', 'Status da disciplina');

      const picked = new Set([current === null ? 'none' : current]);

      for (const opt of STATUS_OPTIONS) {
        const key = opt.value === null ? 'none' : opt.value;
        const label = document.createElement('label');
        label.className = 'status-option';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'status';
        input.className = 'status-radio';
        input.value = key;
        input.checked = picked.has(key);

        const span = document.createElement('span');
        span.className = 'status-option-label';
        span.textContent = opt.label;

        label.append(input, span);
        fieldset.appendChild(label);
      }

      const hint = document.createElement('p');
      hint.className = 'status-hint';
      hint.textContent =
        'Ao marcar "Cursando", os pré-requisitos diretos e indiretos são marcados como "Aprovada" automaticamente.';
      body.append(fieldset, hint);
    },
    footer: ({ close }) => {
      const cancel = makeCancelButton(close);
      const save = makeSaveButton();

      const doSave = () => {
        const selected = save.closest('.modal-dialog').querySelector('input[name="status"]:checked');
        const value = selected ? selected.value : 'none';
        store.setStatus(
          disciplineId,
          value === 'none' ? STATUS.NONE : value,
          g
        );
        close();
      };
      save.addEventListener('click', doSave);
      return [cancel, save];
    },
  });
}

/**
 * Configura a abertura do editor via clique no botão de status dos
 * cartões, por delegação de eventos no board.
 * @param {Object} deps
 * @param {HTMLElement} deps.board container da grade
 * @param {Object} deps.store
 * @param {import('../../domain/graph.js').CurriculumGraph} deps.graph
 * @returns {Function} cleanup
 */
export function setupStatusEditor({ board, store, graph }) {
  const onBoardClick = (event) => {
    const pill = event.target.closest('.card-disc-status');
    if (!pill) return;
    const id = pill.closest('.card-disc')?.dataset.id;
    if (!id) return;
    event.stopPropagation();
    openStatusEditor({ store, graph, disciplineId: id });
  };

  board.addEventListener('click', onBoardClick);
  return () => board.removeEventListener('click', onBoardClick);
}

export { STATUS_LABELS };