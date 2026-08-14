// ============================================================
// nav.js — Barra lateral de navegação compartilhada (MPA).
// Uma única implementação monta e injeta a mesma sidebar em todas
// as páginas, evitando duplicar HTML. O item ativo é marcado via
// `data-page` no <html> (ou o padrão 'index').
// Fase 6.5.
// ============================================================

/**
 * Itens de navegação do app. Cada item tem:
 * - key:    identificador (usado para marcar o ativo)
 * - label:  texto exibido
 * - href:   página de destino
 */
export const NAV_ITEMS = [
  { key: 'index', label: 'Matriz (Prerequisites)', href: 'index.html' },
  { key: 'history', label: 'Histórico (Academic History)', href: 'history.html' },
  { key: 'catalog', label: 'Catálogo (Course Catalog)', href: 'catalog.html' },
  { key: 'settings', label: 'Configurações (Settings)', href: 'settings.html' },
];

/**
 * Página ativa, lida de `<html data-page>`.
 * @returns {string}
 */
export function getActivePage() {
  return document.documentElement.dataset.page ?? 'index';
}

/**
 * 
 * Monta e injeta a barra lateral dentro do container (idempotente).
 * @param {HTMLElement} container slot onde a sidebar é inserida
 * @param {Array<{key:string,label:string,href:string}>} [items]
 * @returns {HTMLElement|null} o elemento `aside` criado (ou null)
 */
export function mountNav(container, items = NAV_ITEMS) {
  if (!container) return null;
  const active = getActivePage();

  container.replaceChildren();

  const aside = document.createElement('aside');
  aside.className = 'app-nav';
  aside.setAttribute('aria-label', 'Navegação principal');

  const brand = document.createElement('div');
  brand.className = 'nav-brand';

  const brandIcon = document.createElement('span');
  brandIcon.className = 'nav-brand-icon';
  brandIcon.textContent = 'ADN';

  const brandText = document.createElement('div');
  const title = document.createElement('p');
  title.className = 'nav-brand-title';
  title.textContent = 'Academic';
  const sub = document.createElement('p');
  sub.className = 'nav-brand-sub';
  sub.textContent = 'Dependency Navigator';
  brandText.append(title, sub);

  brand.append(brandIcon, brandText);

  const list = document.createElement('nav');
  list.className = 'nav-list';

  for (const item of items) {
    const a = document.createElement('a');
    a.className = 'nav-item';
    a.href = item.href;
    a.dataset.page = item.key;
    a.textContent = item.label;
    if (item.key === active) a.dataset.active = 'true';
    list.appendChild(a);
  }

  aside.append(brand, list);
  container.appendChild(aside);
  return aside;
}