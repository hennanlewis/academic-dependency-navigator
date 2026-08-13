
const STORAGE_KEY = 'adn.state.v1';

/**
 * Serializa o estado para um objeto JSON serializável.
 * @param {Object} state estado do store
 * @returns {Object}
 */
export function serializeState(state) {
  return {
    version: 1,
    selected: Array.from(state.selected),
    status: Object.fromEntries(state.status),
  };
}

/**
 * Salva o estado no localStorage.
 * @param {Object} state estado do store
 */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(state)));
  } catch (err) {
    console.warn('Falha ao salvar estado:', err);
  }
}

/**
 * Restaura o estado a partir do localStorage.
 * @returns {Object|null} fatias restauradas ou null se nada salvo
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      const status = new Map();
      if (data.status && typeof data.status === 'object') {
        const allowed = new Set(['completed', 'current', 'failed']);
        for (const [id, value] of Object.entries(data.status)) {
          if (allowed.has(value)) status.set(id, value);
        }
      }
      return {
        selected: new Set(Array.isArray(data.selected) ? data.selected : []),
        status,
      };
    }
    return null;
  } catch (err) {
    console.warn('Falha ao restaurar estado:', err);
    return null;
  }
}

/**
 * Limpa o estado salvo no localStorage.
 */
export function clearSavedState() {
  localStorage.removeItem(STORAGE_KEY);
}
