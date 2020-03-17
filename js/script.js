(function() {
	let state = {
		todos: [
			{
				title: "Create todo app",
				id: 1,
				isDone: true,
				isEditing: false
			},
			{
				title: "Send it to Dima",
				id: 2,
				isDone: true,
				isEditing: false
			}
		],
		isFilterable: false,
		activeFilter: null
	};

	const selectors = {
		todoItemsBox: document.querySelector(".todos_items"),
		todosCreateInput: document.querySelector(".todos_create_input"),
		todoCountSpan: document.querySelector(".filter_all span"),
		todoToDoSpan: document.querySelector(".filter_active span"),
		todoDoneSpan: document.querySelector(".filter_completed span"),
		noTodosHeader: document.querySelector("h2"),
		filterBlock: document.querySelector(".filter"),
		filterButtons: document.querySelectorAll(".filter button"),
		filterAllButton: document.querySelector(".filter_all"),
		filterActiveButton: document.querySelector(".filter_active"),
		filterCompletedButton: document.querySelector(".filter_completed"),
		createTodoForm: document.querySelector(".todos_create")
	};

	const create = {
		div: () => document.createElement("div"),

		input: () => document.createElement("input"),

		button: () => document.createElement("button"),

		p: () => document.createElement("p"),

		editInput: () => {
			const input = create.input();

			input.className = "edit_item_input";

			return input;
		},

		todoItem: (isEditing, id) => {
			const item = create.div();

			item.className = isEditing ? "todo_item editing" : "todo_item";
			item.id = `todo-${id}`;

			return item;
		},

		checkbox: (id, checked) => {
			const checkbox = create.input();

			checkbox.className = "todo_item_is_done";
			checkbox.type = "checkbox";
			checkbox.checked = checked;
			checkbox.id = id;

			return checkbox;
		},

		todoTextItem: (title, isDone) => {
			let todoTextItem = create.p();

			todoTextItem.textContent = title;
			todoTextItem.style.textDecoration = isDone ? "line-through" : "";

			return todoTextItem;
		},

		editButton: id => {
			let editButton = create.button();

			editButton.className = "edit_item";
			editButton.textContent = "Edit";
			editButton.id = id;

			return editButton;
		},

		removeButton: id => {
			let removeButton = create.button();

			removeButton.className = "remove_item";
			removeButton.id = id;
			removeButton.textContent = "X";

			return removeButton;
		},

		todoItemButtons: id => {
			let buttonsBox = create.div(),
				editItemButton = create.editButton(id),
				removeItemButton = create.removeButton(id);

            buttonsBox.append(editItemButton, removeItemButton)

			return buttonsBox;
		}
	};

	const editInput = create.editInput();

	editInput.addEventListener("blur", stopEditing);

	editInput.addEventListener("keydown", function(e) {
		if (e.which == 13) {
			//enter
			editTodoItem(e.target);
		} else if (e.which == 27) {
			//esc
			stopEditing();
		}
	});

	selectors.createTodoForm.addEventListener("submit", submitTodo);

	selectors.todoItemsBox.addEventListener("click", handleItemAction);

	selectors.filterBlock.addEventListener("click", handleFilterAction);

	// view

	function createTodoItems() {
		let todosWrapper = create.div();

		let currentTodos;

		switch (state.activeFilter) {
			case "active":
				currentTodos = state.todos.filter(todo => !todo.isDone);
				break;
			case "completed":
				currentTodos = state.todos.filter(todo => todo.isDone);
				break;
			default:
				currentTodos = state.todos;
		}

		for (let i = 0; i < currentTodos.length; i++) {
			const { title, id, isDone, isEditing } = currentTodos[i];

			const itemBox = create.todoItem(isEditing, id);

			const isDoneCheckbox = create.checkbox(id, isDone),
				itemTextContent = create.todoTextItem(title, isDone),
				itemButtons = create.todoItemButtons(id);

            itemBox.append(isDoneCheckbox, itemTextContent, itemButtons)

			if (isEditing) {
				editInput.id = id;
				editInput.value = title;
				itemBox.appendChild(editInput);
			}

			todosWrapper.appendChild(itemBox);
		}

		return todosWrapper;
	}

	function render() {
		const { todosCount, todosToDo, todosDone } = getTodosInfo();
		const {
			todoCountSpan,
			todoToDoSpan,
			todoDoneSpan,
			todoItemsBox,
			filterBlock,
			noTodosHeader
		} = selectors;

		todoCountSpan.textContent = todosCount;
		todoToDoSpan.textContent = todosToDo;
		todoDoneSpan.textContent = todosDone;

		todoItemsBox.innerHTML = "";

		if (state.todos.length) {
			filterBlock.style.display = "flex";
			noTodosHeader.style.display = "none";

			const todoItems = createTodoItems();

			todoItemsBox.appendChild(todoItems);

			if (state.todos.some(item => item.isEditing)) {
				editInput.focus();
			}
		} else {
			filterBlock.style.display = "none";
			noTodosHeader.style.display = "block";
		}
	}

	// common

	function getItemIndexFromTarget(target) {
		const id = target.getAttribute("id"),
			index = state.todos.findIndex(todo => todo.id == id);

		return index;
	}

	function getTodosInfo() {
		const todosCount = state.todos.length;
		const todosDone = state.todos.reduce((prev, todo) => {
			return prev + (todo.isDone ? 1 : 0);
		}, 0);
		const todosToDo = todosCount - todosDone;

		return {
			todosCount,
			todosToDo,
			todosDone
		};
	}

	// work with data

	function addTodo(title) {
		let newTodo = {
			title,
			id: new Date().getTime(),
			isDone: false,
			isEditing: false
		};

		const newTodos = [...state.todos, newTodo];

		updateTodos(newTodos);
	}

	function submitTodo(e) {
		e.preventDefault();

		if (selectors.todosCreateInput.value.length < 3) {
			alert("TODO name must be at least 3 symbols length");
			return;
		}

		addTodo(selectors.todosCreateInput.value);

		selectors.todosCreateInput.value = "";
	}

	function handleItemAction(e) {
		switch (e.target.className) {
			case "todo_item_is_done":
				toggleIsDoneTodoItem(e.target);
				break;
			case "remove_item":
				removeTodoItem(e.target);
				break;
			case "edit_item":
				startEditing(e.target);
				break;
		}
	}

	function toggleIsDoneTodoItem(target) {
		const index = getItemIndexFromTarget(target);

		let newTodos = [...state.todos];

		newTodos[index] = {
			...newTodos[index],
			isDone: target.checked
		};

		updateTodos(newTodos);
	}

	function removeTodoItem(target) {
		const index = getItemIndexFromTarget(target);

		let newTodos = [
			...state.todos.slice(0, index),
			...state.todos.slice(index + 1)
		];

		updateTodos(newTodos);
	}

	function startEditing(target) {
		const index = getItemIndexFromTarget(target);

		let newTodos = [...state.todos];

		newTodos[index] = {
			...newTodos[index],
			isEditing: true
		};

		updateTodos(newTodos);
	}

	function stopEditing() {
		const newTodos = state.todos.map(todo => {
			if (todo.isEditing) todo.isEditing = false;
			return todo;
		});

		updateTodos(newTodos);
	}

	function editTodoItem(target) {
		const editingItemIndex = getItemIndexFromTarget(target);

		let newTodoItem = {
			...state.todos[editingItemIndex],
			title: target.value,
			isEditing: false
		};

		const newTodos = [...state.todos];
		newTodos[editingItemIndex] = newTodoItem;

		updateTodos(newTodos);
	}

	function updateTodos(newTodos) {
		state = {
			...state,
			todos: newTodos
		};

		if (state.isFilterable) {
			setFilter(state.activeFilter);
		}

		render();
	}

	// filters

	function handleFilterAction(e) {
		if (e.target.classList.contains("active")) return;

		const { classList } = e.target.closest("button");

		for (let i = 0; i < selectors.filterButtons.length; i++) {
			selectors.filterButtons[i].classList.remove("active");
		}

		if (classList.contains("filter_all")) {
			setFilter("all");
		} else if (classList.contains("filter_active")) {
			setFilter("active");
		} else if (classList.contains("filter_completed")) {
			setFilter("completed");
		}

		render();
	}

	function setFilter(filter) {
		const newStateFilterInfo = {
			isFilterable: filter !== "all",
			activeFilter: filter
		};

		state = {
			...state,
			...newStateFilterInfo
		};

		switch (filter) {
			case "all":
				selectors.filterAllButton.classList.add("active");
				break;
			case "active":
				selectors.filterActiveButton.classList.add("active");
				break;
			case "completed":
				selectors.filterCompletedButton.classList.add("active");
				break;
		}
	}

	render();
})();
