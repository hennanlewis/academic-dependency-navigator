// ============================================================
// discipline-editor.js — Editor de disciplina (PUD).
// Validação de rascunhos e aplicação sobre o currículo canônico,
// sempre retornando novos objetos (imutável, como applyAttempts).
// Domínio puro: nada de DOM aqui.
// Fase 10.
// ============================================================

import {
  NODE_TYPE,
  OPERATOR,
  DISCIPLINE_TYPES,
  normalizeType,
  isValidRequirement,
  emptyRequirement,
} from '../models.js';
import { romanToSemester, resolvePrerequisites } from '../curriculum.js';
import { collectDisciplineIds } from '../prerequisite.js';
import { validateCurriculum } from '../validators/curriculum-validator.js';

/**
 * @typedef {Object} DisciplineDraft rascunho vindo do formulário
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string} type
 * @property {string} level
 * @property {number|string|null} semesterInput semestre (número, romano ou vazio)
 * @property {string} frequency 'annual' | 'semestral'
 * @property {number|string} workload
 * @property {string} workload_unit
 * @property {number|string} ch_teorica
 * @property {number|string} ch_pratica
 * @property {number|string} ch_pcc
 * @property {number|string} credits
 * @property {string} ementa
 * @property {string[]} objectives
 * @property {string[]} program
 * @property {string} methodology
 * @property {string} assessment
 * @property {string[]} bibliografia_basica
 * @property {string[]} bibliografia_complementar
 * @property {Object} prerequisites árvore de requisitos canônica
 */

/**
 * Converte um semestre informado (número, romano "I".."X", "OP"/vazio)
 * em número canônico ou null.
 * @param {*} value
 * @returns {number|null}
 */
export function parseSemesterInput(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  return romanToSemester(value);
}

/**
 * Extrai um rascunho editável a partir de uma disciplina canônica.
 * @param {Object} discipline disciplina canônica
 * @returns {DisciplineDraft}
 */
export function buildDraftFromDiscipline(discipline) {
  return {
    id: discipline.id ?? '',
    code: discipline.code ?? '',
    name: discipline.name ?? '',
    type: discipline.type ?? 'Obrigatória',
    level: discipline.level ?? 'Superior',
    semesterInput: discipline.recommendedSemester ?? '',
    frequency: discipline.offering?.frequency ?? 'annual',
    workload: discipline.workload ?? 0,
    workload_unit: discipline.workload_unit ?? 'h',
    ch_teorica: discipline.ch_teorica ?? 0,
    ch_pratica: discipline.ch_pratica ?? 0,
    ch_pcc: discipline.ch_pcc ?? 0,
    credits: discipline.credits ?? 0,
    ementa: discipline.ementa ?? '',
    objectives: Array.isArray(discipline.objectives) ? discipline.objectives.slice() : [],
    program: Array.isArray(discipline.program) ? discipline.program.slice() : [],
    methodology: discipline.methodology ?? '',
    assessment: discipline.assessment ?? '',
    bibliografia_basica: Array.isArray(discipline.bibliografia_basica)
      ? discipline.bibliografia_basica.slice()
      : [],
    bibliografia_complementar: Array.isArray(discipline.bibliografia_complementar)
      ? discipline.bibliografia_complementar.slice()
      : [],
    prerequisites: discipline.prerequisites ?? emptyRequirement(),
  };
}

/** Serializa um nó folha/grupo para texto ("e"/"ou"). */
function serializeNode(node, nameOf) {
  if (!node) return '';
  if (node.type === NODE_TYPE.DISCIPLINE) {
    const label = nameOf(node.disciplineId);
    return typeof label === 'string' && label ? label : node.disciplineId;
  }
  if (node.type === NODE_TYPE.GROUP && Array.isArray(node.items)) {
    const joiner = node.operator === OPERATOR.OR ? ' ou ' : ' e ';
    return node.items.map((it) => serializeNode(it, nameOf)).join(joiner);
  }
  return '';
}

/**
 * Serializa a árvore de requisitos para texto legível (uma alternativa
 * OR por linha; itens de um mesmo grupo AND unidos por " e ").
 * @param {Object} tree árvore canônica
 * @param {(id:string)=>string} [nameOf] resolve id -> nome exibido
 * @returns {string}
 */
