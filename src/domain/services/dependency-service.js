import { collectDisciplineIds } from '../prerequisite.js';

export const DependencyService = {
  /**
   * Pré-requisitos diretos (ids das folhas exigidas).
   * @param {import('../graph.js').CurriculumGraph} graph
   * @param {string} id
   * @returns {Set<string>}
   */
  getPrerequisites(graph, id) {
    return graph.getPrerequisites(id);
  },

  /**
   * Folhas da árvore de requisitos (respeitando AND/OR).
   * @param {import('../graph.js').CurriculumGraph} graph
   * @param {string} id
   * @returns {Set<string>}
   */
  getRequirementLeaves(graph, id) {
    return collectDisciplineIds(graph.getRequirementTree(id));
  },

  /**
   * Todos os pré-requisitos diretos e indiretos (cadeia reversa).
   * @param {import('../graph.js').CurriculumGraph} graph
   * @param {string} id
   * @returns {Set<string>}
   */
  getAllPrerequisites(graph, id) {
    return graph.getAllPrerequisites(id);
  },

  /**
   * Dependentes diretos (quem exige id imediatamente).
   * @param {import('../graph.js').CurriculumGraph} graph
   * @param {string} id
   * @returns {Set<string>}
   */
  getDependents(graph, id) {
    return graph.getDependents(id);
  },

  /**
   * Todos os dependentes diretos e indiretos (cadeia de liberação).
   * @param {import('../graph.js').CurriculumGraph} graph
   * @param {string} id
   * @returns {Set<string>}
   */
  getAllDependents(graph, id) {
    return graph.getAllDependents(id);
  },

  /**
   * Uma disciplina é considerada "liberada" (pode ser cursada) dado
   * o conjunto de concluídas? Avalia a árvore AND/OR corretamente.
   * @param {import('../graph.js').CurriculumGraph} graph
   * @param {string} id
   * @param {Set<string>} completed ids concluídas
   * @returns {boolean}
   */
  canTake(graph, id, completed) {
    return graph.canTake(id, completed);
  },
};
