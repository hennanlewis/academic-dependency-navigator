// ============================================================
// card.js — Cartão de disciplina (render + destaque + status).
// ============================================================

import { RELATION, classifyCard } from '../../state/selectors.js';
import { STATUS, STATUS_LABELS } from '../../domain/status.js';

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
  const { relation = RELATION.NEUTRAL, status = STATUS.NONE, available = false } = opts;
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
  left.appendChild(statusBtn);
  header.append(left);

  const moveBtn = document.createElement('button');
  moveBtn.type = 'button';
  moveBtn.className = 'card-move';
  moveBtn.title = 'Mover de semestre';
  moveBtn.setAttribute('aria-label', `Mover ${discipline.name} de semestre`);
  moveBtn.textContent = 'Mover';

  card.appendChild(moveBtn);

  if (discipline.attempt) {
    const attemptBox = document.createElement('div');
    attemptBox.className = 'card-attempt';

    const badge = document.createElement('span');
    badge.className = 'card-attempt-badge';
    badge.textContent = `Tentativa ${discipline.attempt}`;
    badge.title = `Cópia de ${discipline.name}`;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'card-attempt-remove';
    removeBtn.title = 'Remover tentativa';
    removeBtn.setAttribute('aria-label', `Remover tentativa de ${discipline.name}`);
    removeBtn.textContent = '✕';

    attemptBox.append(badge, removeBtn);
    card.append(attemptBox);
  } else {
    const attemptBtn = document.createElement('button');
    attemptBtn.type = 'button';
    attemptBtn.className = 'card-attempt';
    attemptBtn.title = 'Nova tentativa';
    attemptBtn.setAttribute('aria-label', `Nova tentativa de ${discipline.name}`);
    attemptBtn.textContent = 'Refazer';
    card.appendChild(attemptBtn);
  }

  const name = document.createElement('h4');
  name.className = 'card-disc-name';
  name.textContent = discipline.name;

  const meta = document.createElement('div');
  meta.className = 'card-disc-meta';
  meta.textContent = `${discipline.workload}${discipline.workload_unit}` +
    (discipline.credits ? ` · ${discipline.credits} cr` : '');

  const tags = document.createElement('div');
  tags.className = 'card-disc-tags';

  const typeBadge = document.createElement('span');
  typeBadge.className = 'card-disc-type';
  typeBadge.textContent = discipline.type;

  const av = document.createElement('span');
  av.className = 'card-disc-available';
  av.textContent = 'Disponível';
  av.hidden = !available;

  tags.append(typeBadge, av);

  card.append(header, name, meta);
  card.appendChild(tags);
  return card;
}

/**
 * Define o estado visual de status de um cartão e sua pill.
 * @param {HTMLElement} card elemento `.card-disc`
 * @param {string|null} status um valor de STATUS
 */
export function applyStatus(card, status) {
  card.dataset.status = status ?? '';
  const pill = card.querySelector('.card-disc-status');
  if (pill) {
    pill.dataset.status = status ?? '';
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
 * Mostra/esconde o badge e marca `data-available`.
 * @param {HTMLElement} board container da grade
 * @param {Set<string>} available ids disponíveis para cursar
 */
export function applyAvailabilityToBoard(board, available) {
  for (const card of board.querySelectorAll('.card-disc')) {
    const id = card.dataset.id;
    const isAvailable = available.has(id);
    card.dataset.available = isAvailable ? 'true' : '';
    const badge = card.querySelector('.card-disc-available');
    if (badge) badge.hidden = !isAvailable;
  }
}