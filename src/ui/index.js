// ============================================================
// index.js — Bootstrap.
// Fase 0/1: carrega, normaliza, valida e renderiza a grade.
// Fase 2: cria o store, restaura a seleção salva, conecta a
// interação de seleção, renderiza a legenda e aplica os destaques.
// ============================================================

import { curriculumData, curriculumMeta } from '../../data/curriculum-letras.js';
import { normalizeCurriculum } from '../domain/curriculum.js';
import { validateCurriculum } from '../domain/validators/curriculum-validator.js';
import { buildGraph } from '../domain/graph-builder.js';
import { createStore } from '../state/store.js';
import { deriveSelection, classifyCard, RELATION } from '../state/selectors.js';
import { loadState, saveState } from '../state/store-persistence.js';
import { applySelectionToBoard, applyStatusesToBoard } from './render/card.js';
import { renderBoard } from './render/board.js';
import { renderLegend } from './render/legend.js';
import { setupSelection } from './interactions/selection.js';
import { setupStatusEditor } from './interactions/status-editor.js';

const THEME_KEY = 'adn.theme';

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? 'Claro' : 'Escuro';
  return theme;
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? 'Claro' : 'Escuro';
}

function renderMeta(curriculum) {
  const el = document.getElementById('course-meta');
  if (!el) return;
  const meta = curriculum.meta;
  el.textContent = [meta.curso, meta.instituicao, meta.versao].filter(Boolean).join(' — ');
}

function renderStats(curriculum) {
  const el = document.getElementById('course-stats');
  if (!el) return;
  const total = curriculum.disciplines.length;
  const obrig = curriculum.disciplines.filter((d) => d.type === 'Obrigatória').length;
  const opt = curriculum.disciplines.filter((d) => d.type === 'Optativa').length;
  const comp = curriculum.disciplines.filter((d) => d.type === 'Complementar').length;
  el.innerHTML = `
    <span>${total} disciplinas</span>
    <span>${obrig} obrigatórias</span>
    <span>${opt} optativas</span>
    <span>${comp} complementares</span>
  `;
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
  initTheme();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

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
  renderStats(curriculum);
  renderValidation(validation);

  const graph = buildGraph(curriculum);
  const board = document.getElementById('board');
  const legend = document.getElementById('legend');

  if (board) renderBoard(board, curriculum);
  if (legend) renderLegend(legend);

  // Restaura seleção e status salvos (Fases 2 e 3).
  const saved = loadState();
  const restored = new Set(
    saved && saved.selected
      ? [...saved.selected].filter((id) => graph.hasDiscipline(id))
      : []
  );
  const restoredStatus = new Map(
    saved && saved.status
      ? [...saved.status].filter(([id]) => graph.hasDiscipline(id))
      : []
  );
  const store = createStore({ selected: restored, status: restoredStatus });

  // Assinatura: a cada mudança relevante, re-deriva e aplica destaque.
  const applySelection = () => {
    const state = store.getState();
    const sel = deriveSelection(graph, state);
    if (board) {
      applySelectionToBoard(board, sel, sel.selected.size > 0);
      applyStatusesToBoard(board, state.status);
    }
    if (legend) renderLegend(legend);
    saveState(state);
  };

  store.subscribe(applySelection);
  applySelection();

  if (board) {
    setupSelection({ board, store });
    setupStatusEditor({ board, store, graph });
  }

  window.__adnStore = store;
  window.__adnGraph = graph;
  window.__adnRELATION = RELATION;
  window.__adnClassify = classifyCard;
}

document.addEventListener('DOMContentLoaded', main);