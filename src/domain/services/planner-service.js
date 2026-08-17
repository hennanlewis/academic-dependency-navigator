// ============================================================
// planner-service.js — Planejamento e projeção de semestres.
// Projeções puras sobre o grafo + estado: semestre atual,
// disciplinas restantes, estimativa de formatura (semestres) e
// carga projetada por semestre. Fase 7.
// ============================================================

import { STATUS } from '../status.js';

/** Id da "chave" de uma disciplina (original para cópias de tentativa). */
function ownerKey(d) {
  return d.originalId || d.id;
}

/**
 * Conjunto de disciplinas concluídas dadas as chaves-donas.
 * @param {import('../graph.js').CurriculumGraph} graph
 * @param {Map<string,string>} status id -> STATUS
 * @returns {Set<string>} ids das disciplinas concluídas
 */
export function completedIds(graph, status) {
  const out = new Set();
  for (const id of graph.ids) {
    if (status.get(id) === STATUS.COMPLETED || status.get(id) === STATUS.CURRENT) out.add(id);
  }
  return out;
}

/**
 * Semestre atual do plano: o maior semestre (recomendado ou override) com
 * alguma atividade (status não-pendente).
 * @param {import('../graph.js').CurriculumGraph} graph
 * @param {Map<string,string>} status id -> STATUS
 * @param {Map<string,number>} [overrides] id -> semestre movido
 * @returns {number}
 */
export function currentSemester(graph, status, overrides = new Map()) {
  let current = 0;
  for (const id of graph.ids) {
    const st = status.get(id);
    if (!st) continue;
    const d = graph.getDiscipline(id);
    const sem =
      Number.isInteger(overrides.get(id) ?? null) && overrides.get(id) > 0
        ? overrides.get(id)
        : d?.recommendedSemester;
    if (typeof sem === 'number' && sem > current) current = sem;
  }
  return current;
}

/**
 * Disciplinas ainda por concluir (não aprovadas/cursando), agregadas por
 * chave-dona, com semestre efetivo (override > recomendado) e carga.
 * @param {import('../graph.js').CurriculumGraph} graph
 * @param {Array<object>} disciplines currículo de trabalho (base + tentativas)
 * @param {Map<string,string>} status id -> STATUS
 * @param {Map<string,number>} [overrides]
 * @returns {{key:string, id:string, name:string, type:string, workload:number, semester:number}[]}
 */
export function remainingDisciplines(graph, disciplines, status, overrides = new Map()) {
  const byKey = new Map();
  const done = completedIds(graph, status);

  for (const d of disciplines) {
    if (done.has(d.id)) continue;
    const key = ownerKey(d);
    if (byKey.has(key)) continue;
    const semester =
      (Number.isInteger(overrides.get(d.id) ?? null) && overrides.get(d.id) > 0)
        ? overrides.get(d.id)
        : d.recommendedSemester ?? 0;
    byKey.set(key, {
      key,
      id: d.id,
      name: d.name,
      type: d.type,
      workload: d.workload || 0,
      semester,
    });
  }
  return Array.from(byKey.values());
}

/**
 * Estimativa de semestres restantes até formar (todas as obrigatórias).
 * Modelagem otimista: a cadeia de pré-requisitos mais longa entre as
 * obrigatórias ainda por concluir dá o número mínimo de semestres (1 →
 * reserva o semestre atual para as já disponíveis).
 *
 * @param {import('../graph.js').CurriculumGraph} graph
 * @param {Array<object>} disciplines currículo de trabalho
 * @param {Map<string,string>} status id -> STATUS
 * @param {Map<string,number>} [overrides]
 * @returns {{current:number, finishAt:number, remainingSemesters:number, obligatoryRemaining:number}}
 */
export function estimateGraduation(graph, disciplines, status, overrides = new Map()) {
  const remaining = remainingDisciplines(graph, disciplines, status, overrides)
    .filter((r) => r.type === 'Obrigatória');
  const cur = currentSemester(graph, status, overrides);

  if (remaining.length === 0) {
    return { current: cur, finishAt: cur, remainingSemesters: 0, obligatoryRemaining: 0 };
  }

  // Longest chain: profundidade via fecho transitivo reverso, sem contar
  // disciplinas já concluídas (elas não exigem mais tempo).
  const done = completedIds(graph, status);
  const memo = new Map();
  const depth = (id) => {
    if (memo.has(id)) return memo.get(id);
    if (done.has(id)) return 0;
    let best = 0;
    for (const pre of graph.getPrerequisites(id)) {
      best = Math.max(best, 1 + depth(pre));
    }
    memo.set(id, best);
    return best;
  };

  // Todos os nós obrigatórios restantes (os ids reais, incluindo cópias).
  const keys = new Set(remaining.map((r) => r.key));
  let longest = 1; // ao menos o semestre atual (+1 reserva)
  for (const d of disciplines) {
    if (!keys.has(ownerKey(d))) continue;
    if (done.has(d.id)) continue;
    longest = Math.max(longest, 1 + depth(d.id));
  }

  return {
    current: cur,
    finishAt: cur > 0 ? cur + longest - 1 : longest,
    remainingSemesters: longest - 1,
    obligatoryRemaining: remaining.length,
  };
}

