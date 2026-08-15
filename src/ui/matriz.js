// ============================================================
// index.js — Bootstrap.
// Fase 0/1: carrega, normaliza, valida e renderiza a grade.
// Fase 2: cria o store, restaura a seleção salva, conecta a
// interação de seleção, renderiza a legenda e aplica os destaques.
// ============================================================

import { curriculumData, curriculumMeta } from '../../data/curriculum-letras.js';
import { normalizeCurriculum } from '../domain/curriculum.js';
import { validateCurriculum } from '../domain/validators/curriculum-validator.js';
import { deriveSelection, deriveAvailable, classifyCard, RELATION } from '../state/selectors.js';
import { saveState } from '../state/store-persistence.js';
import { applySelectionToBoard, applyStatusesToBoard, applyAvailabilityToBoard } from './render/card.js';
import { renderBoard } from './render/board.js';
import { renderLegend } from './render/legend.js';
import { setupSelection } from './interactions/selection.js';
import { setupStatusEditor } from './interactions/status-editor.js';
import { createApp } from './bootstrap.js';

function renderMeta(curriculum) {
  const el = document.getElementById('course-meta');
  if (!el) return;
  const meta = curriculum.meta;
  el.textContent = [meta.curso, meta.instituicao, meta.versao].filter(Boolean).join(' — ');
}

function renderValidation(validation) {
  const el = document.getElementById('validation-status');
  if (!el) return;
  const ok = validation.valid && validation.errors.length === 0;
  el.className = 'label-md';
  el.classList.add(ok ? 'text-secondary' : 'text-error');
  el.textContent = ok ? '✓ Matriz válida' : `✗ Matriz inválida (${validation.errors.length} erro(s))`;

  if (validation.errors.length > 0 || validation.warnings.length > 0) {
    const box = document.getElementById('validation-details');
    if (box) {
      const lines = [
        ...validation.errors.map((e) => `<li class="text-error">${e}</li>`),
        ...validation.warnings.map((w) => `<li class="text-outline">${w}</li>`),
      ];
      box.innerHTML = `<ul>${lines.join('')}</ul>`;
    }
  }
}

function main() {
  const app = createApp();
  const { store } = app;

  let curriculum;
  try {
    curriculum = normalizeCurriculum(curriculumData, curriculumMeta);
  } catch (err) {
    const el = document.getElementById('validation-status');
    if (el) {
      el.textContent = `Erro ao carregar dados: ${err.message}`;
      el.classList.add('text-error');
    }
    return;
  }

  const validation = validateCurriculum(curriculum);
  renderMeta(curriculum);
  renderValidation(validation);

  const board = document.getElementById('board');
  const legend = document.getElementById('legend');

  const applyAll = () => {
    const state = store.getState();
    const graph = app.rebuild();
    if (board) renderBoard(board, app.getWorkingCurriculum(), state.semesterOverrides);
    const sel = deriveSelection(graph, state);
    if (board) {
      applySelectionToBoard(board, sel, sel.selected.size > 0);
      applyStatusesToBoard(board, state.status);
      applyAvailabilityToBoard(board, deriveAvailable(graph, state.status));
    }
    if (legend) renderLegend(legend);
    saveState(state);
  };

  store.subscribe(applyAll);

  applyAll();

  if (board) {
    setupSelection({ board, store });
    setupStatusEditor({ board, store, graph: () => app.getGraph() });
  }

  window.__adnStore = store;
  window.__adnGraph = () => app.getGraph();
  window.__adnRELATION = RELATION;
  window.__adnClassify = classifyCard;
}

document.addEventListener('DOMContentLoaded', main);