let prereqMap = new Map()
let unlocksMap = new Map()
let selectedDisciplines = new Set()
let completedDisciplines = new Set()

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

    return [...new Set(prerequisites)]
}

function getAllUnlockedDisciplines(disciplineId, visited = new Set()) {
    if (visited.has(disciplineId)) return []
    visited.add(disciplineId)

    let unlocked = []

    curriculumData.disciplines.forEach(discipline => {
        function checkPrereq(node) {
            if (node.type === "discipline" && node.disciplineId === disciplineId) {
                unlocked.push(discipline.id)
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

    return [...new Set(unlocked)].filter(id => id !== disciplineId)
}

function buildDependencyMap() {
    const prereqMap = new Map()
    const unlocksMap = new Map()

    curriculumData.disciplines.forEach(discipline => {
        prereqMap.set(discipline.id, getAllPrerequisites(discipline.id))
        unlocksMap.set(discipline.id, getAllUnlockedDisciplines(discipline.id))
    })

    return { prereqMap, unlocksMap }
}

function getCardClass(disciplineId) {
    const classes = []

    if (selectedDisciplines.has(disciplineId))
        classes.push("selected")

    if (completedDisciplines.has(disciplineId))
        classes.push("completed")

    let isPrerequisite = false
    let isUnlocked = false

    for (const selectedId of selectedDisciplines) {
        if (prereqMap.get(selectedId)?.includes(disciplineId))
            isPrerequisite = true

        if (unlocksMap.get(selectedId)?.includes(disciplineId))
            isUnlocked = true
    }

    if (isPrerequisite)
        classes.push("prerequisite")

    if (isUnlocked)
        classes.push("unlocked")

    return classes.join(" ")
}

function handleCardClick(disciplineId, event) {
    if (event.altKey) {
        if (completedDisciplines.has(disciplineId)) {
            completedDisciplines.delete(disciplineId)
        } else {
            completedDisciplines.add(disciplineId)
        }
    } else {
        if (selectedDisciplines.has(disciplineId)) {
            selectedDisciplines.delete(disciplineId)
        } else {
            selectedDisciplines.add(disciplineId)
        }
    }

    renderCurriculum()
}

window.resetSelection = function () {
    selectedDisciplines.clear()
    completedDisciplines.clear()
    renderCurriculum()
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        resetSelection()
    }
})

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

function renderCurriculum() {
    const grouped = groupBySemester()
    const container = document.getElementById('curriculum-container')
    container.innerHTML = ''

    for (let [semester, disciplines] of grouped.entries()) {
        if (semester === 0) continue

        disciplines.sort((a, b) => a.id.localeCompare(b.id))

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

    if (grouped.has(0)) {
        const optDisciplines = grouped.get(0)
        optDisciplines.sort((a, b) => a.id.localeCompare(b.id))

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

function refreshMaps() {
    const maps = buildDependencyMap()
    prereqMap = maps.prereqMap
    unlocksMap = maps.unlocksMap
    renderCurriculum()
}

refreshMaps()
