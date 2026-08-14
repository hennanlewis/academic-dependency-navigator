// ============================================================
// modal.js — Modal genérico para a aplicação.
// Overlay de fundo + caixa de diálogo com cabeçalho, conteúdo
// gerado por callback e ações de rodapé. Usa apenas tokens de tema.
// ============================================================

/**
 * Abre um modal e retorna uma API de controle.
 * @param {Object} config
 * @param {string} [config.eyebrow] texto pequeno acima do título
 * @param {string} config.title título do modal
 * @param {(body:HTMLElement)=>void} [config.content] monta o corpo
 * @param {(helpers:{close:Function})=>HTMLElement[]} [config.footer]
 *   opcional; retorna botões do rodapé (fechamento via helpers.close)
 * @param {Object} [config.options]
 * @param {boolean} [config.options.closable=true] permite fechar com ESC/backdrop
 * @returns {{ close: Function, el: HTMLElement }}
 */
export function openModal({ eyebrow, title, content, footer, options = {} }) {
  const { closable = true } = options;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  const head = document.createElement('div');
  head.className = 'modal-head';

  const headText = document.createElement('div');
  if (eyebrow) {
    const eb = document.createElement('span');
    eb.className = 'modal-eyebrow';
    eb.textContent = eyebrow;
    headText.appendChild(eb);
  }
  const h = document.createElement('h2');
  h.className = 'modal-title';
  h.textContent = title;
  headText.appendChild(h);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Fechar');
  closeBtn.textContent = '✕';
  head.append(headText, closeBtn);

  const body = document.createElement('div');
  body.className = 'modal-body';

  dialog.append(head, body);

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };

  const onKey = (e) => {
    if (e.key === 'Escape' && closable) close();
  };

  if (closable) {
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', onKey);
  }

  if (content) content(body);

  if (footer) {
    const foot = document.createElement('div');
    foot.className = 'modal-foot';
    const actions = footer({ close }) || [];
    actions.forEach((el) => foot.appendChild(el));
    dialog.appendChild(foot);
  }

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  return { close, el: dialog, body };
}