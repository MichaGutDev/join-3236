let currentDraggedTaskId;
let editingTaskId = null;
const taskDialogRef = document.getElementById("task-edit-dialog");
const assignedToRef = document.getElementById("assigned-to");
const taskDialogContentRef = document.getElementById("task-dialog-content");
const taskContainerMap = {
    "To Do": document.getElementById('to_do'),
    "In Progress": document.getElementById('in_progress'),
    "Awaiting Feedback": document.getElementById('await_feedback'),
    "Done": document.getElementById('done'),
}
let testAssignedToContacts = ["contactId1", "contactId3", "contactId5",];
let testContacts = {
    "-P172TkBoJkR3BQpTtUa": {
        "color": "#000000",
        "email": "el@join.de",
        "name": "elfenant",
        "phone": "",
        "userId": "PiL0J2aZNBf99FUlLpwpiTkLQb22"
    },
    "-P173Ri_JHcY2-qkoLAy": {
        "color": "#000000",
        "email": "a@tesmail.de",
        "name": "alfa",
        "phone": "",
        "userId": "kZ3YCrMZuVMZCPGLWRNMsaB2Acb2"
    },
};
const taskTest = [
    {
        id: 1,
        title: "Create login page",
        description: "Build the basic structure and styling for the login page.",
        dueDate: "2026-08-25",
        priority: "urgent",
        category: "User Story",
        assignedTo: ["contactId1", "contactId2"],
        status: "To Do",
        subtasks: [
            { subtask: "Create HTML structure", completion: true },
            { subtask: "Add responsive styling", completion: false },
        ],
    },
    {
        id: 2,
        title: "Design task cards",
        description: "Create the layout for task cards on the board.",
        dueDate: "2026-08-28",
        priority: "medium",
        category: "Technical Task",
        assignedTo: ["contactId3"],
        status: "To Do",
        subtasks: [
            { subtask: "Create card layout", completion: false },
            { subtask: "Add priority icons", completion: false },
        ],
    },
    {
        id: 3,
        title: "Add contact form",
        description: "Create a form for adding new contacts.",
        dueDate: "2026-09-02",
        priority: "low",
        category: "User Story",
        assignedTo: ["contactId2"],
        status: "To Do",
        subtasks: [],
    },
];

function init() {
    displayTasks();
}

/**
 * Renders all tasks into the respective containers.
 * 
 * @param {Array} [taskList=tasks] - Optional list of tasks to render.
 */
function displayTasks(taskList = tasks) {
    clearTaskHTML();
    taskList.forEach(task => {
        taskContainerMap[task.status].innerHTML += returnTaskHTML(task)
    });
}

/**
 * Clears all HTML Task Containers.
 */
function clearTaskHTML() {
    Object.values(taskContainerMap).forEach(taskContainer => { taskContainer.innerHTML = "" });
}

/**
 * Calculates the percentage of completed subtasks.
 *
 * @param {Array} subtaskList - List of subtasks belonging to a task.
 * @returns {number} Percentage of completed subtasks.
 */
function returnSubtaskCompletionPercent(subtaskList) {
    let completionData = returnSubtaskValues(subtaskList);
    let percentCompletion = completionData[0] / completionData[1] * 100;
    if (!percentCompletion) {
        percentCompletion = 0;
    }
    return percentCompletion
}

/**
 * Returns the number of completed subtasks and total subtasks.
 *
 * @param {{completion: boolean}[]} subtaskList - List of subtasks.
 * @returns {string} Completion count in the format "completed / total".
 */
function returnSubtaskCompletionNum(subtaskList) {
    let completionData = returnSubtaskValues(subtaskList);
    return `${completionData[0]}/${completionData[1]}`
}

/**
 * Counts completed subtasks and returns completion statistics.
 *
 * @param {{subtask: string, completion: boolean}[]} subtaskList
 * @returns {[number, number]} Completed subtasks and total subtasks.
 */
function returnSubtaskValues(subtaskList) {
    let counter = 0;
    subtaskList.forEach(subtask => {
        if (subtask.completion === true) {
            counter++;
        }
    });
    return [counter, subtaskList.length]
}

function returnTaskHTML(task) {
    return `
        <li class="task-box" draggable="true" ondragstart="startDragging(event, ${task.id})" ondragend="stopDragging(event)">
            <h3 class="${task.category.replace(/\s+/g, '-').toLowerCase()} task-category">${task.category}</h3>
            <h4>${task.title}</h4>
            <span class="task-descr">${task.description}</span>
            <div class="subtask-progress-container">
                <div class="progress-bar-outer">
                    <div class="progress-bar" style="width: ${returnSubtaskCompletionPercent(task.subtasks)}%;"></div>
                </div>
                <span>${returnSubtaskCompletionNum(task.subtasks)} Subtasks</span>
            </div>
            <div class="initials-container">
                <div class="user-avatar">RB</div>
                <img src="../assets/icons/prio-${task.priority}.svg" alt="${task.priority}-priority icon">
            </div>
        </li>
    `
}

