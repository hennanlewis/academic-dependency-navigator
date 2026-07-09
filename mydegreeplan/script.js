let prereqMap = new Map()
let unlocksMap = new Map()

const STATUS = {
    NONE: null,
    COMPLETED: "completed",
    CURRENT: "current",
    FAILED: "failed"
}

const appState = {
    selected: new Set(),
    status: new Map()
}

const statusMenu = document.getElementById("status-menu")
let currentDisciplineId = null

function openStatusMenu(button, disciplineId) {
    currentDisciplineId = disciplineId

    const rect = button.getBoundingClientRect()

    statusMenu.style.left = `${Math.floor(rect.left)}px`
    statusMenu.style.top = `${Math.floor(rect.top)}px`

    statusMenu.showPopover()
}

function closeStatusMenu() {
    statusMenu.hidePopover()
}

function markPrerequisitesCompleted(disciplineId) {
    const prereqs = getAllPrerequisites(disciplineId)

    prereqs.forEach(id => {
        if (appState.status.get(id) !== STATUS.FAILED) {
            appState.status.set(id, STATUS.COMPLETED)
        }
    })
}

statusMenu.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
        if (!currentDisciplineId) return

        const status = button.dataset.status

        if (status) {
            appState.status.set(currentDisciplineId, status)

            if (status === STATUS.CURRENT) {
                const prereqs = getAllPrerequisites(currentDisciplineId)

                prereqs.forEach(id => {
                    const currentStatus = appState.status.get(id)

                    if (currentStatus !== STATUS.FAILED) {
                        appState.status.set(id, STATUS.COMPLETED)
                    }
                })
            }
        } else {
            appState.status.delete(currentDisciplineId)
        }

        closeStatusMenu()

        refreshUI()
    })
})

document.addEventListener("click", event => {
    if (!statusMenu.contains(event.target))
        closeStatusMenu()
})

function getExpansionSources() {
    return [
        ...appState.selected,
        ...[...appState.status]
            .filter(([, status]) => status === STATUS.COMPLETED)
            .map(([id]) => id)
    ]
}

function getRelations(disciplineId) {

    let prerequisite = false
    let unlocked = false

    for (const sourceId of getExpansionSources()) {

        if (prereqMap.get(sourceId)?.includes(disciplineId))
            prerequisite = true

        if (unlocksMap.get(sourceId)?.includes(disciplineId))
            unlocked = true

        if (prerequisite && unlocked)
            break
    }

    return {
        prerequisite,
        unlocked
    }
}

function getCardState(disciplineId) {
    const relations = getRelations(disciplineId)

    return {
        selected: appState.selected.has(disciplineId),
        status: appState.status.get(disciplineId) ?? STATUS.NONE,
        prerequisite: relations.prerequisite,
        unlocked: relations.unlocked
    }
}

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

function toggle(set, value) {

    if (set.has(value))
        set.delete(value)
    else
        set.add(value)
}

function handleCardClick(disciplineId) {
    toggle(appState.selected, disciplineId)

    refreshUI()
}

window.resetSelection = function () {
    appState.selected.clear()
    appState.status.clear()

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

    return new Map([...grouped.entries()].sort((a, b) => a[0] - b[0]))
}

function getCardClass(state, relation) {
    if (state.selected)
        return "selected"

    if (state.status !== STATUS.NONE || relation !== null)
        return "active"

    return "default"
}

function getRelation(state) {
    if (state.prerequisite && state.unlocked)
        return "both"

    if (state.prerequisite)
        return "prerequisite"

    if (state.unlocked)
        return "unlocked"

    return null
}

function buildVisualState(state) {
    const relation = getRelation(state)

    return {
        classes: [getCardClass(state, relation)],
        attributes: {
            "data-status": state.status,
            "data-relation": relation
        }
    }
}

function buildCardViewModel(id) {
    const state = getCardState(id)
    const visual = buildVisualState(state)

    return {
        id,
        state,
        classes: ["card", ...visual.classes],
        attributes: visual.attributes
    }
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
            const vm = buildCardViewModel(discipline.id)

            card.className = vm.classes.join(" ")

            Object.entries(vm.attributes).forEach(([name, value]) => {
                if (value == null)
                    card.removeAttribute(name)
                else
                    card.setAttribute(name, value)
            })

            if (vm.state.status)
                card.dataset.status = vm.state.status

            card.onclick = (event) => handleCardClick(discipline.id, event)

            card.innerHTML = `
                <h3>${discipline.name} (${discipline.workload}${discipline.workload_unit})</h3>
                <!--<p>📚 ${discipline.type}</p>
                <div class="workload">
                ${discipline.prerequisites && discipline.prerequisites.items.length > 0 ? '🔗 Tem pré-requisitos' : '✅ Sem pré-requisitos'}
                </div>-->
                <button class="card-menu-btn">Estado</button>
            `

            const menuButton = card.querySelector(".card-menu-btn")
            menuButton.addEventListener("click", event => {
                event.stopPropagation()
                openStatusMenu(menuButton, discipline.id)
            })

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
            const vm = buildCardViewModel(discipline.id)

            card.className = vm.classes.join(" ")

            Object.entries(vm.attributes).forEach(([name, value]) => {
                if (value == null)
                    card.removeAttribute(name)
                else
                    card.setAttribute(name, value)
            })

            card.onclick = (event) => handleCardClick(discipline.id, event)

            card.innerHTML = `
                <div>
                    <h3>${discipline.name}</h3>
                    <p>📚 ${discipline.type} (${discipline.workload}${discipline.workload_unit})</p>
                </div>
                <button class="card-menu-btn">Estado</button>
            `

            const menuButton = card.querySelector(".card-menu-btn")
            menuButton.addEventListener("click", event => {
                event.stopPropagation()
                openStatusMenu(menuButton, discipline.id)
            })

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

    refreshUI()
}

function saveState() {
    localStorage.setItem(
        "curriculum-state-mydegreeplan",
        JSON.stringify({
            selected: [...appState.selected],
            status: [...appState.status]
        })
    )
}

function loadState() {
    const saved = localStorage.getItem("curriculum-state-mydegreeplan")

    if (!saved) return

    const data = JSON.parse(saved)

    appState.selected = new Set(data.selected)
    appState.status = new Map(data.status)
}

function refreshUI() {
    saveState()
    renderCurriculum()
}

loadState()
refreshMaps()
