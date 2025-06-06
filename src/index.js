(() => {
    'use strict';
    window.addTodo = () => {
        const todoInput = document.querySelector('#todo-input');
        const todoText = todoInput.value.trim();
        if (todoText === '') alert('Please enter a todo item.');
        const todoList = document.querySelector('#todo-list');
        todoList.innerHTML += `
            <li>${todoText} 
                <span>
                    <button class="delete-btn">Delete</button>
                </span>
            </li>`;
        todoInput.value = ''; // resetting the input field
    }

    function deleteTodo(event) {
        event.preventDefault(); // prevent the default action of the button (re-load)
        const todoItem = event.target.closest('li');
        if (todoItem) {
            todoItem.remove();
        } else {
            alert('Todo item not found.');
        }
    }

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            deleteTodo(event);
        }
    });
})();