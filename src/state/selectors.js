// ============================================================
// selectors.js — Derivação pura a partir do estado central.
// A partir do `selected` e do grafo, calcula o conjunto de
// destaques (pré-requisitos e liberadas) e classifica cada cartão.
// Fase 2.
// ============================================================

import { DependencyService } from '../domain/services/dependency-service.js';
import { AvailabilityService } from '../domain/services/availability-service.js';
import { STATUS } from '../domain/status.js';

export const RELATION = {
  NEUTRAL: 'neutral',
  SELECTED: 'selected',
  PREREQUISITE: 'prerequisite',
  UNLOCKS: 'unlocks',
  UNRELATED: 'unrelated',
};

/**
 * Deriva a seleção em três conjuntos: selecionadas, pré-requisitos
 * (diretos e indiretos) e liberadas (cadeia de desbloqueio).
 * @param {import('../domain/graph.js').CurriculumGraph} graph
 * @param {Object} state estado do store
 * @returns {{selected:Set<string>, prerequisites:Set<string>, unlocks:Set<string>}}
 */
export function deriveSelection(graph, state) {
  const selected = new Set(state.selected);
  const prerequisites = new Set();
  const unlocks = new Set();

  for (const id of state.selected) {
    for (const p of DependencyService.getAllPrerequisites(graph, id)) prerequisites.add(p);
    for (const u of DependencyService.getAllDependents(graph, id)) unlocks.add(u);
  }

  // Nenhum cartão pode ser simultaneamente pré-requisito de si mesmo
  // ou da própria seleção; selecionados têm prioridade de exibição.
  for (const s of selected) {
    prerequisites.delete(s);
    unlocks.delete(s);
  }

  return { selected, prerequisites, unlocks };
}

/**
 * Classifica o estado visual de um cartão dado o resultado de
 * `deriveSelection`.
 * @param {string} id id da disciplina
 * @param {Object} sel resultado de deriveSelection
 * @param {boolean} hasSelection há alguma disciplina selecionada?
 * @returns {string} um valor de RELATION
 */
export function classifyCard(id, sel, hasSelection) {
  if (sel.selected.has(id)) return RELATION.SELECTED;
  if (sel.prerequisites.has(id)) return RELATION.PREREQUISITE;
  if (sel.unlocks.has(id)) return RELATION.UNLOCKS;
  return hasSelection ? RELATION.UNRELATED : RELATION.NEUTRAL;
}

/**
 * Conjunto de disciplinas "concluídas" (idade para disponibilidade).
 * @param {Map<string,string>} status status map id -> STATUS
 * @returns {Set<string>}
 */
export function deriveCompleted(status) {
  const completed = new Set();
  for (const [id, st] of status) {
    if (st === STATUS.COMPLETED) completed.add(id);
  }
  return completed;
}

/**
 * Selector de disciplinas disponíveis agora: podem ser cursadas dado
 * o conjunto de disciplinas concluídas (avaliando a árvore AND/OR).
 * @param {import('../domain/graph.js').CurriculumGraph} graph
 * @param {Map<string,string>} status status map id -> STATUS
 * @returns {Set<string>}
 */
export function deriveAvailable(graph, status) {
  return new Set(AvailabilityService.available(graph, deriveCompleted(status)));
}
