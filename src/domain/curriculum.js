import { NODE_TYPE, OPERATOR, emptyRequirement, groupNode, disciplineNode, normalizeType } from './models.js';

const ROMAN_TO_NUM = {
  I: 1, II: 2, III: 3, IV: 4, V: 5,
  VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
};

/**
 * Converte um semestre em algarismos romanos (ou "OP"/"Não se aplica")
 * para número. Retorna null quando não há semestre aplicável.
 * @param {*} value
 * @returns {number|null}
 */
export function romanToSemester(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const v = value.trim().toUpperCase();

  if (v === 'OP' || v === 'OPCIONAL' || v === 'NÃO SE APLICA' || v === 'NAO SE APLICA' || v === 'N/A') return null;

  return ROMAN_TO_NUM[v] ?? null;
}

/**
 * Reconstrói uma árvore de requisitos a partir de uma string textual.
 * Ex.: "Fonética e Fonologia do Português ou Teoria da Literatura"
 * Aplica AND (item único ou "e") e OR ("ou") entre nomes de disciplinas.
 * Nota: como o texto vem por NOME e não por id, este passo depende de
 * resolução posterior (resolveTextPrerequisites). Aqui apenas tokenizamos.
 * @param {string} text
 * @returns {Array<{name:string}>} lista de nomes (agrupamento simplificado)
 */
export function tokenizePrerequisiteText(text) {
  if (typeof text !== 'string' || !text.trim()) return [];

  const tokens = [];
  const orGroups = text.split(/\s+ou\s+/i);

  for (const orGroup of orGroups) {
    const andNames = orGroup.split(/\s+e\s+/i).map((s) => s.trim()).filter(Boolean);
    if (andNames.length === 0) continue;

    if (andNames.length === 1) {
      tokens.push({ operator: OPERATOR.AND, names: [andNames[0]] });
    } else {
      tokens.push({ operator: OPERATOR.AND, names: andNames });
    }
  }

  return tokens;
}

/**
 * Resolve pré-requisitos expressos como nomes para ids, dado o índice
 * name -> id. Usado quando o arquivo traz pré-requisitos por nome.
 * @param {string|Array|Object} prereq dados de pré-requisito
 * @param {Map<string,string>} nameToId mapa nome->id
 * @returns {Object} árvore canônica
 */
export function resolvePrerequisites(prereq, nameToId) {
  if (prereq && typeof prereq === 'object' && prereq.type === NODE_TYPE.GROUP) {
    return prereq;
  }

  if (Array.isArray(prereq)) {
    const items = [];

    for (const item of prereq) {
      if (typeof item === 'string') {
        const id = nameToId.get(item) || item;
        items.push(disciplineNode(id));
      } else if (item && typeof item === 'object') {
        items.push(resolvePrerequisites(item, nameToId));
      }
    }

    return groupNode(OPERATOR.AND, items);
  }

  if (prereq && typeof prereq === 'object' && Array.isArray(prereq.items)) {
    const op = (prereq.operator || OPERATOR.AND).toUpperCase() === OPERATOR.OR ? OPERATOR.OR : OPERATOR.AND;
    const items = prereq.items.map((it) =>
      typeof it === 'string' ? disciplineNode(nameToId.get(it) || it) : resolvePrerequisites(it, nameToId)
    );

    return groupNode(op, items);
  }

  if (typeof prereq === 'string') {
    const tokens = tokenizePrerequisiteText(prereq);
    const groups = tokens.map((t) => groupNode(OPERATOR.AND, t.names.map((n) => disciplineNode(nameToId.get(n) || n))));

    if (groups.length === 0) return emptyRequirement();
    if (groups.length === 1) return groups[0];

    return groupNode(OPERATOR.OR, groups);
  }

  return emptyRequirement();
}

/**
 * Lê um campo com possíveis variações de nome (camelCase/snake_case).
 * @param {Object} obj
 * @param {string[]} keys
 * @returns {*} primeiro valor presente
 */
function pick(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined) return obj[k];
  }

  return undefined;
}

/**
 * Normaliza uma única disciplina para o formato canônico.
 * @param {Object} raw
 * @param {Map<string,string>} nameToId
 * @returns {Object} disciplina canônica
 */
export function normalizeDiscipline(raw, nameToId) {
  const workloadUnit = pick(raw, ['workload_unit', 'workloadUnit']) || 'h';
  const offering = raw.offering || {};
  const frequency = (pick(offering, ['frequency']) || 'annual').toLowerCase();
  const sem = pick(raw, ['recommendedSemester', 'semester', 'semestre']);

  const prereqRaw = pick(raw, ['prerequisites', 'preRequisitos', 'requisitos']);
  const prerequisites = resolvePrerequisites(prereqRaw, nameToId);

  return {
    id: raw.id,
    code: raw.code ?? '',
    name: raw.name,
    type: normalizeType(pick(raw, ['type'])) || 'Obrigatória',
    level: raw.level ?? 'Superior',
    recommendedSemester: romanToSemester(sem),
    offering: {
      frequency: frequency === 'anual' || frequency === 'annual' ? 'annual' : frequency,
      periods: Array.isArray(offering.periods) ? offering.periods : [1],
    },
    workload: Number(raw.workload) || 0,
    workload_unit: workloadUnit,
    ch_teorica: Number(pick(raw, ['ch_teorica', 'chTeorica'])) || 0,
    ch_pratica: Number(pick(raw, ['ch_pratica', 'chPratica'])) || 0,
    ch_pcc: Number(pick(raw, ['ch_pcc', 'chPcc', 'chPCC'])) || 0,
    credits: Number(pick(raw, ['credits', 'creditos'])) || 0,
    ementa: raw.ementa ?? '',
    objectives: Array.isArray(raw.objectives) ? raw.objectives : [],
    program: Array.isArray(raw.program) ? raw.program : [],
    methodology: raw.methodology ?? '',
    assessment: raw.assessment ?? '',
    bibliografia_basica: Array.isArray(raw.bibliografia_basica) ? raw.bibliografia_basica : [],
    bibliografia_complementar: Array.isArray(raw.bibliografia_complementar) ? raw.bibliografia_complementar : [],
    prerequisites,
  };
}

/**
 * Normaliza um currículo completo (aceita variações de formato).
 * @param {Object} raw
 * @param {Object} [metaOverride] metadados do curso (curso, instituicao, versao)
 * @returns {{total_disciplines:number, disciplines:Array, meta:Object}}
 */
export function normalizeCurriculum(raw, metaOverride = {}) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Dados de currículo inválidos: esperado objeto.');
  }

  const rawList = Array.isArray(raw.disciplines) ? raw.disciplines : raw.disciplinas;

  if (!Array.isArray(rawList)) {
    throw new Error('Currículo inválido: campo "disciplines" ausente.');
  }

  const nameToId = new Map();

  for (const d of rawList) {
    if (d && d.name) nameToId.set(d.name.trim().toLowerCase(), d.id);
  }

  const disciplines = rawList.map((d) => normalizeDiscipline(d, nameToId));

  const meta = {
    curso: raw.curso || raw.course || metaOverride.curso || 'Curso',
    instituicao: raw.instituicao || raw.institution || metaOverride.instituicao || '',
    versao: raw.versao || raw.version || metaOverride.versao || '',
  };

  return {
    total_disciplines: Number(raw.total_disciplines) || disciplines.length,
    disciplines,
    meta,
  };
}
