// ============================================================
// settings.js — Settings.
// Ações de configuração: limpar o progresso salvo localmente.
// Reusa o bootstrap compartilhado (tema, nav, metadados).
// Fase 6.5 (MPA).
// ============================================================

import { createApp } from './bootstrap.js';
import { clearSavedState } from '../state/store-persistence.js';

function renderMeta(curriculum) {
  const el = document.getElementById('course-meta');
  if (el) {
    const m = curriculum.meta;
    el.textContent = [m.curso, m.instituicao, m.versao].filter(Boolean).join(' — ');
  }
}

function main() {
  const app = createApp();
  renderMeta(app.baseCurriculum);

  const btn = document.getElementById('clear-state');
  const statusEl = document.getElementById('settings-status');
  if (!btn) return;

  btn.addEventListener('click', () => {
    clearSavedState();
    if (statusEl) {
      statusEl.textContent = 'Progresso limpo. Recarregando…';
    }
    setTimeout(() => location.reload(), 600);
  });
}

document.addEventListener('DOMContentLoaded', main);