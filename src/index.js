;(() => {
    /**
     * Creates a stateful value and a function to update it, with optional render callback.
     *
     * @template T
     * @param {T} initialVal - The initial state value.
     * @param {(value: T) => void} [renderFn] - Optional function to call when the state updates.
     * @returns {[() => T, (newVal: T | ((prevVal: T) => T)) => void]}
     *   A tuple with a getter for the current state and a setter to update the state.
     */
    function useState(initialVal, renderFn) {
        let value = initialVal

        /**
         * Updates the state value and triggers a render function if provided.
         *
         * @param {any|function(any): any} newVal - The new value to set, or a function that receives the current value and returns the new value.
         * @returns {void}
         */
        const setState = newVal => {
            if (typeof newVal === 'function') {
                value = newVal(value)
            } else {
                value = newVal
            }
            if (renderFn && typeof renderFn === 'function') {
                renderFn()
            } else {
                console.warn(
                    'No render function provided or it is not a function'
                )
            }
        }
        /**
         * Returns the current value of the state.
         *
         * @returns {*} The current state value.
         */
        const getState = () => value

        return [getState, setState]
    }

    /**
     * Renders the TODO application UI by creating and appending DOM elements
     * to the root element. This function creates the main container, title,
     * input field, add button, and the list of todo items.
     *
     * Uses the useState hooks to access current todo items and edit state.
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

    const [getTodos, setTodos] = useState([], render)
    const [getEditIndex, setEditIndex] = useState(-1, render)

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
                    if (getEditIndex() !== -1) {
                        setTodos(prev => {
                            const updatedTodos = [...prev]
                            updatedTodos[getEditIndex()] = todoText // update the todo at editIndex
                            return updatedTodos
                        })
                        setEditIndex(-1) // reset edit index after updating
                    } else {
                        setTodos(prev => [...prev, todoText])
                    }
                }
                input.value = ''
            }

            getTodos().forEach((_todo, index) => {
                // delete_todos
                if (event.target.id === `delete-todo-${index}`) {
                    setTodos(
                        prev => prev.filter((_, i) => i !== index) // remove todo at index
                    )
                    // deleting the todo being edited
                    if (getEditIndex() === index) {
                        setEditIndex(-1) // reset edit index if the edited todo is deleted
                        input.value = ''
                    } else if (getEditIndex() > index) {
                        // we are deleting an item before the edited one
                        setEditIndex(prev => prev - 1) // adjust edit index if necessary
                    }
                }
                // edit_todos
                if (event.target.id === `edit-todo-${index}`) {
                    setEditIndex(index)
                    input.value = getTodos()[index]
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
     */ function todoComponent() {
        const todoContainer = createElement('div', {
            id: 'todo-container',
            class: 'todo-container'
        })
        const title = createElement('h1', { class: 'todo-title' }, 'Todo List')

        // Input section with better structure
        const inputSection = createElement('div', { class: 'input-section' })
        const input = createElement('input', {
            id: 'todo-input',
            class: 'todo-input',
            type: 'text',
            placeholder:
                getEditIndex() !== -1
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
            getEditIndex() !== -1 ? 'Update Todo' : 'Add Todo'
        )

        inputSection.appendChild(input)
        inputSection.appendChild(addButton)

        const todoList = createElement('ul', {
            id: 'todo-list',
            class: 'todo-list'
        })

        const items = getTodos().map((todo, index) => {
            const todoItem = createElement('li', { class: 'todo-item' })
            const textSpan = createElement(
                'span',
                { class: 'text', id: `todo-${index}` },
                todo
            )
            const buttonGroup = createElement('div', { class: 'button-group' })
            const editButton = createElement(
                'button',
                {
                    id: `edit-todo-${index}`,
                    class: 'edit-button',
                    type: 'button'
                },
                'Edit'
            )
            const deleteButton = createElement(
                'button',
                {
                    id: `delete-todo-${index}`,
                    class: 'delete-button',
                    type: 'button'
                },
                'Delete'
            )

            buttonGroup.appendChild(editButton)
            buttonGroup.appendChild(deleteButton)
            todoItem.appendChild(textSpan)
            todoItem.appendChild(buttonGroup)

            return todoItem
        })

        // Add items to the todo list
        if (items.length === 0) {
            const emptyMessage = createElement(
                'li',
                { class: 'empty-message' },
                'No todos available. Add a new todo!'
            )
            todoList.appendChild(emptyMessage)
        } else {
            todoList.append(...items)
        }

        // Stats section
        const statsSection = createElement('div', { class: 'stats-section' })
        const statsTitle = createElement(
            'div',
            { class: 'stats-title' },
            'Statistics'
        )
        const totalStat = createElement('div', { class: 'stats-item' })
        totalStat.appendChild(createElement('span', {}, 'Total tasks:'))
        totalStat.appendChild(
            createElement(
                'span',
                { class: 'stats-value' },
                getTodos().length.toString()
            )
        )

        statsSection.appendChild(statsTitle)
        statsSection.appendChild(totalStat)

        return {
            container: todoContainer,
            children: [title, inputSection, todoList, statsSection]
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
