// ============================================================
// dashboard.js — Dashboard (página inicial / index.html).
// Exibe as disciplinas com status "Cursando" (à esquerda) em cards
// de **apenas leitura** e, à direita, as estatísticas do currículo
// (via selectors). Fase 6.5 (MPA).
// ============================================================

import { createApp } from './bootstrap.js';
import { deriveAvailable } from '../state/selectors.js';
import { STATUS } from '../domain/status.js';
import { renderCard } from './render/card.js';
import { openModal } from './render/modal.js';
import {
  currentSemester,
  estimateGraduation,
  projectedLoad,
} from '../domain/services/planner-service.js';

// Carga horária mínima total para se formar
// (vem do PPC; aqui como constante explícita).
const MIN_GRADUATION_LOAD = 4000;

// Estatística compacta: rótulo à esquerda, valor à direita
// (altura próxima às linhas do catálogo).
function stat(label, value, sub = '') {
  const row = document.createElement('div');
  row.className = 'stat-row';

  const t = document.createElement('span');
  t.className = 'stat-label';
  t.textContent = label;

  const right = document.createElement('span');
  right.className = 'stat-right';

  const v = document.createElement('span');
  v.className = 'stat-value';
  v.textContent = value;
  right.appendChild(v);

  if (sub) {
    const s = document.createElement('span');
    s.className = 'stat-sub';
    s.textContent = sub;
    right.appendChild(s);
  }

  row.append(t, right);
  return row;
}

function renderMeta(curriculum) {
  const el = document.getElementById('course-meta');
  if (el) {
    const m = curriculum.meta;
    el.textContent = [m.curso, m.instituicao, m.versao].filter(Boolean).join(' — ');
  }
}