export function requirementTreeToText(tree, nameOf = (id) => id) {
  if (!tree) return '';
  if (tree.type === NODE_TYPE.GROUP && tree.operator === OPERATOR.OR && Array.isArray(tree.items)) {
    return tree.items.map((branch) => serializeNode(branch, nameOf)).filter(Boolean).join('\n');
  }
  return serializeNode(tree, nameOf);
}

/**
 * Interpreta o texto do formulário como árvore de requisitos.
 * Cada linha é uma alternativa (OR); dentro da linha, "e" agrupa (AND)
 * e "ou" alterna (OR). Tokens são resolvidos por nome (mapa nome->id);
 * tokens não encontrados passam como id.
 * @param {string} text
 * @param {Map<string,string>} nameToId
 * @returns {Object} árvore canônica
 */
export function prerequisitesFromText(text, nameToId) {
  const lines = String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return emptyRequirement();
  return resolvePrerequisites(lines.join(' ou '), nameToId);
}

function toCount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

function toLines(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);
}

/**
 * Converte o rascunho na disciplina canônica (mesma forma da saída de
 * normalizeDiscipline). Não valida — rode validateDisciplineDraft antes.
 * @param {DisciplineDraft} draft
 * @returns {Object}
 */
export function buildDisciplineFromDraft(draft) {
  const offering = draft.offering && typeof draft.offering === 'object' ? draft.offering : {};
  const frequency = String(draft.frequency || offering.frequency || 'annual').toLowerCase();
  return {
    id: String(draft.id ?? '').trim(),
    code: String(draft.code ?? '').trim(),
    name: String(draft.name ?? '').trim(),
    type: normalizeType(draft.type) || 'Obrigatória',
    level: String(draft.level ?? '').trim() || 'Superior',
    recommendedSemester: parseSemesterInput(draft.semesterInput),
    offering: {
      frequency: frequency === 'anual' || frequency === 'annual' ? 'annual' : frequency,
      periods: Array.isArray(offering.periods) ? offering.periods.slice() : [1],
    },
    workload: Number(draft.workload) || 0,
    workload_unit: String(draft.workload_unit ?? 'h').trim() || 'h',
    ch_teorica: Number(draft.ch_teorica) || 0,
    ch_pratica: Number(draft.ch_pratica) || 0,
    ch_pcc: Number(draft.ch_pcc) || 0,
    credits: Number(draft.credits) || 0,
    ementa: String(draft.ementa ?? ''),
    objectives: toLines(draft.objectives),
    program: toLines(draft.program),
    methodology: String(draft.methodology ?? ''),
    assessment: String(draft.assessment ?? ''),
    bibliografia_basica: toLines(draft.bibliografia_basica),
    bibliografia_complementar: toLines(draft.bibliografia_complementar),
    prerequisites: isValidRequirement(draft.prerequisites) ? draft.prerequisites : emptyRequirement(),
  };
}

/**
 * Valida o rascunho de uma disciplina contra o contexto do currículo.
 * @param {DisciplineDraft} draft
 * @param {Object} ctx
 * @param {Set<string>} ctx.knownIds ids válidos para pré-requisitos
 *   (currículo em trabalho, incluindo cópias)
 * @param {Set<string>} ctx.otherIds ids já usados por OUTRAS disciplinas
 *   (sem o id em edição)
 * @returns {{valid:boolean, errors:string[], warnings:string[]}}
 */
