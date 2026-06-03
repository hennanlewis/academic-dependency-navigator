// Mapeia as relações de dependência
let prereqMap = new Map()
let unlocksMap = new Map()
let selectedDisciplines = new Set() // Agora é um Set para múltiplas seleções

// Função para coletar TODOS os pré-requisitos de uma disciplina (recursivo - forward)
function getAllPrerequisites(disciplineId, visited = new Set()) {
  if (visited.has(disciplineId)) return []
  visited.add(disciplineId)

  const discipline = curriculumData.disciplines.find(d => d.id === disciplineId)
  if (!discipline || !discipline.prerequisites || discipline.prerequisites.items.length === 0) {
    return []
  }

  let prerequisites = []

  function traverse(node) {
    if (node.type === "discipline") {
      prerequisites.push(node.disciplineId)
      // Busca pré-requisitos recursivamente
      const nested = getAllPrerequisites(node.disciplineId, visited)
      prerequisites.push(...nested)
    } else if (node.type === "group" && node.items) {
      node.items.forEach(item => traverse(item))
    }
  }

  discipline.prerequisites.items.forEach(item => traverse(item))

  // Remove duplicatas mantendo ordem
  return [...new Set(prerequisites)]
}

// Função para encontrar TODAS as disciplinas que dependem da disciplina selecionada (forward unlocking)
function getAllUnlockedDisciplines(disciplineId, visited = new Set()) {
  if (visited.has(disciplineId)) return []
  visited.add(disciplineId)

  let unlocked = []

  curriculumData.disciplines.forEach(discipline => {
    function checkPrereq(node) {
      if (node.type === "discipline" && node.disciplineId === disciplineId) {
        unlocked.push(discipline.id)
        // Busca recursivamente as disciplinas que dependem desta
        const nested = getAllUnlockedDisciplines(discipline.id, visited)
        unlocked.push(...nested)
      } else if (node.type === "group" && node.items) {
        node.items.forEach(item => checkPrereq(item))
      }
    }

    if (discipline.prerequisites && discipline.prerequisites.items) {
      discipline.prerequisites.items.forEach(item => checkPrereq(item))
    }
  })

  // Remove duplicatas e a própria disciplina
  return [...new Set(unlocked)].filter(id => id !== disciplineId)
}

// Constrói os mapas de dependência
function buildDependencyMap() {
  const prereqMap = new Map()
  const unlocksMap = new Map()

  curriculumData.disciplines.forEach(discipline => {
    prereqMap.set(discipline.id, getAllPrerequisites(discipline.id))
    unlocksMap.set(discipline.id, getAllUnlockedDisciplines(discipline.id))
  })

  return { prereqMap, unlocksMap }
}

// Função para determinar a classe CSS de cada disciplina (agora com múltiplas seleções)
function getCardClass(disciplineId) {
  if (selectedDisciplines.size === 0) return ''

  const isSelected = selectedDisciplines.has(disciplineId)

  // Verifica se é pré-requisito de QUALQUER disciplina selecionada
  let isPrerequisite = false
  let isUnlocked = false

  for (const selectedId of selectedDisciplines) {
    if (prereqMap.get(selectedId)?.includes(disciplineId)) {
      isPrerequisite = true
    }
    if (unlocksMap.get(selectedId)?.includes(disciplineId)) {
      isUnlocked = true
    }
  }

  if (isSelected) return 'selected'
  if (isPrerequisite && isUnlocked) return 'prerequisite unlocked'
  if (isPrerequisite) return 'prerequisite'
  if (isUnlocked) return 'unlocked'
  return ''
}

// Função para lidar com clique na disciplina (com suporte a múltipla seleção)
function handleCardClick(disciplineId, event) {
  // Verifica se Ctrl ou Cmd foi pressionado
  // Multi-seleção: toggle
    if (selectedDisciplines.has(disciplineId)) {
      selectedDisciplines.delete(disciplineId)
    } else {
      selectedDisciplines.add(disciplineId)
    }
  renderCurriculum()
}