/**
 * Distribuição de carga horária por semestre do currículo **completo**
 * (independente de status), de S1 até o semestre máximo, **sem** o semestre 0
 * (optativas não alocadas). Cada linha mostra as disciplinas do semestre e sua
 * carga total; a porcentagem de cada semestre é a parcela sobre a carga-alvo
 * (`targetLoad`, ex.: 4000h), não sobre a soma das pendentes. Cópias de
 * tentativa são agregadas pela chave-dona e o default de semestre respeita
 * overrides. Além das linhas, retorna `total`, `totalDisciplines` e
 * `totalPct` (percentual do currículo sobre a carga-alvo).
 * @param {import('../graph.js').CurriculumGraph} graph
 * @param {Array<object>} disciplines
 * @param {Map<string,string>} status
 * @param {Map<string,number>} [overrides]
 * @param {number} [targetLoad] carga-alvo (denominador da porcentagem)
 * @returns {{
 *   rows:{semester:number, disciplines:Object[], workload:number, pct:number}[],
 *   total:number, totalDisciplines:number, totalPct:number
 * }}
 */
export function projectedLoad(graph, disciplines, status, overrides = new Map(), targetLoad = 0) {
  const minSem = 1;
  // Chave-dona -> disciplina em cada semestre (dedup de cópias, respeita override).
  const bySem = new Map();
  let maxSem = graph.getMaxRecommendedSemester ? graph.getMaxRecommendedSemester() : 0;
  for (const d of disciplines) {
    if (!d.recommendedSemester) continue; // remove semestre 0
    const sem = overrides.get(d.id) ?? d.recommendedSemester;
    if (!bySem.has(sem)) bySem.set(sem, new Map());
    const bucket = bySem.get(sem);
    const key = d.originalId || d.id;
    if (!bucket.has(key)) {
      bucket.set(key, { id: d.id, key, name: d.name, workload: d.workload || 0, type: d.type });
    }
    if (sem > maxSem) maxSem = sem;
  }
  if (maxSem < minSem) maxSem = minSem;

  const rows = [];
  let total = 0;
  for (let sem = minSem; sem <= maxSem; sem++) {
    const items = Array.from((bySem.get(sem) || new Map()).values());
    const workload = items.reduce((acc, d) => acc + d.workload, 0);
    total += workload;
    rows.push({ semester: sem, disciplines: items, workload, pct: 0 });
  }

  const totalDisciplines = rows.reduce((acc, r) => acc + r.disciplines.length, 0);
  const denom = targetLoad > 0 ? targetLoad : total;
  for (const row of rows) {
    row.pct = denom > 0 ? (row.workload / denom) * 100 : 0;
  }
  const totalPct = denom > 0 ? (total / denom) * 100 : 0;

  return { rows, total, totalDisciplines, totalPct };
}

/**
 * Cenário alternativo: projeta como o plano ficaria se certas disciplinas
 * fossem marcadas como aprovadas/cursando (simulação de "e se…").
 * @param {import('../graph.js').CurriculumGraph} graph
 * @param {Array<object>} disciplines
 * @param {Map<string,string>} status
 * @param {Map<string,number>} [overrides]
 * @param {string[]} [approve] ids a marcar como done no cenário
 * @returns {object} mesmo formato de estimateGraduation para o cenário
 */
export function simulateScenario(graph, disciplines, status, overrides = new Map(), approve = []) {
  const scenarioStatus = new Map(status);
  for (const id of approve) {
    const d = graph.getDiscipline(id);
    if (!d) continue;
    // Aprovar uma cópia equivale a aprovar a chave-dona (evita dupla contagem).
    const key = d.originalId || d.id;
    scenarioStatus.set(key, STATUS.COMPLETED);
  }
  return estimateGraduation(graph, disciplines, scenarioStatus, overrides);
}