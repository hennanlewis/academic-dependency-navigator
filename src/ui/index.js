// ============================================================
// index.js — Bootstrap (Fase 0)
// Carrega os dados, normaliza, valida e renderiza os metadados
// do curso + status da validação. A grade real chega na Fase 1.
// ============================================================

import { curriculumData, curriculumMeta } from '../../data/curriculum-letras.js';
import { normalizeCurriculum } from '../domain/curriculum.js';
import { validateCurriculum } from '../domain/validators/curriculum-validator.js';
import { buildGraph } from '../domain/graph-builder.js';
import { renderBoard } from './render/board.js';

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

function renderStats(curriculum, validation) {
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
  renderStats(curriculum, validation);
  renderValidation(validation);

  const graph = buildGraph(curriculum);
  window.__adnGraph = graph; // exposto para Fases seguintes (debug/inspeção)

  const board = document.getElementById('board');
  if (board) renderBoard(board, curriculum);
}

document.addEventListener('DOMContentLoaded', main);
