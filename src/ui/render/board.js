// ============================================================
// board.js — Grade por semestre (renderização estática).
// Organiza por semestre recomendado; seções separadas para
// Optativas e Complementares (semestre null/0).
// ============================================================

import { renderSemesterRow } from './semester-row.js';

/**
 * Agrupa as disciplinas por semestre e por tipo (avulsas).
 * Leva em conta os overrides de semestre (Fase 5).
 * @param {Array<Object>} disciplines
 * @param {Map<string,number>} [overrides] id -> semestre movido
 * @returns {{bySemester:Map<number,Array>, optativa:Array, complementar:Array}}
 */
export function groupBySemester(disciplines, overrides = new Map()) {
  const bySemester = new Map();
  const optativa = [];
  const complementar = [];

  for (const d of disciplines) {
    const sem = overrides.get(d.id) ?? d.recommendedSemester;
    if (sem && sem > 0) {
      if (!bySemester.has(sem)) bySemester.set(sem, []);
      bySemester.get(sem).push(d);
    } else if (d.type === 'Optativa') {
      optativa.push(d);
    } else if (d.type === 'Complementar') {
      complementar.push(d);
    } else {
      if (!bySemester.has(0)) bySemester.set(0, []);
      bySemester.get(0).push(d);
    }
  }

  return { bySemester, optativa, complementar };
}

/**
 * Renderiza a grade completa dentro do container.
 * @param {HTMLElement} container
 * @param {Object} curriculum currículo canônico
 * @param {Map<string,number>} [overrides] id -> semestre movido (Fase 5)
 */
export function renderBoard(container, curriculum, overrides = new Map()) {
  container.replaceChildren();
  const { bySemester, optativa, complementar } = groupBySemester(curriculum.disciplines, overrides);

  const sortedSemesters = Array.from(bySemester.keys()).sort((a, b) => a - b);

  for (const sem of sortedSemesters) {
    if (sem === 0) {
      container.appendChild(renderSemesterRow(0, 'Semestre não alocado', bySemester.get(sem)));
      continue;
    }
    const label = `Semestre ${String(sem).padStart(2, '0')}`;
    container.appendChild(renderSemesterRow(sem, label, bySemester.get(sem)));
  }

  if (optativa.length) {
    container.appendChild(renderSemesterRow(null, 'Optativas', optativa));
  }
  if (complementar.length) {
    container.appendChild(renderSemesterRow(null, 'Complementares', complementar));
  }
}
