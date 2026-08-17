// ============================================================
// settings.js — Settings.
// Ações de configuração: limpar o progresso, exportar/importar o
// plano (.json) e gerenciar múltiplas versões salvas de planos.
// Reusa o bootstrap compartilhado (tema, nav, metadados).
// Fase 6.5 (MPA) + Fase 8 (export/import e versões).
// ============================================================

import { createApp } from './bootstrap.js';
import {
  clearSavedState,
  exportPlan,
  importPlan,
  savePlan,
  listPlans,
  loadPlan,
  deletePlan,
  saveState,
} from '../state/store-persistence.js';

function renderMeta(curriculum) {
  const el = document.getElementById('course-meta');
  if (el) {
    const m = curriculum.meta;
    el.textContent = [m.curso, m.instituicao, m.versao].filter(Boolean).join(' — ');
  }
}

function note(el, message, isError = false) {
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('text-error', isError);
  el.classList.toggle('text-on-surface-variant', !isError);
  if (isError) setTimeout(() => (el.textContent = ''), 4000);
  else setTimeout(() => (el.textContent = ''), 2500);
}

function renderPlanList(store, listEl) {
  if (!listEl) return;
  listEl.replaceChildren();

  const plans = listPlans();
  if (plans.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'stat-note';
    empty.textContent = 'Nenhuma versão salva ainda.';
    listEl.appendChild(empty);
    return;
  }

  for (const name of plans) {
    const row = document.createElement('div');
    row.className = 'plan-row';

    const label = document.createElement('span');
    label.className = 'plan-name';
    label.textContent = name;
    row.appendChild(label);

    const actions = document.createElement('span');
    actions.className = 'plan-actions';

    const loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'btn btn-sm';
    loadBtn.textContent = 'Carregar';
    loadBtn.addEventListener('click', () => {
      const sliced = loadPlan(name);
      if (!sliced) {
        note(listEl, 'Falha ao carregar o plano.', true);
        return;
      }
      store.hydrate(sliced);
      saveState(store.getState());
      note(listEl, `Plano "${name}" carregado.`);
      renderPlanList(store, listEl);
    });
    actions.appendChild(loadBtn);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn btn-sm btn-outline';
    delBtn.textContent = 'Excluir';
    delBtn.addEventListener('click', () => {
      deletePlan(name);
      renderPlanList(store, listEl);
    });
    actions.appendChild(delBtn);

    row.appendChild(actions);
    listEl.appendChild(row);
  }
}

function main() {
  const app = createApp();
  const store = app.store;
  renderMeta(app.baseCurriculum);

  const clearBtn = document.getElementById('clear-state');
  const statusEl = document.getElementById('settings-status');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearSavedState();
      if (statusEl) statusEl.textContent = 'Progresso limpo. Recarregando…';
      setTimeout(() => location.reload(), 600);
    });
  }

  // Exportar / Importar.
  const transferStatus = document.getElementById('transfer-status');
  const exportBtn = document.getElementById('export-plan');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportPlan(store.getState());
      note(transferStatus, 'Plano exportado.');
    });
  }

  const importInput = document.getElementById('import-plan');
  if (importInput) {
    importInput.addEventListener('change', () => {
      const file = importInput.files && importInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const sliced = importPlan(String(reader.result));
        if (!sliced) {
          note(transferStatus, 'Arquivo inválido.', true);
          return;
        }
        store.hydrate(sliced);
        saveState(store.getState());
        note(transferStatus, 'Plano importado com sucesso.');
      };
      reader.onerror = () => note(transferStatus, 'Erro de leitura do arquivo.', true);
      reader.readAsText(file);
      importInput.value = '';
    });
  }

  // Versões de planos.
  const plansList = document.getElementById('plans-list');
  const planName = document.getElementById('plan-name');
  const saveBtn = document.getElementById('save-plan');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = planName ? planName.value.trim() : '';
      if (!name) {
        note(plansList, 'Informe um nome para o plano.', true);
        return;
      }
      savePlan(store.getState(), name);
      if (planName) planName.value = '';
      renderPlanList(store, plansList);
    });
  }

  renderPlanList(store, plansList);
}

document.addEventListener('DOMContentLoaded', main);