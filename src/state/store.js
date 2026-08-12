// ============================================================
// store.js — Estado central da aplicação.
// Fase 2: gerencia a seleção (multi-seleção). As demais fatias
// (status, attempts, semesterOverrides) são declaradas aqui como
// base para as Fases seguintes, mas ainda não recebem ações.
// ============================================================

const initialState = () => ({
  selected: new Set(),
  status: new Map(),
  attempts: [],
  semesterOverrides: new Map(),
});

/**
 * Cria o store central com assinatura para notificação.
 * @param {Object} [initial] fatias iniciais opcionais (ex.: seleção restaurada)
 * @param {Set<string>} [initial.selected]
 * @returns {Object} API do store
 */
export function createStore(initial = {}) {
  const state = initialState();
  if (initial.selected instanceof Set) state.selected = new Set(initial.selected);
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
  };
}
