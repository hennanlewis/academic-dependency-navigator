// ============================================================
// theme.js — Tema claro/escuro compartilhado (MPA).
// Persiste a escolha em localStorage e respeita
// prefers-color-scheme como padrão inicial.
// Fase 6.5 (compartilhado entre todas as páginas).
// ============================================================

const THEME_KEY = 'adn.theme';

/** Tema atual lido de <html data-theme>. */
function currentTheme() {
  return document.documentElement.dataset.theme;
}

/**
 * Aplica o tema inicial no <html> e retorna o tema ativo.
 * @returns {'light'|'dark'}
 */
export function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  return theme;
}

/**
 * Liga o botão de alternância (se presente) à troca de tema.
 * Atualiza o rótulo do botão conforme o tema atual.
 * @param {HTMLElement|null} btn botão de alternância
 * @returns {Function} cleanup
 */
export function setupThemeToggle(btn) {
  if (!btn) return () => {};
  const sync = () => {
    btn.textContent = currentTheme() === 'dark' ? 'Claro' : 'Escuro';
  };
  sync();
  const onClick = () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    sync();
  };
  btn.addEventListener('click', onClick);
  return () => btn.removeEventListener('click', onClick);
}