const IS_VISIBLE_CLASS = 'is-visible'

const IS_DISAPPEARING_CLASS = 'is-disappearing'

const LOCAL_STORAGE_KEY = 'todos'

const root = document.querySelector('[data-js-wrapper]')

const newTaskForm = root.querySelector('[data-js-new-task-form]')
const newTaskInput = root.querySelector('[data-js-new-task-input]')

const searchTaskForm = root.querySelector('[data-js-search-task-form]')
const searchTaskInput = root.querySelector('[data-js-search-task-input]')

const totalTasks = root.querySelector('[data-js-tasks-total]')

const deleteAllButton = root.querySelector('[data-js-delete-all-button]')

const list = root.querySelector('[data-js-todos-list]')

const emptyMessage = root.querySelector('[data-js-todos-empty-message]')

let todos = []
let filteredTodos = null
let searchQuery = ''

window.addEventListener('DOMContentLoaded', () => {
  todos = getItemsFromLocalStorage()

  newTaskForm.addEventListener('submit', onNewTaskFormSubmit)

  searchTaskForm.addEventListener('submit', onSearchTaskFormSubmit)
  searchTaskInput.addEventListener('input', onSearchTaskInputChange)

  deleteAllButton.addEventListener('click', onDeleteAllButtonClick)

  list.addEventListener('click', onListClick)
  list.addEventListener('change', onListChange)

  render()
})

function getItemsFromLocalStorage() {
  const rawData = localStorage.getItem(LOCAL_STORAGE_KEY)

  if (!rawData) {
    return []
  }

  try {
    const parsedData = JSON.parse(rawData)
    return Array.isArray(parsedData) ? parsedData : []
  } catch {
    console.error('Todo items parse error')
    return []
  }
}

function saveItemsToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos))
}

function render() {
  totalTasks.textContent = todos.length

  deleteAllButton.classList.toggle(IS_VISIBLE_CLASS, todos.length > 0)

  const currentTodos = filteredTodos ?? todos

  list.innerHTML = currentTodos
    .map(
      (todo) => `
    <li class="todo__item todo-item" data-js-todos-item>
      <input
        class="todo-item__checkbox"
        id="${todo.id}"
        type="checkbox"
        ${todo.isChecked ? 'checked' : ''}
        data-js-todo-checkbox
      />
      <label
        class="todo-item__label"
        for="${todo.id}"
        data-js-todo-label
      >
        ${todo.title}
      </label>
      <button
        class="todo-item__delete-button"
        data-js-todo-delete-button
        aria-label="Delete"
        title="Delete"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </li>
  `
    )
    .join('')

  const isEmptyFiltered = filteredTodos?.length === 0
  const isEmptyTodos = todos.length === 0

  emptyMessage.textContent = isEmptyFiltered
    ? 'Tasks not found'
    : isEmptyTodos
    ? 'There are no tasks yet'
    : ''
}

function addItem(title) {
  todos.push({
    id: crypto?.randomUUID() ?? Date.now().toString(),
    title,
    isChecked: false,
  })
  saveItemsToLocalStorage()
  render()
}

function deleteItem(id) {
  todos = todos.filter((item) => item.id !== id)
  saveItemsToLocalStorage()
  render()
}

function toggleCheckedState(id) {
  todos = todos.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        isChecked: !item.isChecked,
      }
    }

    return item
  })

  saveItemsToLocalStorage()
  render()
}

function filter() {
  const queryFormatted = searchQuery.toLowerCase()

  filteredTodos = todos.filter((todo) => {
    const titleFormatted = todo.title.toLowerCase()
    return titleFormatted.includes(queryFormatted)
  })

  render()
}

function resetFilter() {
  filteredTodos = null
  searchQuery = ''
  render()
}

function onNewTaskFormSubmit(event) {
  event.preventDefault()

  const newTodoTitle = newTaskInput.value

  if (newTodoTitle.trim().length > 0) {
    addItem(newTodoTitle)
    resetFilter()

    newTaskInput.value = ''
    newTaskInput.focus()
  }
}

function onSearchTaskFormSubmit(event) {
  event.preventDefault()
}

function onSearchTaskInputChange(event) {
  const value = event.target.value.trim()

  if (value.length > 0) {
    searchQuery = value
    filter()
  } else {
    resetFilter()
  }
}

function onDeleteAllButtonClick() {
  todos = []
  saveItemsToLocalStorage()
  render()
}

function onListClick(event) {
  if (event.target.matches('[data-js-todo-delete-button]')) {
    const todo = event.target.closest('[data-js-todos-item]')
    const todoCheckbox = todo.querySelector('[data-js-todo-checkbox]')

    todo.classList.add(IS_DISAPPEARING_CLASS)

    setTimeout(() => {
      deleteItem(todoCheckbox.id)
    }, 400)
  }
}

function onListChange(event) {
  if (event.target.matches('[data-js-todo-checkbox]')) {
    toggleCheckedState(event.target.id)
  }
}
