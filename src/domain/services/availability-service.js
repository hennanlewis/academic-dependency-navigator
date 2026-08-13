// ============================================================
// availability-service.js — Disponibilidade de disciplinas.
// Avalia se uma disciplina pode ser cursada dado o conjunto de
// concluídas, respeitando a árvore AND/OR de pré-requisitos, e
// calcula o conjunto de disciplinas disponíveis agora.
// Fase 4.
// ============================================================

export const AvailabilityService = {
  /**
   * Uma disciplina pode ser cursada dado o conjunto de concluídas?
   * Avalia a árvore AND/OR corretamente (ex.: (A AND B) OR C fica
   * disponível se A e B concluídas, ou C concluída).
   * @param {import('../graph.js').CurriculumGraph} graph
   * @param {string} id
   * @param {Set<string>} completed ids concluídas
   * @returns {boolean}
   */
  canTake(graph, id, completed) {
    return graph.canTake(id, completed);
  },

  /**
   * Todas as disciplinas que podem ser cursadas agora (não concluídas)
   * dado o conjunto de concluídas.
   * @param {import('../graph.js').CurriculumGraph} graph
   * @param {Set<string>} completed ids concluídas
   * @returns {string[]}
   */
  available(graph, completed) {
    return graph.available(completed);
  },
};