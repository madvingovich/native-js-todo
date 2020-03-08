(function() {

    let state = {
        todos: [
            {
                title: 'Create todo app',
                id: 1,
                isDone: true,
                isEditing: false
            },
            {
                title: 'Send it to Dima',
                id: 2,
                isDone: true,
                isEditing: false
            }
        ],
        isFilterable: false,
        activeFilter: null,
        filtratedTodos: [],
    }

    const selectors = {
        todosItemsBox: document.querySelector('.todos_items'),
        todosCreateInput: document.querySelector('.todos_create_input'),
        todoCountSpan: document.querySelector('.filter_all span'),
        todoToDoSpan: document.querySelector('.filter_active span'),
        todoDoneSpan: document.querySelector('.filter_completed span'),
        noTodosHeader: document.querySelector('h2'),
        filterBlock: document.querySelector('.filter'),
        filterButtons: document.querySelectorAll('.filter button'),
        filterAllButton: document.querySelector('.filter_all'),
        filterActiveButton: document.querySelector('.filter_active'),
        filterCompletedButton: document.querySelector('.filter_completed'),
        createTodoForm: document.querySelector('.todos_create'),
    }

    const editInput = createEditInput()

    editInput.addEventListener('blur', stopEditing)

    editInput.addEventListener('keydown', function(e) {
        if(e.which == 13) {
            //enter
            editTodoItem(e.target)
        }
        else if(e.which == 27) {
            //esc
            stopEditing()
        }
    })

    selectors.createTodoForm.addEventListener('submit', submitTodo)

    selectors.todosItemsBox.addEventListener('click', handleItemAction)

    selectors.filterBlock.addEventListener('click', handleFilterAction)

    function render() {
        updateTodosCountInfo();

        selectors.todosItemsBox.innerHTML = ''        

        setFilterBlockVisibility(state.todos.length)
        setNoTodosHeaderVisibility(state.todos.length)

        if(state.todos.length) {
            renderTodoItems()
            focusEditInputIfSomeItemIsEditing()            
        }
    }

    function createEditInput() {
        const input = document.createElement('input')

        input.className = 'edit_item_input'

        return input
    }

    function submitTodo(e) {
        e.preventDefault()
        if(selectors.todosCreateInput.value.length < 3) {
            alert('TODO name must be at least 3 symbols length')
            return
        }
        addTodo(selectors.todosCreateInput.value)
        selectors.todosCreateInput.value = ''
    }

    function handleItemAction(e) {
        switch (e.target.className) {
            case 'todo_item_is_done':
                toggleIsDoneTodoItem(e.target)
                break
            case 'remove_item':
                removeTodoItem(e.target)
                break
            case 'edit_item':
                startEditing(e.target)
                break;
        }
    }

    function handleFilterAction(e) {
        if(e.target.classList.contains('active')) return

        removeAciveClassFromFilterButtons()
        
        if(e.target.classList.contains('filter_all')) {
            filterAllItems()
        }
        else if(e.target.classList.contains('filter_active')) {
            filterActiveItems()
        }
        else if(e.target.classList.contains('filter_completed')) {
            filterCompletedItems()
        }

        render()
    }

    function filterAllItems() {
        const newStateFilterInfo = {
            isFilterable: false,
            activeFilter: null,
            filtratedTodos: []
        }

        updateState(newStateFilterInfo)

        selectors.filterAllButton.classList.add('active')
    }

    function filterActiveItems() {
        const newStateFilterInfo = {
            isFilterable: true,
            activeFilter: 'active',
            filtratedTodos: state.todos.filter(todo => !todo.isDone)
        }

        updateState(newStateFilterInfo)

        selectors.filterActiveButton.classList.add('active')
    }

    function filterCompletedItems() {
        const newStateFilterInfo = {
            isFilterable: true,
            activeFilter: 'completed',
            filtratedTodos: state.todos.filter(todo => todo.isDone)
        }

        updateState(newStateFilterInfo)

        selectors.filterCompletedButton.classList.add('active')
    }

    function removeAciveClassFromFilterButtons() {
        for(let i = 0; i < selectors.filterButtons.length; i++) {
            selectors.filterButtons[i].classList.remove('active')
        }
    }

    function editTodoItem(target) {
        const editingItemIndex = getItemIndexFromTarget(target)

        let newTodoItem = {
            ...state.todos[editingItemIndex],
            title: target.value,
            isEditing: false
        }

        const newTodos = [...state.todos]
        newTodos[editingItemIndex] = newTodoItem

        updateTodos(newTodos)
    }

    function stopEditing() {
        const newTodos = state.todos.map(todo => {
            if(todo.isEditing) todo.isEditing = false
            return todo
        })

        updateTodos(newTodos)
    }

    function toggleIsDoneTodoItem(target) {
        const index = getItemIndexFromTarget(target)

        let newTodos = [...state.todos]

        newTodos[index] = {
            ...newTodos[index],
            isDone: target.checked
        }

        updateTodos(newTodos)
    }

    function updateFiltratedItems() {
        if(state.activeFilter === 'active') {
            filterActiveItems()
        }
        else if(state.activeFilter === 'completed') {
            filterCompletedItems()
        }
    }

    function startEditing(target) {
        const index = getItemIndexFromTarget(target)

        let newTodos = [...state.todos]

        newTodos[index] = {
            ...newTodos[index],
            isEditing: true
        }

        updateTodos(newTodos)
    }

    function removeTodoItem(target) {
        const index = getItemIndexFromTarget(target)

        let newTodos = [
            ...state.todos.slice(0, index),
            ...state.todos.slice(index + 1)
        ]

        updateTodos(newTodos)
    }

    function getItemIndexFromTarget(target) {
        const 
            id = target.getAttribute('id'),
            index = state.todos.findIndex(todo => todo.id == id)

        return index
    }

    function addTodo(title) {
        let newTodo = {
            title,
            id: new Date().getTime(),
            isDone: false,
            isEditing: false
        }

        const newTodos = [
            ...state.todos,
            newTodo
        ]

        updateTodos(newTodos)
    }

    function setFilterBlockVisibility(haveTodoItems) {
        if(haveTodoItems) {
            selectors.filterBlock.style.display = 'flex'
        } else {
            selectors.filterBlock.style.display = 'none'   
        }
    }

    function setNoTodosHeaderVisibility(haveTodoItems) {
        if(haveTodoItems) {
            selectors.noTodosHeader.style.display = 'none'
        } else {
            selectors.noTodosHeader.style.display = 'block'
        }
    }

    function renderTodoItems() {
        const todoItems = createTodoItems()
        selectors.todosItemsBox.appendChild(todoItems)
    }

    function focusEditInputIfSomeItemIsEditing() {
        const isSomeItemEditing = state.todos.some(item => item.isEditing)

        if(isSomeItemEditing) {
            editInput.focus()
        }
    }

    function createTodoItems() {
        let todosWrapper = document.createElement('div')

        const currentTodos = state.isFilterable ? state.filtratedTodos : state.todos

        for(let i = 0; i < currentTodos.length; i++) {
            const { title, id, isDone, isEditing } = currentTodos[i]

            const itemBox = document.createElement('div')
            itemBox.className = isEditing ? 'todo_item editing' : 'todo_item'
            itemBox.id = `todo-${id}`

            const
                isDoneCheckbox = createCheckbox(id, isDone),
                itemTextContent = createParagraph(title, isDone),
                itemButtons = createItemButtons(id)
                    

            itemBox.appendChild(isDoneCheckbox)
            itemBox.appendChild(itemTextContent)
            itemBox.appendChild(itemButtons)
            
            if(isEditing) {
                editInput.id = id
                editInput.value = title
                itemBox.appendChild(editInput)
            }

            todosWrapper.appendChild(itemBox)
        }

        return todosWrapper
    }

    function createCheckbox(id, checked) {
        let checkbox = document.createElement('input')

        checkbox.className = "todo_item_is_done"
        checkbox.type = "checkbox"
        checkbox.checked = checked
        checkbox.id = id

        return checkbox
    }

    function createParagraph(title, isDone) {
        let paragrahp = document.createElement('p')

        paragrahp.textContent = title
        paragrahp.style.textDecoration = isDone ? 'line-through' : ''

        return paragrahp
    }

    function createItemButtons(id) {
        let buttonsBox = document.createElement('div'),
            editItemButton = createEditButton(id),
            removeItemButton = createRemoveButton(id)

        buttonsBox.appendChild(editItemButton)
        buttonsBox.appendChild(removeItemButton)

        return buttonsBox
    }

    function createEditButton(id) {
        let editButton = document.createElement('button')

        editButton.className = "edit_item"
        editButton.textContent = "Edit"
        editButton.id = id

        return editButton
    }

    function createRemoveButton(id) {
        let removeButton = document.createElement('button')

        removeButton.className = "remove_item"
        removeButton.id = id
        removeButton.textContent = "X"

        return removeButton
    }

    function updateState(newState) {
        state = {
            ...state,
            ...newState
        }
    }

    function updateTodos(newTodos) {
        state = {
            ...state,
            todos: newTodos
        }

        if(state.isFilterable) {
            updateFiltratedItems()
        }
        
        render()
    }

    function updateTodosCountInfo() {
        const { todosCount, todosToDo, todosDone } = getTodosInfo()

        selectors.todoCountSpan.textContent = todosCount
        selectors.todoToDoSpan.textContent = todosToDo
        selectors.todoDoneSpan.textContent = todosDone
    }

    function getTodosInfo() {
        const 
            todosCount = state.todos.length,
            todosDone = state.todos.reduce((prev, todo) => {
                return prev + (todo.isDone ? 1 : 0)
            }, 0),
            todosToDo = todosCount - todosDone

        return {
            todosCount,
            todosToDo,
            todosDone
        }
    }

    render()
})();