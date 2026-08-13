import { STATUS } from '../domain/status.js';

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

      if (status === STATUS.CURRENT && graph) {
        for (const pre of graph.getAllPrerequisites(id)) {
          if (!state.status.has(pre)) state.status.set(pre, STATUS.COMPLETED);
        }
      }

      emit();
    },
  };
}
