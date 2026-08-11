import { NODE_TYPE } from '../models.js';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} errors
 * @property {string[]} warnings
 */

function result() {
  return { valid: true, errors: [], warnings: [] };
}

/**
 * Percorre a árvore de requisitos coletando ids de disciplinas referenciadas.
 * @param {Object} node
 * @param {string[]} out
 */
function collectReferencedIds(node, out) {
  if (!node) return;
  if (node.type === NODE_TYPE.DISCIPLINE) {
    if (node.disciplineId) out.push(node.disciplineId);
    return;
  }

  if (node.type === NODE_TYPE.GROUP && Array.isArray(node.items)) {
    for (const item of node.items) collectReferencedIds(item, out);
  }
}

/**
 * Valida o currículo normalizado.
 * @param {Object} curriculum currículo canônico (saída de normalizeCurriculum)
 * @returns {ValidationResult}
 */
export function validateCurriculum(curriculum) {
  const r = result();
  if (!curriculum || !Array.isArray(curriculum.disciplines)) {
    r.valid = false;
    r.errors.push('Currículo inválido: sem lista de disciplinas.');
    return r;
  }

  const ids = new Set();
  const idSet = new Map();

  for (const d of curriculum.disciplines) {
    if (!d || typeof d.id !== 'string' || d.id.trim() === '') {
      r.valid = false;
      r.errors.push('Disciplina sem "id" válido.');
      continue;
    }

    if (ids.has(d.id)) {
      r.valid = false;
      r.errors.push(`Id duplicado: "${d.id}".`);
    }

    ids.add(d.id);
    idSet.set(d.id, d);
  }

  for (const d of curriculum.disciplines) {
    if (!d) continue;
    const refs = [];
    collectReferencedIds(d.prerequisites, refs);

    for (const ref of refs) {
      if (!ids.has(ref)) {
        r.valid = false;
        r.errors.push(`Disciplina "${d.id}" referencia pré-requisito inexistente "${ref}".`);
      }
    }
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  for (const id of ids) color.set(id, WHITE);

  const stack = [];
  const dfs = (id, trail) => {
    color.set(id, GRAY);
    trail.push(id);
    const d = idSet.get(id);

    if (d) {
      const refs = [];
      collectReferencedIds(d.prerequisites, refs);

      for (const ref of refs) {
        if (color.get(ref) === WHITE) {
          if (dfs(ref, trail)) return true;
        } else if (color.get(ref) === GRAY) {
          const cycle = trail.slice(trail.indexOf(ref)).concat(ref);
          r.valid = false;
          r.errors.push(`Ciclo detectado: ${cycle.join(' -> ')}.`);

          return true;
        }
      }
    }

    trail.pop();
    color.set(id, BLACK);

    return false;
  };

  for (const id of ids) {
    if (color.get(id) === WHITE) dfs(id, []);
  }

  if (curriculum.total_disciplines !== curriculum.disciplines.length) {
    r.warnings.push(
      `total_disciplines (${curriculum.total_disciplines}) difere do número real (${curriculum.disciplines.length}).`
    );
  }

  if (r.errors.length > 0) r.valid = false;
  return r;
}
