import { initTaskForm } from "./add_task.js";
import { returnTaskHTML, returnAddTaskForm } from "./templates.js";
let taskStatus = "To Do";
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

function init() {
    initDragAndDrop();
    displayTasks();
}

init();

/**
 * Renders all tasks into the respective containers.
 * 
 * @param {Array} [taskList=tasks] - Optional list of tasks to render.
 */
export function displayTasks(taskList = tasks) {
    clearTaskHTML();
    taskList.forEach(task => {
        taskContainerMap[task.status].innerHTML += returnTaskHTML(task)
    });
    initDraggableTasks();
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
export function returnSubtaskCompletionPercent(subtaskList) {
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
export function returnSubtaskCompletionNum(subtaskList) {
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
    if (id && mode === "edit") {
        insertTaskForm();
        insertTaskToEdit(tasks.id); //in progress
        return
    } else if (id && mode === "view") {
        renderTaskView(id); // open task
        return
    } else {
        insertTaskForm();
    }
}

function insertTaskForm() {
    renderTaskForm();
    initTaskForm();
}

function renderTaskForm() {
    taskDialogContentRef.innerHTML = "";
    taskDialogContentRef.innerHTML = returnAddTaskForm();
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

/**
 * Stores the id of the dragged task and applies a visual dragging style to the element.
 * 
 * @param {DragEvent} event 
 */
function startDragging(event) {
    currentDraggedTaskId = Number(event.currentTarget.dataset.taskId);
    event.currentTarget.classList.add("dragging");
}

/**
 * Removes the visual dragging style from the element.
 * 
 * @param {DragEvent} event 
 */
function stopDragging(event) {
    event.currentTarget.classList.remove("dragging");
}

// /**
//  * Prevents the browser's default behavior during dragover, allowing the element to become a valid drop target.
//  * 
//  * @param {DragEvent} event 
//  */
// function allowDrop(event) {
//     event.preventDefault();
// }


// /**
//  * Finds the dragged task by its id, updates its status, removes the drop-target highlight, and re-renders the board.
//  * 
//  * @param {string} status 
//  */
function moveTaskTo(event) {
    event.preventDefault();

    const status = event.currentTarget.dataset.status;
    const draggedTask = tasks.find(task => task.id === currentDraggedTaskId);
    if (!draggedTask) return;
    draggedTask.status = status;
    document.querySelector('.drag-area-highlight')?.classList.remove('drag-area-highlight');
    displayTasks();
}

// function moveTaskTo(event) {
//     event.preventDefault();
//     const status = event.currentTarget.dataset.status;
//     const draggedTask = tasks.find(task => task.id === currentDraggedTaskId);
//     if (!draggedTask) return;
//     draggedTask.status = status;
//     document.querySelector('.drag-area-highlight')?.classList.remove('drag-area-highlight');
//     displayTasks();
// }


// /**
//  * Adds the dashed highlight style to the column with the given id.
//  * 
//  * @param {string} id 
//  */
// function highlight(id) {
//     document.getElementById(id).classList.add('drag-area-highlight');
// }


// /**
//  * Removes the dashed highlight style from the column with the given id.
//  * 
//  * @param {string} id 
//  */
// function removeHighlight(id) {
//     document.getElementById(id).classList.remove('drag-area-highlight');
// }

function initDragAndDrop() {
    const taskColumns = document.querySelectorAll(".task-column");
    taskColumns.forEach(column => {
        column.addEventListener("dragover", allowDrop);
        column.addEventListener("dragenter", highlight);
        column.addEventListener("dragleave", removeHighlight);
        column.addEventListener("drop", moveTaskTo);
    });
}

function initDraggableTasks() {
    const taskElements = document.querySelectorAll(".task-box");

    taskElements.forEach(task => {
        task.addEventListener("dragstart", startDragging);
        task.addEventListener("dragend", stopDragging);
    });
}

function allowDrop(event) {
    event.preventDefault();
}

function highlight(event) {
    event.currentTarget.classList.add("drag-highlight");
}

function removeHighlight(event) {
    event.currentTarget.classList.remove("drag-highlight");
}

// function moveTaskTo(event) {
//     event.preventDefault();
//     const newStatus = event.currentTarget.dataset.status;

//     console.log(newStatus);

//     // Task in Firebase updaten
// }

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
        { description: "Create card layout", completion: false },
        { description: "Add priority icons", completion: false },
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
