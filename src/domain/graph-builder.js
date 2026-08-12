// ============================================================
// graph-builder.js — Constrói o CurriculumGraph a partir do currículo.
// Domínio puro.
// ============================================================

import { CurriculumGraph } from './graph.js';
import { collectDisciplineIds } from './prerequisite.js';

/**
 * Constrói o grafo com índices duplos (outgoing/incoming).
 * @param {Object} curriculum currículo canônico (saída de normalizeCurriculum)
 * @returns {CurriculumGraph}
 */
export function buildGraph(curriculum) {
  const nodes = new Map();
  const outgoingEdges = new Map();
  const incomingEdges = new Map();

  for (const d of curriculum.disciplines) {
    nodes.set(d.id, d);
    outgoingEdges.set(d.id, new Set());
    incomingEdges.set(d.id, new Set());
  }

  for (const d of curriculum.disciplines) {
    const prereqIds = collectDisciplineIds(d.prerequisites);
    for (const pid of prereqIds) {
      if (nodes.has(pid)) {
        outgoingEdges.get(d.id).add(pid);
        incomingEdges.get(pid).add(d.id);
      }
    }
  }

  return new CurriculumGraph(nodes, outgoingEdges, incomingEdges);
}
