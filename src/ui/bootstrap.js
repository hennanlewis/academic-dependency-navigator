// ============================================================
// bootstrap.js — Bootstrap compartilhado entre as páginas (MPA).
// Cada página chama `createApp()` para: aplicar tema, montar a
// sidebar de navegação, normalizar o currículo, reconstruir o store
// a partir do localStorage e construir o grafo (base + tentativas).
// Fase 6.5.
// ============================================================

import { curriculumData, curriculumMeta } from '../../data/curriculum-letras.js';
import { normalizeCurriculum } from '../domain/curriculum.js';
import { buildGraph } from '../domain/graph-builder.js';
import { applyAttempts } from '../domain/services/attempt-service.js';
import { createStore } from '../state/store.js';
import { loadState } from '../state/store-persistence.js';
import { initTheme, setupThemeToggle } from './theme.js';
import { mountNav } from './nav.js';

/**
 * Inicializa a base comum de uma página.
 * @returns {{
 *   baseCurriculum: Object,
 *   store: Object,
 *   getGraph: () => import('../domain/graph.js').CurriculumGraph,
 *   rebuild: () => import('../domain/graph.js').CurriculumGraph,
 *   getState: () => Object,
 * }}
 */
export function createApp() {
  initTheme();
  setupThemeToggle(document.getElementById('theme-toggle'));
  mountNav(document.getElementById('app-nav'));

  const baseCurriculum = normalizeCurriculum(curriculumData, curriculumMeta);

  const saved = loadState();
  const savedAttempts =
    saved && Array.isArray(saved.attempts)
      ? saved.attempts.filter((a) => baseCurriculum.disciplines.some((d) => d.id === a.originalId))
      : [];

  const validIds = new Set(baseCurriculum.disciplines.map((d) => d.id));
  for (const a of savedAttempts) validIds.add(a.id);

  const store = createStore({
    selected: new Set(saved && saved.selected ? [...saved.selected].filter((id) => validIds.has(id)) : []),
    status: new Map(saved && saved.status ? [...saved.status].filter(([id]) => validIds.has(id)) : []),
    semesterOverrides: new Map(
      saved && saved.semesterOverrides ? [...saved.semesterOverrides].filter(([id]) => validIds.has(id)) : []
    ),
    attempts: savedAttempts,
  });

  let workingCurriculum = applyAttempts(baseCurriculum, store.getState().attempts);
  let graph = buildGraph(workingCurriculum);

  const rebuild = () => {
    workingCurriculum = applyAttempts(baseCurriculum, store.getState().attempts);
    graph = buildGraph(workingCurriculum);
    return graph;
  };

  return {
    baseCurriculum,
    store,
    getGraph: () => graph,
    getWorkingCurriculum: () => workingCurriculum,
    rebuild,
    getState: store.getState,
  };
}