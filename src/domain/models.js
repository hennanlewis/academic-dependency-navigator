export const NODE_TYPE = {
  DISCIPLINE: 'discipline',
  GROUP: 'group',
};

export const OPERATOR = {
  AND: 'AND',
  OR: 'OR',
};

/**
 * Cria um nó de disciplina.
 * @param {string} disciplineId
 * @returns {{type: 'discipline', disciplineId: string}}
 */
export function disciplineNode(disciplineId) {
  return { type: NODE_TYPE.DISCIPLINE, disciplineId };
}

/**
 * Cria um nó de grupo.
 * @param {'AND'|'OR'} operator
 * @param {Array} items
 * @returns {{type: 'group', operator, items}}
 */
export function groupNode(operator = OPERATOR.AND, items = []) {
  return { type: NODE_TYPE.GROUP, operator, items };
}

export function emptyRequirement() {
  return groupNode(OPERATOR.AND, []);
}

/**
 * Valida se um nó de requisito é estruturalmente coerente.
 * @param {*} node
 * @returns {boolean}
 */
export function isValidRequirement(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === NODE_TYPE.DISCIPLINE) {
    return typeof node.disciplineId === 'string' && node.disciplineId.length > 0;
  }
  if (node.type === NODE_TYPE.GROUP) {
    if (node.operator !== OPERATOR.AND && node.operator !== OPERATOR.OR) return false;
    if (!Array.isArray(node.items)) return false;
    return node.items.every(isValidRequirement);
  }
  return false;
}

export const DISCIPLINE_TYPES = ['Obrigatória', 'Optativa', 'Complementar'];

/**
 * Normaliza o campo "type" tolerando variações.
 * @param {*} value
 * @returns {string|null} tipo canônico ou null se desconhecido
 */
export function normalizeType(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  const map = {
    'obrigatória': 'Obrigatória',
    'obrigatoria': 'Obrigatória',
    'obrigatorio': 'Obrigatória',
    'optativa': 'Optativa',
    'optativo': 'Optativa',
    'complementar': 'Complementar',
    'complementar optativa': 'Complementar',
  };
  return map[v.toLowerCase()] ?? null;
}
