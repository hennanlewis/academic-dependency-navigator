// ============================================================
// graph.js — Grafo do currículo com índices duplos.
// outgoingEdges: X exige quem (pré-requisitos diretos).
// incomingEdges: quem exige X (dependentes diretos).
// Domínio puro.
// ============================================================

import { evaluateRequirement, collectDisciplineIds } from './prerequisite.js';

export class CurriculumGraph {
  /**
   * @param {Map<string,object>} nodes id -> disciplina canônica
   * @param {Map<string,Set<string>>} outgoingEdges id -> pré-requisitos diretos
   * @param {Map<string,Set<string>>} incomingEdges id -> dependentes diretos
   */
  constructor(nodes, outgoingEdges, incomingEdges) {
    this.nodes = nodes;
    this.outgoingEdges = outgoingEdges;
    this.incomingEdges = incomingEdges;
  }

  get size() {
    return this.nodes.size;
  }

  get ids() {
    return Array.from(this.nodes.keys());
  }

  hasDiscipline(id) {
    return this.nodes.has(id);
  }

  getDiscipline(id) {
    return this.nodes.get(id) ?? null;
  }

  /**
   * Pré-requisitos diretos (ids das folhas exigidas).
   * @param {string} id
   * @returns {Set<string>}
   */
  getPrerequisites(id) {
    return this.outgoingEdges.get(id) ?? new Set();
  }

  /**
   * Dependentes diretos (quem exige id).
   * @param {string} id
   * @returns {Set<string>}
   */
  getDependents(id) {
    return this.incomingEdges.get(id) ?? new Set();
  }

  /** Árvore de requisitos da disciplina. */
  getRequirementTree(id) {
    const d = this.nodes.get(id);
    return d ? d.prerequisites : null;
  }

  /**
   * Todos os pré-requisitos diretos e indiretos (fecho transitivo reverso).
   * @param {string} id
   * @returns {Set<string>}
   */
  getAllPrerequisites(id) {
    const visited = new Set();
    const stack = [id];
    while (stack.length) {
      const current = stack.pop();
      const prereqs = this.outgoingEdges.get(current);
      if (prereqs) {
        for (const p of prereqs) {
          if (!visited.has(p)) {
            visited.add(p);
            stack.push(p);
          }
        }
      }
    }
    visited.delete(id);
    return visited;
  }

  /**
   * Todos os dependentes diretos e indiretos (cadeia de desbloqueio).
   * @param {string} id
   * @returns {Set<string>}
   */
  getAllDependents(id) {
    const visited = new Set();
    const stack = [id];
    while (stack.length) {
      const current = stack.pop();
      const dependents = this.incomingEdges.get(current);
      if (dependents) {
        for (const dep of dependents) {
          if (!visited.has(dep)) {
            visited.add(dep);
            stack.push(dep);
          }
        }
      }
    }
    visited.delete(id);
    return visited;
  }

  /**
   * A disciplina pode ser cursada dado o conjunto de concluídas?
   * @param {string} id
   * @param {Set<string>} completed ids concluídas
   * @returns {boolean}
   */
  canTake(id, completed) {
    const tree = this.getRequirementTree(id);
    if (!tree) return true;
    return evaluateRequirement(tree, (pid) => completed.has(pid));
  }

  /**
   * Todas as disciplinas disponíveis para cursar agora.
   * @param {Set<string>} completed
   * @returns {string[]}
   */
  available(completed) {
    const out = [];
    for (const id of this.ids) {
      if (completed.has(id)) continue;
      if (this.canTake(id, completed)) out.push(id);
    }
    return out;
  }

  /**
   * Pré-requisitos diretos como árvore (para exibição).
   * @param {string} id
   * @returns {Array<object>} folhas como objetos {id, name}
   */
  getPrerequisiteDisciplines(id) {
    const ids = collectDisciplineIds(this.getRequirementTree(id));
    return Array.from(ids).map((pid) => ({ id: pid, name: this.getDiscipline(pid)?.name ?? pid }));
  }
}
