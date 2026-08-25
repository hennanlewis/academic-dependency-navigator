// ============================================================
// discipline-editor.js — Modal do editor de disciplina (PUD).
// Formulário completo com todos os campos do PPC/PUD: identidade,
// semestre/oferta, CH desdobrada, créditos, ementa, objetivos,
// programa, metodologia, avaliação, bibliografias e pré-requisitos.
// A validação/aplicação fica no serviço de domínio
// (domain/services/discipline-editor.js); aqui só coletamos,
// exibimos erros e entregamos o novo currículo via onSave.
// Fase 10.
// ============================================================

import { DISCIPLINE_TYPES } from '../../domain/models.js';
import {
  buildDraftFromDiscipline,
  requirementTreeToText,
  prerequisitesFromText,
  validateDisciplineDraft,
  validateEditedCurriculum,
  applyDisciplineEdit,
  suggestNewId,
} from '../../domain/services/discipline-editor.js';
import { openModal } from '../render/modal.js';

const FREQUENCY_OPTIONS = [
  { value: 'annual', label: 'Anual' },
  { value: 'semestral', label: 'Semestral' },
];

/** Mapas auxiliares: nome->id (para resolver pré-requisitos) e id->nome. */
function buildLookups(curriculum) {
  const nameToId = new Map();
  const idToName = new Map();
  for (const d of curriculum.disciplines) {
    if (d.name) nameToId.set(d.name.trim().toLowerCase(), d.id);
    if (d.id) idToName.set(d.id, d.name || d.id);
  }
  return { nameToId, idToName };
}

function sectionTitle(text) {
  const el = document.createElement('h3');
  el.className = 'editor-section-title';
  el.textContent = text;
  return el;
}

function textField(id, value, type = 'text') {
  const input = document.createElement('input');
  input.className = 'text-field';
  input.type = type;
  input.id = id;
  input.value = value ?? '';
  if (type === 'number') {
    input.min = '0';
    input.step = '1';
    input.inputMode = 'numeric';
  }
  return input;
}

function textArea(id, value, rows = 3, placeholder = '') {
  const ta = document.createElement('textarea');
  ta.className = 'text-field';
  ta.id = id;
  ta.rows = rows;
  ta.value = value ?? '';
  if (placeholder) ta.placeholder = placeholder;
  return ta;
}

function selectField(id, options, selected) {
  const select = document.createElement('select');
  select.className = 'text-field';
  select.id = id;
  for (const opt of options) {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.value === selected) option.selected = true;
    select.appendChild(option);
  }
  return select;
}

function field(labelText, control, wide = false) {
  const wrap = document.createElement('div');
  wrap.className = wide ? 'editor-field editor-field--wide' : 'editor-field';

  const lbl = document.createElement('label');
  lbl.className = 'label-md';
  lbl.textContent = labelText;
  lbl.htmlFor = control.id;

  wrap.append(lbl, control);
  return wrap;
}

