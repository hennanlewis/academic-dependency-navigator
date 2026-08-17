// ============================================================
// bulk-actions.js — Aplicação de status em lote sobre a seleção.
// Oferece um agrupamento de botões (Aprovada/Cursando/Reprovada/
// Pendente) que atua sobre as disciplinas selecionadas no board.
// Fase 8.
// ============================================================

import { STATUS, STATUS_OPTIONS } from '../../domain/status.js';

/**
 * Cria a barra de ações em lote.
 * @param {Object} deps
 * @param {Object} deps.store store central
 * @param {Function|import('../../domain/graph.js').CurriculumGraph} deps.graph grafo (ou getter)
 * @param {HTMLElement} deps.activeLabel elemento que mostra quantas estão selecionadas
 * @returns {HTMLElement} o elemento `.bulk-bar`
 */
export function renderBulkBar({ store, graph, activeLabel }) {
  const resolve = () => (typeof graph === 'function' ? graph() : graph);
  const selectedCount = () => store.getState().selected.size;

  const bar = document.createElement('div');
  bar.className = 'bulk-bar';

  const hint = document.createElement('span');
  hint.className = 'bulk-hint';
  hint.textContent = `${selectedCount()} selecionada(s)`;

  const group = document.createElement('div');
  group.className = 'bulk-actions';

  const apply = (status) => () => {
    const sel = store.getState().selected;
    if (sel.size === 0) return;
    store.applyStatusBulk(sel, status, resolve());
  };

  for (const opt of STATUS_OPTIONS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm';
    btn.dataset.status = opt.value === null ? '' : opt.value;
    btn.textContent = opt.value === null ? 'Pendente' : opt.label;
    btn.title = `Marcar seleção como ${opt.label === 'Pendente' ? 'pendente' : opt.label}`;
    btn.addEventListener('click', apply(opt.value));
    group.appendChild(btn);
  }

  const refreshHint = () => {
    const n = selectedCount();
    hint.textContent = `${n} selecionada(s)`;
    if (activeLabel) activeLabel.textContent = `${n} selecionada(s)`;
    for (const btn of group.querySelectorAll('button')) {
      btn.disabled = n === 0;
    }
  };

  bar.append(hint, group);

  // Mantém o contador atualizado conforme a seleção muda.
  store.subscribe(refreshHint);
  refreshHint();

  return bar;
}