// Função para resetar seleção (disponível globalmente)
window.resetSelection = function () {
  selectedDisciplines.clear()
  renderCurriculum()
}

// Adiciona evento de teclado para ESC
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    resetSelection()
  }
})

// Agrupa disciplinas por semestre
function groupBySemester() {
  const grouped = new Map()

  curriculumData.disciplines.forEach(discipline => {
    let semester = discipline.recommendedSemester
    if (!grouped.has(semester)) {
      grouped.set(semester, [])
    }
    grouped.get(semester).push(discipline)
  })

  // Ordena os semestres
  return new Map([...grouped.entries()].sort((a, b) => a[0] - b[0]))
}

// Função principal para renderizar o currículo
function renderCurriculum() {
  const grouped = groupBySemester()
  const container = document.getElementById('curriculum-container')
  container.innerHTML = ''

  // Renderiza semestres de 1 a 10
  for (let [semester, disciplines] of grouped.entries()) {
    if (semester === 0) continue

    // Ordena disciplinas por ID dentro do semestre
    disciplines.sort((a, b) => a.id.localeCompare(b.id))

    // Calcula carga horária total do semestre
    const totalWorkload = disciplines.reduce((total, discipline) => {
      return total + discipline.workload
    }, 0)

    const section = document.createElement('div')
    section.className = 'semester-section'

    const title = document.createElement('div')
    title.className = 'semester-title'
    title.innerHTML = `${semester}º Semestre <span class="total-workload">(${totalWorkload}h)</span>`
    section.appendChild(title)

    const grid = document.createElement('div')
    grid.className = 'grid'

    disciplines.forEach(discipline => {
      const card = document.createElement('div')
      card.className = `card ${getCardClass(discipline.id)}`
      card.onclick = (event) => handleCardClick(discipline.id, event)

      card.innerHTML = `
                <h3>${discipline.name} (${discipline.workload}${discipline.workload_unit})</h3>
                <!--<p>📚 ${discipline.type}</p>
                <div class="workload">
                    ${discipline.prerequisites && discipline.prerequisites.items.length > 0 ? '🔗 Tem pré-requisitos' : '✅ Sem pré-requisitos'}
                </div>-->
            `

      grid.appendChild(card)
    })

    section.appendChild(grid)
    container.appendChild(section)
  }

  // Adiciona seção de Optativas e Complementares (semestre 0)
  if (grouped.has(0)) {
    const optDisciplines = grouped.get(0)
    optDisciplines.sort((a, b) => a.id.localeCompare(b.id))

    // Calcula carga horária total das optativas
    const totalWorkload = optDisciplines.reduce((total, discipline) => {
      return total + discipline.workload
    }, 0)

    const section = document.createElement('div')
    section.className = 'semester-section'

    const title = document.createElement('div')
    title.className = 'semester-title optional'
    title.innerHTML = `📖 Disciplinas Optativas e Complementares <span class="total-workload">(Total: ${totalWorkload}h)</span>`
    section.appendChild(title)

    const grid = document.createElement('div')
    grid.className = 'grid'

    optDisciplines.forEach(discipline => {
      const card = document.createElement('div')
      card.className = `card ${getCardClass(discipline.id)}`
      card.onclick = (event) => handleCardClick(discipline.id, event)

      card.innerHTML = `
                <h3>${discipline.name}</h3>
                <p>📚 ${discipline.type} (${discipline.workload}${discipline.workload_unit})</p>
            `

      grid.appendChild(card)
    })

    section.appendChild(grid)
    container.appendChild(section)
  }
}

// Forçar rebuild dos maps sempre que necessário
function refreshMaps() {
  const maps = buildDependencyMap()
  prereqMap = maps.prereqMap
  unlocksMap = maps.unlocksMap
  renderCurriculum()
}

// Inicialização
refreshMaps()