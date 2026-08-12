// ============================================================
// prerequisite.js — Avaliação da árvore de pré-requisitos.
// Modelo de requisito é uma árvore com operadores AND/OR.
// Domínio puro.
// ============================================================

import { NODE_TYPE, OPERATOR } from './models.js';

/**
 * Coleta todos os ids de disciplinas folha referenciados na árvore.
 * @param {Object} node
 * @param {Set<string>} [out]
 * @returns {Set<string>}
 */
export function collectDisciplineIds(node, out = new Set()) {
  if (!node) return out;
  if (node.type === NODE_TYPE.DISCIPLINE) {
    if (node.disciplineId) out.add(node.disciplineId);
    return out;
  }
  if (node.type === NODE_TYPE.GROUP && Array.isArray(node.items)) {
    for (const item of node.items) collectDisciplineIds(item, out);
  }
  return out;
}

/**
 * Avalia se uma árvore de requisitos está satisfeita.
 * AND: todos os itens satisfeitos. OR: ao menos um.
 * @param {Object} node
 * @param {(disciplineId:string)=>boolean} isMet
 * @returns {boolean}
 */
export function evaluateRequirement(node, isMet) {
  if (!node) return true;
  if (node.type === NODE_TYPE.DISCIPLINE) {
    return isMet(node.disciplineId);
  }
  if (node.type === NODE_TYPE.GROUP) {
    const items = node.items || [];
    if (items.length === 0) return true;
    if (node.operator === OPERATOR.OR) {
      return items.some((item) => evaluateRequirement(item, isMet));
    }
    return items.every((item) => evaluateRequirement(item, isMet));
  }
  return true;
}

/**
 * Conta quantas folhas existem na árvore (para progresso de requisitos).
 * @param {Object} node
 * @returns {number}
 */
export function countLeaves(node) {
  if (!node) return 0;
  if (node.type === NODE_TYPE.DISCIPLINE) return 1;
  if (node.type === NODE_TYPE.GROUP) {
    return (node.items || []).reduce((acc, item) => acc + countLeaves(item), 0);
  }
  return 0;
}