// _____________________________________________________________________________________________


// let insertTaskTest = {
//         id: 1,
//         title: "Create login page",
//         description: "Build the basic structure and styling for the login page.",
//         // dueDate: "2026-08-25",
//         // priority: "urgent",
//         category: "User Story",
//         assignedTo: ["contactId1", "contactId2"],
//         status: "To Do",
//         subtasks: [
//             { subtask: "Create HTML structure", completion: true },
//             { subtask: "Add responsive styling", completion: false },
//         ],
//     };

// function insertTask(task) {
//     Object.entries(task).forEach(([key, value]) => {
//         if (key !== "id") {
//             document.getElementById(key).value = value;
//         }
//     });
// }

let test =
{
    id: 2,
    title: "Design task cards",
    description: "Create the layout for task cards on the board.",
    dueDate: "2026-08-28",
    priority: "medium",
    category: "Technical Task",
    assignedTo: ["contactId3"],
    status: "To Do",
    subtasks: [
        { subtask: "Create card layout", completion: false },
        { subtask: "Add priority icons", completion: false },
    ],
};

let test2 = {
    "title": "Test 1254",
    "description": "Update to Version 12454786",
    "dueDate": "2026-09-18",
    "prio": "urgent",
    "category": "User Story",
    "assignedTo": [
        "contactId2",
        "contactId3",
        "contactId3",
        "contactId3"
    ],
    "subtasks": [
        {
            "description": "ghdfhdf",
            "completion": false
        },
        {
            "description": "ghkhgk",
            "completion": false
        },
        {
            "description": "ergreh",
            "completion": false
        },
        {
            "description": "sdgsdg",
            "completion": false
        }
    ],
    "status": "In Progress"
};


/**
 * Closes Task Dialog Modal
 */
function closeTaskDialog() {
    taskDialogRef.close();
}

/**
 * Renders the Dialog Content and opens the Modal
 * @param {string} id 
 * @param {string} mode 
 */
function openTaskDialog(id = null, mode) {
    renderDialogContent(id, mode);
    taskDialogRef.showModal();
}

/**
 * Renders the Dialog Content by ID and selected Mode, else opens normal add-Task-Form
 * @param {string} id 
 * @param {string} mode 
 * @returns 
 */
function renderDialogContent(id, mode) {
    if(id && mode === "edit"){
        renderTaskForm();
        insertTaskToEdit(tasks.id);
        return
    } else if(id && mode === "view") {
        renderTaskView(id);
        return
    } else {
        renderTaskForm();
    }
}

function renderTaskForm() {
    taskDialogContentRef.innerHTML = "";
    taskDialogContentRef.innerHTML = returnAddTaskForm();
}

function returnAddTaskForm() {
    return `<div class="form-wrapper">
            <form id="task-form">
                <!-- Title -->
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" placeholder="Enter a title" required>
                </div>

                <!-- Description -->
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" placeholder="Enter a description" required></textarea>
                </div>

                <!-- Priority -->
                <div class="form-group">
                    <fieldset class="status">
                        <legend>Status</legend>

                        <label>
                            <input type="radio" name="status" value="To Do" checked>
                            <span>To Do</span>
                        </label>

                        <label>
                            <input type="radio" name="status" value="In Progress">
                            <span>In Progress</span>
                        </label>

                        <label>
                            <input type="radio" name="status" value="Awaiting Feedback">
                            <span>Awaiting Feedback</span>
                        </label>
                    </fieldset>
                </div>

                <!-- Due Date -->
                <div class="form-group">
                    <label for="due-date">Due Date</label>
                    <input type="date" id="due-date" name="dueDate" required>
                </div>

                <!-- Priority -->
                <div class="form-group">
                    <fieldset class="priority">
                        <legend>Priority</legend>

                        <label class="priority-high">
                            <input type="radio" name="priority" value="urgent">
                            <span>Urgent</span><img src="../assets/icons/prio-urgent.svg" alt="">
                        </label>

                        <label class="priority-medium">
                            <input type="radio" name="priority" value="medium" checked>
                            <span>Medium</span><img src="../assets/icons/prio-medium.svg" alt="">
                        </label>

                        <label class="priority-low">
                            <input type="radio" name="priority" value="low">
                            <span>Low</span><img src="../assets/icons/prio-low.svg" alt="">
                        </label>
                    </fieldset>
                </div>

                <!-- Category -->
                <div class="form-group">
                    <label for="category">Category</label>
                    <select id="category" name="category" required>
                        <option value="">Select category</option>
                        <option value="User Story">User Story</option>
                        <option value="Technical Task">Technical Task</option>
                    </select>
                </div>

                <!-- Assigned To -->
                <div class="form-group">
                    <label for="assigned-to">Assigned To</label>

                    <select id="assigned-to" name="assignedTo" multiple>
                        <option value="contactId1" selected>Contact 1</option>
                        <option value="contactId2">Contact 2</option>
                        <option value="contactId3" selected>Contact 3</option>
                        <option value="contactId3">Contact 4</option>
                        <option value="contactId3">Contact 5</option>
                        <option value="contactId3">Contact 6</option>
                        <option value="contactId3">Contact 7</option>
                        <option value="contactId3">Contact 8</option>
                    </select>
                </div>

                <!-- Subtasks -->
                <div class="form-group">
                    <label for="new-subtask">Subtasks</label>

                    <div class="subtask-input">
                        <input type="text" id="new-subtask" placeholder="Add new subtask">

                        <button type="button" id="add-subtask-btn" class="btn-primary">
                            Add
                        </button>
                    </div>

                    <ul id="subtask-list" class="subtask-list">
                        <!-- Subtasks hier rendern -->
                    </ul>
                </div>

                <div class="form-actions">
                    <button type="reset" class="btn-secondary">Clear</button>
                    <button type="submit" class="btn-primary">Create Task</button>
                </div>
            </form>
        </div>`
}