function main() {
  const app = createApp();
  const graph = app.getGraph();
  const state = app.getState();
  const disciplines = app.getWorkingCurriculum().disciplines;

  renderMeta(app.baseCurriculum);

  const status = state.status;
  const available = deriveAvailable(graph, status);
  const overrides = state.semesterOverrides;

  let chTotal = 0;
  let chObrigatoria = 0;
  let chCursada = 0;
  let cursando = 0;
  let reprovadas = 0;
  let obrig = 0;
  let opt = 0;
  let comp = 0;
  let aprovadas = 0;
  const cursandoIds = [];

  // Agrega por "disciplina dona" (key = originalId para cópias, senão id),
  // para que original + tentativas não somem carga/contagens em duplicidade.
  const byKey = new Map();
  for (const d of disciplines) {
    const key = d.originalId || d.id;
    let rec = byKey.get(key);
    if (!rec) {
      rec = { workload: d.workload || 0, type: d.type, completed: false, current: false, failed: false };
      byKey.set(key, rec);
    }
    const st = status.get(d.id);
    if (st === STATUS.COMPLETED) rec.completed = true;
    else if (st === STATUS.CURRENT) rec.current = true;
    else if (st === STATUS.FAILED) rec.failed = true;
  }

  for (const rec of byKey.values()) {
    chTotal += rec.workload;
    if (rec.type === 'Obrigatória') {
      obrig++;
      chObrigatoria += rec.workload;
    } else if (rec.type === 'Optativa') opt++;
    else if (rec.type === 'Complementar') comp++;

    if (rec.completed) {
      aprovadas++;
      chCursada += rec.workload;
    } else if (rec.current) cursando++;
    else if (rec.failed) reprovadas++;
  }

  // Lista de disciplinas "Cursando" (cards): usa os nós reais, não as chaves.
  for (const d of disciplines) {
    if (status.get(d.id) === STATUS.CURRENT) cursandoIds.push(d);
  }

  const pct = MIN_GRADUATION_LOAD > 0 ? Math.min(100, Math.round((chCursada / MIN_GRADUATION_LOAD) * 100)) : 0;
  const faltam = Math.max(0, MIN_GRADUATION_LOAD - chCursada);

  const statsEl = document.getElementById('history-stats');
  if (statsEl) {
    statsEl.replaceChildren();
    statsEl.append(
      stat('Total de disciplinas', disciplines.length),
      stat('Carga obrigatória', `${chObrigatoria}h`),
      stat('Mínimo para formar', `${MIN_GRADUATION_LOAD}h`),
      stat('Obrigatórias', obrig),
      stat('Optativas', opt),
      stat('Complementares', comp),
      stat('Aprovadas', aprovadas),
      stat('Cursando', cursando),
      stat('Reprovadas', reprovadas),
      stat('Disponíveis agora', available.size),
      stat('CH cursada', `${chCursada}h`, `${pct}% do mínimo`),
      stat('Falta para formar', `${faltam}h`)
    );
    const done = document.createElement('div');
    done.className = 'stat-note';
    done.textContent =
      `Carga horária mínima total para se formar: ${MIN_GRADUATION_LOAD}h. ` +
      `As obrigatórias somam ${chObrigatoria}h; ` +
      'complementares e optativas completam a diferença para quem quiser fazer mais.';
    statsEl.appendChild(done);
  }

  const list = document.getElementById('cursando-list');
  const count = document.getElementById('cursando-count');
  if (list) {
    list.replaceChildren();
    const sorted = cursandoIds.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    for (const d of sorted) {
      const card = renderCard(d, { readOnly: true, status: STATUS.CURRENT });
      list.appendChild(card);
    }
    if (count) count.textContent = `${sorted.length} disciplina(s)`;
  }

  // ---- Plano de planejamento (Fase 7) ----
  const plannerStats = document.getElementById('planner-stats');
  const plannerProject = document.getElementById('planner-project');
  if (plannerStats) {
    const sem = currentSemester(graph, status, overrides);
    const grad = estimateGraduation(graph, disciplines, status, overrides);

    const finishLabel =
      grad.obligatoryRemaining === 0
        ? 'Formado'
        : grad.remainingSemesters <= 0
          ? 'Já disponível'
          : `Faltam ${grad.remainingSemesters}`;

    plannerStats.replaceChildren(
      stat('Semestre atual', sem || '—', sem ? `S${sem}` : 'nenhuma disciplina com status'),
      stat('Obrigatórias restantes', grad.obligatoryRemaining),
      stat('Conclusão prevista', grad.finishAt ? `S${grad.finishAt}` : '—', finishLabel),
      stat('Disponíveis agora', available.size)
    );
  }

  if (plannerProject) {
    plannerProject.replaceChildren();
    const { rows, total, totalDisciplines, totalPct } = projectedLoad(graph, disciplines, status, overrides, MIN_GRADUATION_LOAD);
    if (rows.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'stat-note';
      empty.textContent = 'Nenhuma disciplina pendente.';
      plannerProject.appendChild(empty);
    } else {
      const head = document.createElement('p');
      head.className = 'stat-note';
      head.textContent = `Distribuição de carga por semestre. Clique num semestre para ver as disciplinas.`;
      plannerProject.appendChild(head);

      const listEl = document.createElement('div');
      listEl.className = 'planner-proj-list';
      for (const row of rows) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'planner-proj-row';
        item.dataset.empty = row.disciplines.length === 0 ? 'true' : '';
        item.title = row.disciplines.length ? 'Ver disciplinas planejadas' : 'Sem disciplinas no semestre';
        item.disabled = row.disciplines.length === 0;
        item.addEventListener('click', () =>
          openModal({
            eyebrow: 'Planejamento',
            title: `Semestre ${row.semester}`,
            content: (body) => {
              body.appendChild(plannerSemesterList(row.disciplines, graph));
            },
          })
        );

        const sem = document.createElement('span');
        sem.className = 'planner-proj-sem';
        sem.textContent = `S${row.semester}`;

        const names = document.createElement('span');
        names.className = 'planner-proj-names';
        names.textContent = row.disciplines.length ? `${row.disciplines.length} disciplina(s)` : '—';

        const load = document.createElement('span');
        load.className = 'planner-proj-load';
        load.textContent = `${row.workload}h · ${row.pct.toFixed(0)}%`;

        item.append(sem, names, load);
        listEl.appendChild(item);
      }

      // Linha de total (contagem + carga + % sobre a carga-alvo).
      const totalRow = document.createElement('div');
      totalRow.className = 'planner-proj-row planner-proj-total';
      const tSem = document.createElement('span');
      tSem.className = 'planner-proj-sem';
      tSem.textContent = 'Total';
      const tNames = document.createElement('span');
      tNames.className = 'planner-proj-names';
      tNames.textContent = `${totalDisciplines} disciplina(s) · base ${MIN_GRADUATION_LOAD}h`;
      const tLoad = document.createElement('span');
      tLoad.className = 'planner-proj-load';
      tLoad.textContent = `${total}h · ${totalPct.toFixed(0)}%`;
      totalRow.append(tSem, tNames, tLoad);
      listEl.appendChild(totalRow);

      plannerProject.appendChild(listEl);
    }
  }
}

// Lista de disciplinas planejadas de um semestre, no estilo das linhas do
// Catálogo (código à esquerda, nome, badges de tipo/status, meta de carga).
function plannerSemesterList(disciplines, graph) {
  const list = document.createElement('div');
  list.className = 'catalog-list';
  for (const d of disciplines) {
    const node = graph.getDiscipline(d.id) || graph.getDiscipline(d.key);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'catalog-row';
    row.disabled = true;

    const code = document.createElement('span');
    code.className = 'catalog-code';
    code.textContent = node && node.code ? node.code : d.id;

    const name = document.createElement('span');
    name.className = 'catalog-name';
    name.textContent = d.name;

    const badges = document.createElement('span');
    badges.className = 'catalog-badges';
    const type = document.createElement('span');
    type.className = 'catalog-type';
    type.textContent = d.type;
    badges.appendChild(type);

    const meta = document.createElement('span');
    meta.className = 'catalog-meta';
    meta.textContent = `${d.workload}h`;

    row.append(code, name, badges, meta);
    list.appendChild(row);
  }
  return list;
}

document.addEventListener('DOMContentLoaded', main);