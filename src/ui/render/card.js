// ============================================================
// card.js — Cartão de disciplina (render + destaque + status).
// ============================================================

import { RELATION, classifyCard } from '../../state/selectors.js';
import { STATUS, STATUS_LABELS } from '../../domain/status.js';

const TYPE_ABBR = {
  'Obrigatória': 'OBR',
  'Optativa': 'OPT',
  'Complementar': 'COMP',
};

/**
 * Cria um elemento de cartão de disciplina.
 * @param {Object} discipline disciplina canônica
 * @param {Object} [opts]
 * @param {string} [opts.relation] um valor de RELATION
 * @param {string|null} [opts.status] um valor de STATUS
 * @param {boolean} [opts.available] a disciplina está disponível para cursar
 * @returns {HTMLElement}
 */
export function renderCard(discipline, opts = {}) {
  const { relation = RELATION.NEUTRAL, status = STATUS.NONE, available = false, readOnly = false } = opts;
  const card = document.createElement('article');
  card.className = 'card-disc';
  card.dataset.id = discipline.id;
  card.dataset.semester = discipline.recommendedSemester ?? 0;
  card.dataset.type = discipline.type;
  card.dataset.rel = relation;
  card.dataset.status = status ?? '';
  card.dataset.available = available ? 'true' : '';
  if (discipline.attempt) {
    card.dataset.attempt = String(discipline.attempt);
    card.dataset.originalId = discipline.originalId ?? '';
  }

  const header = document.createElement('div');
  header.className = 'card-disc-header';

  const left = document.createElement('div');
  left.className = 'card-disc-left';

  const code = document.createElement('span');
  code.className = 'card-disc-code';
  code.textContent = discipline.code || discipline.id;
  left.appendChild(code);

  if (discipline.attempt) {
    const ab = document.createElement('span');
    ab.className = 'card-attempt-badge';
    ab.textContent = `T${discipline.attempt}`;
    left.appendChild(ab);
  }
  header.appendChild(left);

  if (!readOnly) {
    const statusBtn = document.createElement('button');
    statusBtn.type = 'button';
    statusBtn.className = 'card-disc-status';
    statusBtn.dataset.status = status ?? '';
    statusBtn.title = 'Editar status';
    statusBtn.setAttribute('aria-label', `Editar status de ${discipline.name}`);
    const statusDot = document.createElement('span');
    statusDot.className = 'card-disc-status-dot';
    const statusLabel = document.createElement('span');
    statusLabel.className = 'card-disc-status-label';
    statusLabel.textContent = status ? STATUS_LABELS[status] : 'Pendente';
    statusBtn.append(statusDot, statusLabel);
    header.appendChild(statusBtn);
  }

  const name = document.createElement('h4');
  name.className = 'card-disc-name';
  name.textContent = discipline.name;

  const meta = document.createElement('div');
  meta.className = 'card-disc-meta';

  const typeAbbr = TYPE_ABBR[discipline.type] || discipline.type.slice(0, 3).toUpperCase();
  const parts = [`${typeAbbr} ${discipline.workload}${discipline.workload_unit}`];
  if (discipline.credits) parts.push(`${discipline.credits} cr`);
  if (available) {
    parts.push('(Disponível)');
    meta.classList.add('is-available');
  }
  meta.textContent = parts.join(' · ');

  if (readOnly) {
    // Em cards só-leitura, o tipo também aparece na borda direita via ::after.
    card.dataset.typeRail = discipline.type;
  }

  card.append(header, name, meta);

  return card;
}

/**
 * Define o estado visual de status de um cartão e sua pill.
 * @param {HTMLElement} card elemento `.card-disc`
 * @param {string|null} status um valor de STATUS
 */
export function applyStatus(card, status) {
  status = status ?? STATUS.NONE;
  card.dataset.status = status;
  const pill = card.querySelector('.card-disc-status');
  if (pill) {
    pill.dataset.status = status;
    const label = pill.querySelector('.card-disc-status-label');
    if (label) label.textContent = status ? STATUS_LABELS[status] : 'Pendente';
  }
}

/**
 * Aplica o estado de relação (destaque) a um cartão já existente.
 * @param {HTMLElement} card elemento `.card-disc`
 * @param {string} relation um valor de RELATION
 */
export function applyRelation(card, relation) {
  card.dataset.rel = relation;
}

/**
 * Reclassifica todos os cartões do board conforme a seleção.
 * @param {HTMLElement} board container da grade
 * @param {Object} sel resultado de deriveSelection
 * @param {boolean} hasSelection há seleção ativa?
 */
export function applySelectionToBoard(board, sel, hasSelection) {
  for (const card of board.querySelectorAll('.card-disc')) {
    const id = card.dataset.id;
    applyRelation(card, classifyCard(id, sel, hasSelection));
  }
}

/**
 * Aplica o mapa de status a todos os cartões do board.
 * @param {HTMLElement} board container da grade
 * @param {Map<string,string>} statusMap id -> STATUS
 */
export function applyStatusesToBoard(board, statusMap) {
  for (const card of board.querySelectorAll('.card-disc')) {
    const id = card.dataset.id;
    applyStatus(card, statusMap.get(id) ?? STATUS.NONE);
  }
}

/**
 * Aplica o conjunto de disciplinas disponíveis a todos os cartões.
 * Marca `data-available` e sincroniza o marcador "(Disponível)" na meta.
 * @param {HTMLElement} board container da grade
 * @param {Set<string>} available ids disponíveis para cursar
 */
export function applyAvailabilityToBoard(board, available) {
  for (const card of board.querySelectorAll('.card-disc')) {
    const isAvailable = available.has(card.dataset.id);
    card.dataset.available = isAvailable ? 'true' : '';
    const meta = card.querySelector('.card-disc-meta');
    if (meta) {
      meta.classList.toggle('is-available', isAvailable);
      const mark = '(Disponível)';
      let text = meta.textContent.replace(` · ${mark}`, '').replace(` ${mark}`, '');
      if (isAvailable) text = `${text.trim()} ${mark}`;
      meta.textContent = text;
    }
  }
}