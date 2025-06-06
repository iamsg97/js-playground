;(() => {
    /**
     * Global state object to manage todo items and editing state
     * @type {Object}
     * @property {string[]} todos - Array of todo items
     * @property {number} editIndex - Index of the todo being edited, -1 means no todo is being edited
     */
    const state = {
        todos: [],
        editIndex: -1 // Index of the todo being edited, -1 means no todo is being edited
    }
    // For backward compatibility, alias are created
    // to access the state properties directly
    const todos = state.todos
    /**
     * Initializes the TODO application after the DOM is loaded.
     * Renders the initial UI and sets up event delegation for adding, editing, and deleting todos.
     *
     * - Listens for clicks on the root element to handle:
     *   - Adding a new todo when the add button is clicked.
     *   - Updating a todo when the update button is clicked (during edit mode).
     *   - Deleting a todo when a delete button is clicked.
     *   - Editing a todo when an edit button is clicked.
     *
     * @listens window#DOMContentLoaded
     * @returns {void}
     */
    window.addEventListener('DOMContentLoaded', () => {
        render()

        document.querySelector('#root').addEventListener('click', event => {
            const input = document.querySelector('#todo-input')
            // add_todos or update_todos
            if (event.target.id === 'add-todo-button') {
                const todoText = input.value.trim()
                if (todoText) {
                    if (state.editIndex !== -1) {
                        todos[state.editIndex] = todoText
                        state.editIndex = -1 // reset edit index after updating
                    } else todos.push(todoText)
                }
                input.value = ''
                render()
            }

            todos.forEach((_todo, index) => {
                // delete_todos
                if (event.target.id === `delete-todo-${index}`) {
                    todos.splice(index, 1)
                    // deleting the todo being edited
                    if (state.editIndex === index) {
                        state.editIndex = -1 // reset edit index if the edited todo is deleted
                        input.value = ''
                    } else if (state.editIndex > index) {
                        // we are deleting an item before the edited one
                        state.editIndex-- // adjust edit index if necessary
                    }
                    render()
                }
                // edit_todos
                if (event.target.id === `edit-todo-${index}`) {
                    state.editIndex = index
                    input.value = todos[index]
                    render()
                }
            })
        })
    })
    /**
     * Creates and returns the main TODO application UI components as an object.
     * This function generates the container, title, input field, add button,
     * and the list of todo items using the createElement helper function.
     *
     * The input placeholder and button text change based on edit state:
     * - When editIndex === -1: Shows "Add a new todo..." and "Add Todo"
     * - When editIndex !== -1: Shows "Edit your todo..." and "Update Todo"
     *
     * @returns {Object} An object containing the following DOM elements:
     *   - container {HTMLDivElement} - Main container for the todo application
     *   - children {HTMLElement[]} - Array containing title, input, addButton, and todoList
     * @throws {TypeError} When children passed to createElement are not string or Node
     */
    function todoComponent() {
        const todoContainer = createElement('div', {
            id: 'todo-container',
            class: 'todo-container'
        })
        const title = createElement('h1', { class: 'todo-title' }, 'Todo List')
        const input = createElement('input', {
            id: 'todo-input',
            class: 'todo-input',
            type: 'text',
            placeholder:
                state.editIndex !== -1
                    ? 'Edit your todo...'
                    : 'Add a new todo...'
        })
        const addButton = createElement(
            'button',
            {
                id: 'add-todo-button',
                class: 'todo-button',
                type: 'button'
            },
            state.editIndex !== -1 ? 'Update Todo' : 'Add Todo'
        )
        const todoList = createElement('ul', {
            id: 'todo-list',
            class: 'todo-list'
        })
        const items = todos.map((todo, index) => {
            return createElement(
                'li',
                { class: 'todo-item' },
                createElement(
                    'span',
                    { class: 'text', id: `todo-${index}` },
                    todo
                ),
                createElement(
                    'button',
                    {
                        id: `delete-todo-${index}`,
                        class: 'delete-button',
                        type: 'button'
                    },
                    'Delete'
                ),
                createElement(
                    'button',
                    {
                        id: `edit-todo-${index}`,
                        class: 'edit-button',
                        type: 'button'
                    },
                    'Edit'
                )
            )
        })

        // Add items to the todo list
        if (items.length === 0) {
            const emptyMessage = createElement(
                'li',
                { class: 'empty-message' },
                'No todos available. Add a new todo!'
            )
            todoList.appendChild(emptyMessage)
        }
        todoList.append(...items)

        return {
            container: todoContainer,
            children: [title, input, addButton, todoList]
        }
    }
    /**
     * Renders the TODO application UI by creating and appending DOM elements
     * to the root element. This function creates the main container, title,
     * input field, add button, and the list of todo items.
     *
     * The function accesses the global 'state' object to render the current list
     * of todo items and handle edit state.
     *
     * @returns {void}
     * @throws {Error} When the root element is not found in the DOM
     */
    const render = () => {
        const root = document.querySelector('#root')

        if (!root) {
            throw new Error('Root element not found in the DOM')
        }

        // clear the prev DOM
        root.innerHTML = ''
        const component = todoComponent()

        console.debug(component)

        if (component.container && component.children) {
            root.appendChild(component.container)
            for (const child of component.children) {
                if (child instanceof HTMLElement) {
                    component.container.appendChild(child)
                }
            }
        } else if (component instanceof HTMLElement) {
            root.appendChild(component)
        } else if (Array.isArray(component)) {
            for (const item of component) {
                if (item instanceof HTMLElement) {
                    root.appendChild(item)
                }
            }
        } else {
            throw new TypeError(
                'Component must be an HTMLElement or an array of HTMLElements'
            )
        }
    }

    /**
     * @typedef {Object} ElementAttributes
     * @property {string} [id] - Element ID
     * @property {string} [class] - Element class names
     * @property {Object<string, string>} [style] - Element inline styles
     * @property {Object<string, string>} [dataset] - Element data attributes
     */

    /**
     * Creates a DOM element with specified attributes and children
     * @param {string} tagName - HTML tag name
     * @param {ElementAttributes} [attributes={}] - Element attributes
     * @param {...(Node|string)} children - Child nodes or text content
     * @returns {HTMLElement} Created DOM element
     * @throws {TypeError} When tagName is not a string
     * @throws {DOMException} When tagName is not a valid HTML element name
     */
    function createElement(tagName, attributes = {}, ...children) {
        const element = document.createElement(tagName)
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'class') {
                element.classList.add(...value.split(' '))
            } else if (key === 'style') {
                // style can be an object with CSS properties, it can be more than one
                element.style.cssText = extractStyle(Object.entries(value))
            } else if (key === 'dataset') {
                // custom HTML data attributes
                for (const [dataKey, dataValue] of Object.entries(value)) {
                    element.dataset[dataKey] = dataValue
                }
            } else {
                element.setAttribute(key, value)
            }
        }
        for (const child of children) {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child))
            } else if (child instanceof Node) {
                element.appendChild(child)
            } else {
                throw new TypeError('Children must be a string or a Node')
            }
        }
        return element
    }

    /**
     * Converts an array of style entries into a CSS string
     * @param {Array<[string, string]>} entries - Array of key-value pairs representing CSS properties
     * @returns {string} CSS string with properties joined by semicolons
     */
    function extractStyle(entries) {
        return entries.map(([key, value]) => `${key}: ${value}`).join(';')
    }
})()
