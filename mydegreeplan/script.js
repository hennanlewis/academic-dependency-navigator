let prereqMap = new Map()
let unlocksMap = new Map()
let pendingAction = null

const STATUS = {
    NONE: null,
    COMPLETED: "completed",
    CURRENT: "current",
    FAILED: "failed"
}

const appState = {
    selected: new Set(),
    status: new Map(),
    attempts: [],
    semesterOverrides: new Map()
}

function getAttempts(disciplineId) {
    return appState.attempts.filter(
        attempt => attempt.disciplineId === disciplineId
    )
}

function getLatestAttempt(disciplineId) {
    const attempts = getAttempts(disciplineId)

    if (attempts.length === 0)
        return null

    return attempts.sort((a, b) => b.attempt - a.attempt)[0]
}

function getDisciplineById(id) {
    return curriculumData.disciplines.find(
        discipline => discipline.id === id
    )
}

function hasCompletedDiscipline(disciplineId) {
    return appState.attempts.some(
        attempt =>
            attempt.disciplineId === disciplineId &&
            attempt.status === STATUS.COMPLETED
    )
}

function getNextAttemptNumber(disciplineId) {
    return getAttempts(disciplineId).length + 1
}

const statusMenu = document.querySelector("#status-menu")
const semesterDialog = document.querySelector("#semester-dialog")
const semesterConfirm = document.querySelector("#semester-confirm")
let currentDisciplineId = null

semesterConfirm.addEventListener("click", () => {
    const valueElement = document.querySelector("#semester-select")

    const semester = Number(valueElement.value)

    if (pendingAction === "move-semester") {
        moveDisciplineToSemester(currentDisciplineId, semester)

    } else if (pendingAction === "new-attempt") {
        createNewAttempt(currentDisciplineId, semester)
    }

    pendingAction = null
    semesterDialog.hidePopover()
    refreshUI()
})

function openStatusMenu(button, disciplineId) {
    currentDisciplineId = disciplineId

    const moveButton = document.querySelector("#move-semester-btn")
    const attemptButton = document.querySelector("#new-attempt-btn")
    const currentStatus = appState.status.get(disciplineId)

    if (currentStatus != STATUS.FAILED) {
        attemptButton.style.display = "none"
    } else {
        attemptButton.style.display = "block"
    }

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

        if (!currentDisciplineId)
            return

        const action = button.dataset.action

        if (action === "move-semester") {
            pendingAction = "move-semester"
            semesterDialog.showPopover()
            closeStatusMenu()
            return
        }

        if (action === "new-attempt") {
            pendingAction = "new-attempt"
            semesterDialog.showPopover()
            closeStatusMenu()
            return
        }

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
            appState.semesterOverrides.delete(currentDisciplineId)

            appState.attempts = appState.attempts
                .filter(attempt => attempt.disciplineId !== currentDisciplineId)
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
        ...curriculumData.disciplines
            .filter(discipline => hasCompletedDiscipline(discipline.id))
            .map(discipline => discipline.id)
    ]
}

function createNewAttempt(disciplineId, semester) {
    appState.attempts.push({
        disciplineId,
        attempt: getNextAttemptNumber(disciplineId),
        semester,
        status: STATUS.CURRENT
    })

    refreshUI()
}

function hasPrerequisites(disciplineId) {
    const discipline = curriculumData.disciplines.find(d => d.id === disciplineId)

    return (
        discipline?.prerequisites &&
        discipline.prerequisites.items.length > 0
    )
}

function getRelations(disciplineId) {
    let prerequisite = false
    let unlocked = !hasPrerequisites(disciplineId)

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
        const semester = appState.semesterOverrides.get(discipline.id)
            ?? discipline.recommendedSemester

        if (!grouped.has(semester)) {
            grouped.set(semester, [])
        }

        grouped.get(semester).push(discipline)
    })

    appState.attempts.forEach(attempt => {
        const discipline = getDisciplineById(attempt.disciplineId)

        if (!discipline)
            return

        const copy = {
            ...discipline,
            id: `${discipline.id}-T${attempt.attempt}`,
            originalId: discipline.id,
            recommendedSemester: attempt.semester,
            attemptNumber: attempt.attempt
        }

        if (!grouped.has(attempt.semester)) {
            grouped.set(attempt.semester, [])
        }

        grouped.get(attempt.semester).push(copy)
    })

    return new Map(
        [...grouped.entries()].sort((a, b) => a[0] - b[0])
    )
}

function moveDisciplineToSemester(disciplineId, semester) {
    appState.semesterOverrides.set(disciplineId, semester)
}

function createNewAttempt(disciplineId, semester) {
    appState.attempts.push({
        disciplineId,
        attempt: getNextAttemptNumber(disciplineId),
        semester
    })
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
    const container = document.querySelector("#curriculum-container")
    container.innerHTML = ""

    for (let [semester, disciplines] of grouped.entries()) {
        if (semester === 0) continue

        disciplines.sort((a, b) => a.id.localeCompare(b.id))

        const totalWorkload = disciplines.reduce((total, discipline) => {
            return total + discipline.workload
        }, 0)

        const section = document.createElement("div")
        section.className = "semester-section"

        const title = document.createElement("div")
        title.className = "semester-title"
        title.innerHTML = `${semester}º Semestre <span class="total-workload">(${totalWorkload}h)</span>`
        section.appendChild(title)

        const grid = document.createElement("div")
        grid.className = "grid"

        disciplines.forEach(discipline => {
            const card = document.createElement("div")
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
                ${discipline.prerequisites && discipline.prerequisites.items.length > 0 ? "🔗 Tem pré-requisitos" : "✅ Sem pré-requisitos"}
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
            status: [...appState.status],
            attempts: appState.attempts,
            semesterOverrides: [...appState.semesterOverrides]
        })
    )
}

function loadState() {
    const saved = localStorage.getItem("curriculum-state-mydegreeplan")

    if (!saved) return

    const data = JSON.parse(saved)

    appState.selected = new Set(data.selected)
    appState.status = new Map(data.status ?? [])
    appState.attempts = data.attempts ?? []
    appState.semesterOverrides = new Map(data.semesterOverrides ?? [])
}

function refreshUI() {
    saveState()
    renderCurriculum()
}

loadState()
refreshMaps()
