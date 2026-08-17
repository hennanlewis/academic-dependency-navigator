
const STORAGE_KEY = 'adn.state.v1';
const PLANS_KEY = 'adn.plans.list';
const PLAN_PREFIX = 'adn.plan.';

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
    semesterOverrides: Object.fromEntries(state.semesterOverrides),
    attempts: Array.isArray(state.attempts) ? state.attempts.map((a) => ({ ...a })) : [],
  };
}

/**
 * Serializa o estado para um objeto JSON serializável e baixa como `.json`.
 * @param {Object} state estado do store
 * @param {string} [filename] nome do arquivo
 * @returns {string} o JSON gerado
 */
export function exportPlan(state, filename = `plano-${new Date().toISOString().slice(0, 10)}.json`) {
  const json = JSON.stringify(serializeState(state), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return json;
}

/**
 * Faz o parse e a validação de um plano importado (string JSON).
 * @param {string} json conteúdo do arquivo
 * @returns {Object|null} fatias restauradas (formato de `loadState`) ou null se inválido
 */
export function importPlan(json) {
  try {
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object') return null;
    return parseStatePayload(data);
  } catch (err) {
    console.warn('Falha ao importar plano:', err);
    return null;
  }
}

/** Aplica as regras de sanear/quarentenar um payload de estado. */
function parseStatePayload(data) {
  const status = new Map();
  if (data.status && typeof data.status === 'object') {
    const allowed = new Set(['completed', 'current', 'failed']);
    for (const [id, value] of Object.entries(data.status)) {
      if (allowed.has(value)) status.set(id, value);
    }
  }
  const semesterOverrides = new Map();
  if (data.semesterOverrides && typeof data.semesterOverrides === 'object') {
    for (const [id, value] of Object.entries(data.semesterOverrides)) {
      const num = Number(value);
      if (Number.isInteger(num) && num > 0) semesterOverrides.set(id, num);
    }
  }
  const attempts = Array.isArray(data.attempts)
    ? data.attempts
        .filter(
          (a) =>
            a &&
            typeof a.id === 'string' &&
            typeof a.originalId === 'string' &&
            Number.isInteger(a.attempt) &&
            Number.isInteger(a.semester)
        )
        .map((a) => ({ id: a.id, originalId: a.originalId, attempt: a.attempt, semester: a.semester }))
    : [];
  return {
    selected: new Set(Array.isArray(data.selected) ? data.selected : []),
    status,
    semesterOverrides,
    attempts,
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
      return parseStatePayload(data);
    }
    return null;
  } catch (err) {
    console.warn('Falha ao restaurar estado:', err);
    return null;
  }
}

// ---- Múltiplos planos (Fase 8) ----
/**
 * Lista os nomes dos planos salvos.
 * @returns {string[]}
 */
export function listPlans() {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === 'string') : [];
  } catch (err) {
    console.warn('Falha ao listar planos:', err);
    return [];
  }
}

/**
 * Salva/atualiza um plano nomeado a partir do estado atual.
 * @param {Object} state estado do store
 * @param {string} name nome do plano
 */
export function savePlan(state, name) {
  if (!name || typeof name !== 'string') return;
  const nameKey = name.trim();
  if (!nameKey) return;
  try {
    const data = serializeState(state);
    data.planName = nameKey;
    localStorage.setItem(PLAN_PREFIX + nameKey, JSON.stringify(data));
    const list = listPlans();
    if (!list.includes(nameKey)) list.push(nameKey);
    localStorage.setItem(PLANS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Falha ao salvar plano:', err);
  }
}

/**
 * Carrega um plano nomeado.
 * @param {string} name nome do plano
 * @returns {Object|null} fatias restauradas ou null se não existir
 */
export function loadPlan(name) {
  try {
    const raw = localStorage.getItem(PLAN_PREFIX + name);
    if (!raw) return null;
    return parseStatePayload(JSON.parse(raw));
  } catch (err) {
    console.warn('Falha ao carregar plano:', err);
    return null;
  }
}

/**
 * Remove um plano nomeado.
 * @param {string} name nome do plano
 */
export function deletePlan(name) {
  try {
    localStorage.removeItem(PLAN_PREFIX + name);
    localStorage.setItem(PLANS_KEY, JSON.stringify(listPlans().filter((n) => n !== name)));
  } catch (err) {
    console.warn('Falha ao remover plano:', err);
  }
}

/**
 * Limpa o estado salvo (esquema principal) no localStorage.
 */
export function clearSavedState() {
  localStorage.removeItem(STORAGE_KEY);
}