function insertTaskToEdit(task) {
    fillBasicTaskForm(task); // Works, check again tho
    renderContacts(contacts, task.assignedTo);

    // fillSubtasks(task.subtasks);
}

function fillBasicTaskForm(task) { // CURRENTLY TEST
    Object.entries(test).forEach(([key, val]) => {
        if (key !== "subtasks" && key !== "assignedTo" && key !== "id") {
            document.getElementById(`${key}`).value = val;
        }
    });
}

function renderContacts(contacts, assignedTo = []) {
    const selectRef = document.getElementById("assigned-to");
    selectRef.innerHTML = "";
    contacts.forEach(contact => {
        const option = document.createElement("option");
        option.value = contact.id;
        option.textContent = contact.name;
        option.selected = assignedTo.includes(contact.id);
        selectRef.appendChild(option);
    });
}

// ______________________________ AssignedContacts
// function fillAssignedContacts(task) {
//     const formAssignedToRef = document.getElementById('assigned-to');
//     const assigned = task.assignedTo; // [contact1, contact2]
//     formAssignedToRef.innerHTML = "";
//     formAssignedToRef.innerHTML = returnAssignedToHTML(testContacts, testAssignedToContacts); // later task.assignedTo
// }

// // handle edge case (user no longer active, cant be assigned to)
// function returnAssignedToHTML(contacts, selectedContacts = null) {
//     let html;
//     contacts.forEach(contact => {
//         // html
//         // 
//         if (isAssignedContact(contact, selectedContacts)) {
//             html += `<option value="${contact.userID}}" selected>${contact.name}}</option>`;
//         } else {
//             html += `<option value="${contact.userID}">${contact.name}</option>`;
//         }

//     });
// }

// function isAssignedContact(contact, selectedContacts) {
//     for (let index = 0; index < selectedContacts.length; index++) {
//         const selectedContact = selectedContacts[index];
//         if (contact === selectedContact) {
//             return true;
//         }
//     }
// }
// _______________________________________________________________
//____________________________________________________________________________

/**
 * Stores the id of the dragged task and applies a visual dragging style to the element.
 * 
 * @param {DragEvent} event 
 * @param {number} id 
 */
function startDragging(event, id) {
    currentDraggedTaskId = id;
    event.target.classList.add('dragging');
}

/**
 * Removes the visual dragging style from the element.
 * 
 * @param {DragEvent} event 
 */
function stopDragging(event) {
    event.target.classList.remove('dragging');
}

/**
 * Prevents the browser's default behavior during dragover, allowing the element to become a valid drop target.
 * 
 * @param {DragEvent} event 
 */
function allowDrop(event) {
    event.preventDefault();
}


/**
 * Finds the dragged task by its id, updates its status, removes the drop-target highlight, and re-renders the board.
 * 
 * @param {string} status 
 */
function moveTaskTo(status) {
    const draggedTask = tasks.find(task => task.id === currentDraggedTaskId);
    draggedTask.status = status;
    document.querySelector('.drag-area-highlight')?.classList.remove('drag-area-highlight');
    displayTasks();
}


/**
 * Adds the dashed highlight style to the column with the given id.
 * 
 * @param {string} id 
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}


/**
 * Removes the dashed highlight style from the column with the given id.
 * 
 * @param {string} id 
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}