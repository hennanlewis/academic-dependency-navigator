// ============================================================
// shortcuts.js — Atalhos de teclado.
// ESC limpa a seleção; teclas rápidas aplicam status em lote sobre
// a seleção atual. Fase 8.
// ============================================================

import { STATUS } from '../../domain/status.js';

/** Mapa de tecla -> status a aplicar na seleção. */
const KEY_STATUS = {
  a: STATUS.COMPLETED, // Aprovada
  c: STATUS.CURRENT,   // Cursando
  r: STATUS.FAILED,    // Reprovada
  n: STATUS.NONE,      // Pendente (limpa status)
};

/**
 * Configura os atalhos de teclado globais.
 * @param {Object} deps
 * @param {Object} deps.store store central
 * @param {Function|import('../../domain/graph.js').CurriculumGraph} deps.graph grafo (ou getter)
 * @returns {Function} cleanup
 */
export function setupShortcuts({ store, graph }) {
  const resolve = () => (typeof graph === 'function' ? graph() : graph);

  const onKeyDown = (event) => {
    // Não intercepta enquanto o usuário digita em um campo.
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (event.key === 'Escape') {
      store.clearSelection();
      return;
    }

    // Ignora se houver modificadores (ex.: Ctrl+C para copiar).
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const key = event.key.toLowerCase();
    const status = KEY_STATUS[key];
    if (status === undefined) return;

    const selected = store.getState().selected;
    if (selected.size === 0) return;
    event.preventDefault();
    store.applyStatusBulk(selected, status, resolve());
  };

  document.addEventListener('keydown', onKeyDown);
  return () => document.removeEventListener('keydown', onKeyDown);
}