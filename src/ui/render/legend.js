// ============================================================
// legend.js — Legenda de cores do destaque de seleção.
// Fase 2: Selecionada (verde), Pré-requisito (azul),
// Libera (roxo), Sem relação (apagado).
// ============================================================

import { RELATION } from '../../state/selectors.js';

const LEGEND_ITEMS = [
  { rel: RELATION.SELECTED, label: 'Selecionada' },
  { rel: RELATION.PREREQUISITE, label: 'Pré-requisito' },
  { rel: RELATION.UNLOCKS, label: 'Libera' },
  { rel: RELATION.UNRELATED, label: 'Sem relação' },
];

/**
 * Renderiza a legenda dentro do container (idempotente).
 * @param {HTMLElement} container
 * @returns {HTMLElement} o container preenchido
 */
export function renderLegend(container) {
  container.replaceChildren();

  const wrap = document.createElement('div');
  wrap.className = 'legend';

  const title = document.createElement('span');
  title.className = 'legend-title';
  title.textContent = 'Legenda';

  const items = document.createElement('div');
  items.className = 'legend-items';

  for (const item of LEGEND_ITEMS) {
    const chip = document.createElement('span');
    chip.className = 'legend-item';

    const swatch = document.createElement('span');
    swatch.className = `legend-swatch legend-swatch--${item.rel}`;

    const label = document.createElement('span');
    label.className = 'legend-label';
    label.textContent = item.label;

    chip.append(swatch, label);
    items.appendChild(chip);
  }

  wrap.append(title, items);
  container.appendChild(wrap);
  return container;
}
