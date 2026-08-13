// ============================================================
// status.js — Constantes de status acadêmico.
// Domínio puro.
// ============================================================

/**
 * Status acadêmico de uma disciplina.
 * - NONE      = null (Pendente / sem status)
 * - COMPLETED = Aprovada
 * - CURRENT   = Cursando
 * - FAILED    = Reprovada
 */
export const STATUS = {
  NONE: null,
  COMPLETED: 'completed',
  CURRENT: 'current',
  FAILED: 'failed',
};

/** Rótulos de exibição por valor de status. */
export const STATUS_LABELS = {
  completed: 'Aprovada',
  current: 'Cursando',
  failed: 'Reprovada',
};

/** Opções para o editor, na ordem de exibição. */
export const STATUS_OPTIONS = [
  { value: STATUS.NONE, label: 'Pendente' },
  { value: STATUS.COMPLETED, label: 'Aprovada' },
  { value: STATUS.CURRENT, label: 'Cursando' },
  { value: STATUS.FAILED, label: 'Reprovada' },
];

/** Conjunto de status "concluídos" (contam como atendidos). */
export const COMPLETED_STATUSES = new Set([STATUS.COMPLETED]);