import { STATUS } from '../domain/status.js';
import { nextAttemptNumber, attemptId } from '../domain/services/attempt-service.js';

const initialState = () => ({
  selected: new Set(),
  status: new Map(),
  attempts: [],
  semesterOverrides: new Map(),
});

/**
 * Cria o store central com assinatura para notificação.
 * @param {Object} [initial] fatias iniciais opcionais (ex.: seleção/status restaurados)
 * @param {Set<string>} [initial.selected]
 * @param {Map<string,string>} [initial.status]
 * @returns {Object} API do store
 */
export function createStore(initial = {}) {
  const state = initialState();
  if (initial.selected instanceof Set) state.selected = new Set(initial.selected);
  if (initial.status instanceof Map) state.status = new Map(initial.status);
  if (initial.semesterOverrides instanceof Map) state.semesterOverrides = new Map(initial.semesterOverrides);
  if (Array.isArray(initial.attempts)) state.attempts = initial.attempts.slice();
  const listeners = new Set();

  const emit = () => {
    for (const fn of listeners) fn(state);
  };

  return {
    getState: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    // ---- seleção (Fase 2) ----
    isSelected(id) {
      return state.selected.has(id);
    },
    toggleSelect(id) {
      if (state.selected.has(id)) {
        state.selected.delete(id);
      } else {
        state.selected.add(id);
      }
      emit();
    },
    setSelection(ids) {
      state.selected = new Set(ids);
      emit();
    },
    clearSelection() {
      if (state.selected.size === 0) return;
      state.selected.clear();
      emit();
    },

    // ---- status acadêmico (Fase 3) ----
    getStatus(id) {
      return state.status.get(id) ?? null;
    },
    /**
     * Define o status de uma disciplina.
     * Marcar como CURRENT auto-completa os pré-requisitos diretos e
     * indiretos (Aprovada). Para desmarcar, use STATUS.NONE.
     * @param {string} id
     * @param {string|null} status um valor de STATUS
     * @param {import('../domain/graph.js').CurriculumGraph} [graph]
     */
    setStatus(id, status, graph) {
      if (status === STATUS.NONE || status === undefined || status === null) {
        state.status.delete(id);
      } else {
        state.status.set(id, status);
      }

      // Aprovar o original remove suas tentativas (cópias): não faz sentido
      // manter a reprovação "refeita" quando a disciplina original passou.
      if (status === STATUS.COMPLETED) {
        const copies = state.attempts
          .filter((a) => a.originalId === id)
          .map((a) => a.id);
        if (copies.length) {
          state.attempts = state.attempts.filter((a) => a.originalId !== id);
          for (const cid of copies) {
            state.status.delete(cid);
            state.semesterOverrides.delete(cid);
            state.selected.delete(cid);
          }
        }
      }

      if (status === STATUS.CURRENT && graph) {
        for (const pre of graph.getAllPrerequisites(id)) {
          if (!state.status.has(pre)) state.status.set(pre, STATUS.COMPLETED);
        }
      }

      emit();
    },

    // ---- mover de semestre (Fase 5) ----
    getSemesterOverride(id) {
      return state.semesterOverrides.get(id) ?? null;
    },
    /**
     * Move uma disciplina para outro semestre (override).
     * @param {string} id
     * @param {number} semester novo semestre (>= 1)
     */
    setSemesterOverride(id, semester) {
      state.semesterOverrides.set(id, semester);
      emit();
    },
    /**
     * Remove o override de semestre da disciplina (volta ao recomendado).
     * @param {string} id
     */
    clearSemesterOverride(id) {
      if (state.semesterOverrides.has(id)) {
        state.semesterOverrides.delete(id);
        emit();
      }
    },

    // ---- novas tentativas (Fase 6) ----
    /**
     * Dados de uma tentativa (cópia de reprovação).
     * @param {string} id id da disciplina (original ou cópia)
     * @returns {Object|null} tentativa ou null se não for uma cópia
     */
    getAttempt(id) {
      if (typeof id !== 'string') return null;
      return state.attempts.find((a) => a.id === id) ?? null;
    },
    /**
     * O id original de uma cópia de tentativa.
     * @param {string} id id da disciplina
     * @returns {string|null} originalId ou null se não for uma cópia
     */
    getOriginalId(id) {
      if (typeof id !== 'string') return null;
      const a = state.attempts.find((item) => item.id === id);
      return a ? a.originalId : null;
    },
    /**
     * Cria uma nova tentativa (cópia) da disciplina no semestre escolhido.
     * A cópia é um nó real do grafo (via applyAttempts) e ganha seu próprio
     * id (originalId-T{n}); status e overrides usam esse id, unificando o
     * modelo — não há lista de status separada para tentativas.
     * @param {string} originalId id da disciplina original
     * @param {number} semester semestre da nova tentativa
     * @returns {Object|null} a tentativa criada (ou null se inválida)
     */
    createAttempt(originalId, semester) {
      if (typeof originalId !== 'string' || !Number.isInteger(semester) || semester < 1) return null;
      const attempt = nextAttemptNumber(state.attempts, originalId);
      const id = attemptId(originalId, attempt);
      state.attempts = state.attempts.concat([{ id, originalId, attempt, semester }]);
      emit();
      return state.attempts[state.attempts.length - 1];
    },
    /**
     * Remove uma tentativa (cópia) e limpa o estado associado a ela.
     * @param {string} attemptId id da cópia
     */
    removeAttempt(attemptId) {
      const has = state.attempts.some((a) => a.id === attemptId);
      if (!has) return;
      state.attempts = state.attempts.filter((a) => a.id !== attemptId);
      state.status.delete(attemptId);
      state.semesterOverrides.delete(attemptId);
      state.selected.delete(attemptId);
      emit();
    },
  };
}