export function validateDisciplineDraft(draft, { knownIds, otherIds }) {
  const errors = [];
  const warnings = [];

  // ---- identidade ----
  const id = String(draft.id ?? '').trim();
  if (!id) {
    errors.push('Informe o ID da disciplina.');
  } else if (/\s/.test(id)) {
    errors.push(`O ID "${id}" não pode conter espaços.`);
  } else if (otherIds.has(id)) {
    errors.push(`O ID "${id}" já está em uso por outra disciplina.`);
  }

  const name = String(draft.name ?? '').trim();
  if (!name) errors.push('Informe o nome da disciplina.');

  const type = normalizeType(draft.type);
  if (!type) errors.push(`Tipo inválido: "${draft.type}". Use ${DISCIPLINE_TYPES.join(', ')}.`);

  // ---- carga horária / créditos ----
  for (const [field, label] of [
    ['workload', 'Carga horária total'],
    ['ch_teorica', 'CH teórica'],
    ['ch_pratica', 'CH prática'],
    ['ch_pcc', 'CH PCC'],
    ['credits', 'Créditos'],
  ]) {
    const value = Number(draft[field]);
    if (draft[field] !== '' && draft[field] !== null && draft[field] !== undefined) {
      if (!Number.isFinite(value)) errors.push(`${label}: valor numérico inválido.`);
      else if (value < 0) errors.push(`${label}: não pode ser negativo.`);
      else if (field === 'credits' && !Number.isInteger(value)) warnings.push('Créditos não é inteiro.');
    }
  }

  const sum =
    (Number(draft.ch_teorica) || 0) + (Number(draft.ch_pratica) || 0) + (Number(draft.ch_pcc) || 0);
  const total = Number(draft.workload) || 0;
  if (total > 0 && sum > 0 && sum !== total) {
    warnings.push(
      `A soma das CH desdobradas (${sum}) difere da carga total (${total}).`
    );
  }

  // ---- semestre ----
  const semester = parseSemesterInput(draft.semesterInput);
  const raw = String(draft.semesterInput ?? '').trim();
  if (raw !== '' && raw.toUpperCase() !== 'OP' && semester === null) {
    errors.push(`Semestre inválido: "${raw}". Use 1–N, romano (I–X), "OP" ou vazio.`);
  } else if (semester !== null && (!Number.isInteger(semester) || semester < 1)) {
    errors.push(`Semestre deve ser um número inteiro ≥ 1 (recebido ${semester}).`);
  }

  // ---- pré-requisitos ----
  if (!isValidRequirement(draft.prerequisites)) {
    errors.push('Árvore de pré-requisitos mal formada.');
  } else {
    const refs = collectDisciplineIds(draft.prerequisites);
    for (const ref of refs) {
      if (ref === id) {
        errors.push('A disciplina não pode ser pré-requisito de si mesma.');
      } else if (knownIds && !knownIds.has(ref)) {
        errors.push(`Pré-requisito inexistente: "${ref}".`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Aplica o rascunho sobre o currículo: substitui a disciplina com o
 * mesmo id ou adiciona ao final. Retorna um NOVO currículo.
 * @param {Object} curriculum currículo canônico
 * @param {DisciplineDraft} draft já validado
 * @returns {Object} novo currículo
 */
export function applyDisciplineEdit(curriculum, draft) {
  const discipline = buildDisciplineFromDraft(draft);
  const disciplines = curriculum.disciplines.slice();
  const idx = disciplines.findIndex((d) => d.id === discipline.id);
  if (idx >= 0) disciplines[idx] = discipline;
  else disciplines.push(discipline);

  return {
    ...curriculum,
    total_disciplines: disciplines.length,
    disciplines,
  };
}

/**
 * Validação estrutural completa do currículo resultante de uma edição
 * (referências órfãs, ciclos etc.). Reaproveita o curriculum-validator.
 * @param {Object} curriculum currículo canônico
 * @returns {{valid:boolean, errors:string[], warnings:string[]}}
 */
export function validateEditedCurriculum(curriculum) {
  return validateCurriculum(curriculum);
}

/**
 * Sugere o próximo id livre seguindo o padrão existente (prefixo +
 * numeração zero-à-esquerda, ex.: "D82"). Reutiliza o prefixo mais
 * comum na matriz quando possível.
 * @param {Object} curriculum currículo canônico
 * @returns {string}
 */
export function suggestNewId(curriculum) {
  const taken = new Set(curriculum.disciplines.map((d) => d.id));
  const counts = new Map();
  let bestPrefix = 'D';
  let bestCount = -1;

  for (const id of taken) {
    const match = /^([A-Za-z]+)(\d+)$/.exec(id);
    if (!match) continue;
    const [, prefix] = match;
    const count = (counts.get(prefix) ?? 0) + 1;
    counts.set(prefix, count);
    if (count > bestCount) {
      bestCount = count;
      bestPrefix = prefix;
    }
  }

  let n = 1;
  while (taken.has(`${bestPrefix}${String(n).padStart(2, '0')}`)) n += 1;
  return `${bestPrefix}${String(n).padStart(2, '0')}`;
}
