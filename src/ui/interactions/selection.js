// ============================================================
// selection.js — Interação de seleção (clique) e destaque.
// Delegação de eventos no board: clicar num cartão alterna a
// seleção no store. O re-render (aplicar classes de relação) fica
// por conta da assinatura do store em index.js.
// ESC limpa a seleção.
// ============================================================

/**
 * Configura a interação de seleção no board.
 * @param {Object} deps
 * @param {HTMLElement} deps.board container da grade
 * @param {Object} deps.store store central
 * @returns {Function} cleanup (remove listeners)
 */
export function setupSelection({ board, store }) {
  const onBoardClick = (event) => {
    // Cliques no botão/pill de status são tratados pelo status-editor.
    if (event.target.closest('.card-disc-status')) return;
    const card = event.target.closest('.card-disc');
    if (!card) return;
    const id = card.dataset.id;
    if (!id) return;
    store.toggleSelect(id);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      store.clearSelection();
    }
  };

  board.addEventListener('click', onBoardClick);
  document.addEventListener('keydown', onKeyDown);

  return () => {
    board.removeEventListener('click', onBoardClick);
    document.removeEventListener('keydown', onKeyDown);
  };
}
