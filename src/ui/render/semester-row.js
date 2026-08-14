// ============================================================
// semester-row.js — Seção/coluna de um semestre.
// ============================================================

import { renderCard } from './card.js';

/**
 * Cria a coluna de um semestre com seus cartões.
 * @param {number|null} semester número do semestre (null/0 para seções avulsas)
 * @param {string} title texto do cabeçalho
 * @param {Array<Object>} disciplines disciplinas
 * @returns {HTMLElement}
 */
export function renderSemesterRow(semester, title, disciplines) {
  const col = document.createElement('section');
  col.className = 'semester-col';
  col.dataset.semester = semester ?? 0;

  const header = document.createElement('div');
  header.className = 'semester-head';

  const h = document.createElement('h3');
  h.className = 'semester-title';
  h.textContent = title;

  const total = document.createElement('span');
  total.className = 'semester-total';
  const sum = disciplines.reduce((acc, d) => acc + (d.workload || 0), 0);
  total.textContent = `${disciplines.length} disc. · ${sum}h`;

  header.append(h, total);
  col.append(header);

  const list = document.createElement('div');
  list.className = 'semester-list';
  for (const d of disciplines) list.appendChild(renderCard(d));
  col.append(list);

  return col;
}
