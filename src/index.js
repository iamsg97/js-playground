;(() => {
    /**
     * Global array to hold todo items
     * @type {string[]}
     */
    const todos = []

    /**
     * Initializes the TODO application after the DOM is loaded.
     * Renders the initial UI and sets up event delegation for adding and deleting todos.
     *
     * - Listens for clicks on the root element to handle:
     *   - Adding a new todo when the add button is clicked.
     *   - Deleting a todo when a delete button is clicked.
     *
     * @listens window#DOMContentLoaded
     * @returns {void}
     */
    window.addEventListener('DOMContentLoaded', () => {
        render()

        document.querySelector('#root').addEventListener('click', event => {
            // add_todos
            if (event.target.id === 'add-todo-button') {
                const input = document.querySelector('#todo-input')
                todos.push(input?.value?.trim())
                input.value = ''
                render()
            }
            // delete_todos
            todos.forEach((_todo, index) => {
                if (event.target.id === `delete-todo-${index}`) {
                    todos.splice(index, 1)
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
     * @returns {Object} An object containing the following DOM elements:
     *   - todoContainer {HTMLDivElement} - Main container for the todo application
     *   - title {HTMLHeadingElement} - H1 element with the title "Todo List"
     *   - input {HTMLInputElement} - Text input field for new todos
     *   - addButton {HTMLButtonElement} - Button to add new todos
     *   - todoList {HTMLUListElement} - Unordered list container for todo items
     *   - item {HTMLLIElement} - List item containing the todo items
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
            placeholder: 'Add a new todo...'
        })
        const addButton = createElement(
            'button',
            {
                id: 'add-todo-button',
                class: 'todo-button',
                type: 'button'
            },
            'Add Todo'
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
     * The function accesses the global 'todos' array to render the current list
     * of todo items.
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
            root.appendChild
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
