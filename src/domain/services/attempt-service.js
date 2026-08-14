// ============================================================
// attempt-service.js — Novas tentativas (reprovação) como nós
// reais do grafo, ligadas ao `originalId`.
// Um "attempt" gera uma cópia da disciplina que participa do
// currículo/grafo normalmente (seleção, status, mover de semestre,
// disponibilidade). Domínio puro.
// Fase 6.
// ============================================================

/**
 * Próximo número de tentativa para uma disciplina original.
 * @param {Array<{originalId:string, attempt:number}>} attempts
 * @param {string} originalId
 * @returns {number}
 */
export function nextAttemptNumber(attempts, originalId) {
  const nums = attempts
    .filter((a) => a.originalId === originalId)
    .map((a) => a.attempt);
  return nums.length ? Math.max(...nums) + 1 : 1;
}

/**
 * Compõe o id de uma tentativa.
 * @param {string} originalId
 * @param {number} attempt
 * @returns {string}
 */
export function attemptId(originalId, attempt) {
  return `${originalId}-T${attempt}`;
}

/**
 * Aplica a lista de tentativas sobre o currículo, retornando um novo
 * currículo com as cópias adicionadas como nós reais. Cada cópia herda
 * os dados do original (incluindo pré-requisitos), marcada com `attempt`
 * e `originalId`, e alocada no semestre escolhido.
 * @param {Object} curriculum currículo canônico base
 * @param {Array<{id:string, originalId:string, attempt:number, semester:number}>} attempts
 * @returns {Object} novo currículo (com cópias)
 */
export function applyAttempts(curriculum, attempts) {
  const byId = new Map(curriculum.disciplines.map((d) => [d.id, d]));
  const disciplines = curriculum.disciplines.slice();

  for (const a of attempts) {
    if (!a || typeof a.id !== 'string') continue;
    if (byId.has(a.id)) continue;

    const original = byId.get(a.originalId);
    if (!original) continue;

    const copy = {
      ...original,
      id: a.id,
      originalId: a.originalId,
      attempt: a.attempt,
      recommendedSemester: a.semester,
    };
    disciplines.push(copy);
    byId.set(a.id, copy);
  }

  return {
    ...curriculum,
    total_disciplines: disciplines.length,
    disciplines,
  };
}