function linesFrom(value) {
  return String(value ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Abre o modal do editor de disciplina.
 * @param {Object} deps
 * @param {Object} deps.curriculum currículo canônico em trabalho
 *   (fonte de nomes/ids para resolução de pré-requisitos)
 * @param {string|null} [deps.disciplineId] id da disciplina a editar;
 *   null abre o modo "Nova disciplina"
 * @param {Function} deps.onSave callback ({ curriculum, discipline })
 *   chamado apenas quando a edição é válida; a integração com
 *   persistência/grafo fica a cargo do chamador
 */
export function openDisciplineEditor({ curriculum, disciplineId = null, onSave }) {
  const existing = disciplineId ? curriculum.disciplines.find((d) => d.id === disciplineId) : null;
  const { nameToId, idToName } = buildLookups(curriculum);
  const isNew = !existing;

  const draft = existing ? buildDraftFromDiscipline(existing) : null;

  const modal = openModal({
    eyebrow: 'Editor de disciplina (PUD)',
    title: isNew ? 'Nova disciplina' : existing.name,
    content: (body) => {
      // ---- Identidade ----
      const identity = document.createElement('section');
      identity.className = 'editor-section';
      identity.appendChild(sectionTitle('Identidade'));

      const identityFields = document.createElement('div');
      identityFields.className = 'editor-fields';

      const idInput = textField('disc-editor-id', draft?.id ?? suggestNewId(curriculum));
      // Em edição o ID é imutável: renomear deixaria pré-requisitos
      // de outras disciplinas apontando para um id órfão.
      if (!isNew) {
        idInput.readOnly = true;
        idInput.title = 'O ID não pode ser alterado em uma disciplina existente.';
      }
      const codeInput = textField('disc-editor-code', draft?.code ?? '');
      const nameInput = textField('disc-editor-name', draft?.name ?? '');
      const typeSelect = selectField(
        'disc-editor-type',
        DISCIPLINE_TYPES.map((t) => ({ value: t, label: t })),
        draft?.type ?? 'Obrigatória'
      );
      const levelInput = textField('disc-editor-level', draft?.level ?? 'Superior');

      identityFields.append(
        field('ID *', idInput),
        field('Código', codeInput),
        field('Nome *', nameInput),
        field('Tipo', typeSelect),
        field('Nível', levelInput)
      );
      identity.appendChild(identityFields);
      body.appendChild(identity);

      // ---- Semestre e oferta ----
      const offer = document.createElement('section');
      offer.className = 'editor-section';
      offer.appendChild(sectionTitle('Semestre e oferta'));

      const offerFields = document.createElement('div');
      offerFields.className = 'editor-fields';

      const semesterInput = textField(
        'disc-editor-semester',
        draft && draft.semesterInput !== null ? String(draft.semesterInput) : ''
      );
      semesterInput.placeholder = '1–10, I–X, OP ou vazio';

      const freqSelect = selectField(
        'disc-editor-frequency',
        FREQUENCY_OPTIONS,
        draft?.frequency ?? 'annual'
      );

      offerFields.append(
        field('Semestre recomendado', semesterInput),
        field('Frequência', freqSelect)
      );
      offer.appendChild(offerFields);
      body.appendChild(offer);

      // ---- Carga horária ----
      const workloadSection = document.createElement('section');
      workloadSection.className = 'editor-section';
      workloadSection.appendChild(sectionTitle('Carga horária'));

      const workloadFields = document.createElement('div');
      workloadFields.className = 'editor-fields';

      const num = (id, key) =>
        textField(id, draft && draft[key] !== undefined ? String(draft[key]) : '0', 'number');

      workloadFields.append(
        field('CH total', num('disc-editor-workload', 'workload')),
        field('CH teórica', num('disc-editor-ch-teorica', 'ch_teorica')),
        field('CH prática', num('disc-editor-ch-pratica', 'ch_pratica')),
        field('CH PCC', num('disc-editor-ch-pcc', 'ch_pcc')),
        field('Créditos', num('disc-editor-credits', 'credits')),
        field('Unidade', textField('disc-editor-unit', draft?.workload_unit ?? 'h'))
      );
      workloadSection.appendChild(workloadFields);
      body.appendChild(workloadSection);

      // ---- Conteúdos do PUD ----
      const contents = document.createElement('section');
      contents.className = 'editor-section';
      contents.appendChild(sectionTitle('Conteúdos do PUD'));

      const contentsFields = document.createElement('div');
      contentsFields.className = 'editor-fields';

      contentsFields.append(
        field('Ementa', textArea('disc-editor-ementa', draft?.ementa ?? ''), true),
        field(
          'Objetivos (um por linha)',
          textArea('disc-editor-objectives', (draft?.objectives ?? []).join('\n'), 4),
          true
        ),
        field(
          'Programa (um item por linha)',
          textArea('disc-editor-program', (draft?.program ?? []).join('\n'), 4),
          true
        ),
        field('Metodologia de ensino', textArea('disc-editor-methodology', draft?.methodology ?? ''), true),
        field('Avaliação', textArea('disc-editor-assessment', draft?.assessment ?? ''), true)
      );
      contents.appendChild(contentsFields);
      body.appendChild(contents);

      // ---- Bibliografias ----
      const biblio = document.createElement('section');
      biblio.className = 'editor-section';
      biblio.appendChild(sectionTitle('Bibliografias'));

      const biblioFields = document.createElement('div');
      biblioFields.className = 'editor-fields';

      biblioFields.append(
        field(
          'Básica (uma por linha)',
          textArea('disc-editor-biblio-basica', (draft?.bibliografia_basica ?? []).join('\n'), 3),
          true
        ),
        field(
          'Complementar (uma por linha)',
          textArea('disc-editor-biblio-complementar', (draft?.bibliografia_complementar ?? []).join('\n'), 3),
          true
        )
      );
      biblio.appendChild(biblioFields);
      body.appendChild(biblio);

      // ---- Pré-requisitos ----
      const prereq = document.createElement('section');
      prereq.className = 'editor-section';
      prereq.appendChild(sectionTitle('Pré-requisitos'));

      const hint = document.createElement('p');
      hint.className = 'status-hint';
      hint.textContent =
        'Uma alternativa por linha ("ou"). Na mesma linha, "e" exige junto. ' +
        'Use nomes de disciplinas ou IDs (IDs evitam ambiguidade com "e"/"ou" no nome). Vazio = sem pré-requisitos.';
      prereq.appendChild(hint);

      const prereqText = existing
        ? requirementTreeToText(existing.prerequisites, (id) => idToName.get(id) ?? id)
        : '';
      prereq.appendChild(
        field(
          'Árvore de requisitos',
          textArea('disc-editor-prereqs', prereqText, 3, 'Ex.: D07 e D08\nD12'),
          true
        )
      );
      body.appendChild(prereq);

      // ---- Erros ----
      const errorBox = document.createElement('div');
      errorBox.id = 'disc-editor-errors';
      body.appendChild(errorBox);
    },
    footer: ({ close }) => {
      const cancel = document.createElement('button');
      cancel.className = 'btn btn-outline';
      cancel.type = 'button';
      cancel.textContent = 'Cancelar';
      cancel.addEventListener('click', close);

      const showErrors = (dialog, messages) => {
        const box = dialog.querySelector('#disc-editor-errors');
        if (!box) return;
        box.replaceChildren();
        if (!messages.length) return;
        const list = document.createElement('ul');
        list.className = 'editor-errors';
        for (const msg of messages) {
          const li = document.createElement('li');
          li.textContent = msg;
          list.appendChild(li);
        }
        box.appendChild(list);
      };

      const save = document.createElement('button');
      save.className = 'btn btn-primary';
      save.type = 'button';
      save.textContent = 'Salvar';
      save.addEventListener('click', () => {
        const dialog = save.closest('.modal-dialog');
        const val = (sel) => dialog.querySelector(sel)?.value ?? '';

        // Monta o rascunho a partir dos campos.
        const rawDraft = {
          id: val('#disc-editor-id'),
          code: val('#disc-editor-code'),
          name: val('#disc-editor-name'),
          type: val('#disc-editor-type'),
          level: val('#disc-editor-level'),
          semesterInput: val('#disc-editor-semester'),
          frequency: val('#disc-editor-frequency'),
          workload: val('#disc-editor-workload'),
          workload_unit: val('#disc-editor-unit'),
          ch_teorica: val('#disc-editor-ch-teorica'),
          ch_pratica: val('#disc-editor-ch-pratica'),
          ch_pcc: val('#disc-editor-ch-pcc'),
          credits: val('#disc-editor-credits'),
          ementa: val('#disc-editor-ementa'),
          objectives: linesFrom(val('#disc-editor-objectives')),
          program: linesFrom(val('#disc-editor-program')),
          methodology: val('#disc-editor-methodology'),
          assessment: val('#disc-editor-assessment'),
          bibliografia_basica: linesFrom(val('#disc-editor-biblio-basica')),
          bibliografia_complementar: linesFrom(val('#disc-editor-biblio-complementar')),
        };
        rawDraft.prerequisites = prerequisitesFromText(val('#disc-editor-prereqs'), nameToId);

        // Contexto de validação: ids conhecidos (pré-reqs) e ids tomados.
        const knownIds = new Set(curriculum.disciplines.map((d) => d.id));
        const otherIds = new Set(knownIds);
        const selfId = existing ? existing.id : rawDraft.id.trim();
        otherIds.delete(selfId);

        const result = validateDisciplineDraft(rawDraft, { knownIds, otherIds });

        // Validação estrutural do currículo resultante (ciclos etc.).
        let structuralErrors = [];
        if (result.valid) {
          const candidate = applyDisciplineEdit(curriculum, rawDraft);
          const structural = validateEditedCurriculum(candidate);
          if (structural.valid) {
            const saved = candidate.disciplines.find((d) => d.id === rawDraft.id.trim());
            showErrors(dialog, []);
            onSave({ curriculum: candidate, discipline: saved });
            close();
            return;
          }
          structuralErrors = structural.errors;
        }

        showErrors(dialog, [...result.errors, ...structuralErrors, ...result.warnings]);
      });

      return [save, cancel];
    },
  });
  modal.el.classList.add('modal-dialog--wide');
}
