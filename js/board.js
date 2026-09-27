import { initTaskForm, renderContacts, setFormSubtasks } from "./add_task.js";
import { returnTaskHTML, returnAddTaskForm, returnTaskView, returnSubtaskCompletionHTML, returnSubtasksHTML } from "./templates.js";
import { listenToTasks, updateTaskStatus, updateSubtaskCompletion, listenToContacts, deleteTask } from "./db.js";
import { filterTasks } from "./search.js";
import { getInitials } from "./contact-templates.js";
let tasks = [];
let contacts = [];
let currentDraggedTaskId;
const taskContainerMap = {
    "To Do": document.getElementById('to_do'),
    "In Progress": document.getElementById('in_progress'),
    "Awaiting Feedback": document.getElementById('await_feedback'),
    "Done": document.getElementById('done'),
}
const taskDialogRef = document.getElementById("task-dialog");
const searchInputRef = document.getElementById('search-task');
searchInputRef.addEventListener("input", search);
taskDialogRef.addEventListener("click", backdropClose);

function initAddTaskButtons() {
    const addTaskBtnRefs = document.querySelectorAll('.add-task-btn');
    addTaskBtnRefs.forEach(button => {
        button.addEventListener("click", (event)=> {
            openAddTask(event.currentTarget.dataset.status);
            // console.log(event.currentTarget.dataset.status);
        })
    });
}

function init() {
    initDragAndDrop();
    initTaskClickListener()
    listenToTasks((updatedTasks) => {
        tasks = updatedTasks;
        displayTasks();
    });
    listenToContacts((updatedContacts) => {
        contacts = updatedContacts;
    });
    initAddTaskButtons();
}

function initSubtaskClickListener() {
    const taskDialogRef = document.getElementById("task-dialog");
    taskDialogRef.addEventListener("change", handleSubtaskCompletion);
}

function handleSubtaskCompletion(event) {
    const subtaskElement = event.target.closest(".subtask-item-input");

    if (!subtaskElement) return;

    const taskElement = event.target.closest(".task-detail");

    const taskId = taskElement.dataset.taskId;
    const subtaskIndex = subtaskElement.dataset.subtaskIndex;
    const completion = subtaskElement.checked;

    updateSubtaskCompletion(taskId, subtaskIndex, completion);
}


//_________open Task________________


function initTaskClickListener() {
    const boardWrapperRef = document.querySelector(".board-wrapper");
    boardWrapperRef.addEventListener("click", openTask);
}

function openTask(event) {
    const taskElement = event.target.closest(".task-box");

    if (!taskElement) return;

    const taskId = taskElement.dataset.taskId;
    const task = tasks.find(task => task.id === taskId);

    if (!task) return;

    taskDialogRef.innerHTML = returnTaskView(task);
    initSubtaskClickListener();
    initTaskDialogButtons(task)
    openTaskDialog();
}

function initEditTaskButton(task) {
    const editTaskBtnRef = document.querySelector(".edit-task-btn");
    editTaskBtnRef.addEventListener("click", () => {
        openEditTask(task);
    });
}

/**
 * Renders the Dialog Content and opens the Modal
 */
function openTaskDialog() {
    taskDialogRef.showModal();
}

/**
 * Closes Task Dialog Modal
 */
function closeTaskDialog() {
    taskDialogRef.close();
}

function initCloseTaskButton() {
    const closeBtnRef = document.getElementById("close-task-dialog");
    closeBtnRef.addEventListener("click", closeTaskDialog);
}

function initDeleteTaskButton(task) {
    const deleteBtnRef = document.getElementById("delete-task-btn");

    deleteBtnRef.addEventListener("click", async () => {
        await deleteTask(task.id);
        closeTaskDialog();
    });
}

function backdropClose(event) {
    if (event.target === event.currentTarget) {
        closeTaskDialog();
    }
}

//_________Edit Task________________

function openAddTask(status) {
    taskDialogRef.innerHTML = returnAddTaskForm();

    renderContacts(contacts);
    setFormSubtasks();

    initTaskForm(status);
    initCloseTaskButton();
    openTaskDialog();
}

function openEditTask(task) {
    taskDialogRef.innerHTML = returnAddTaskForm();

    fillBasicTaskForm(task);
    renderContacts(contacts, task.assignedTo);
    setFormSubtasks(task.subtasks);

    initTaskForm(task.status, task.id);
    initCancelBtn(task);
}

function fillBasicTaskForm(task) { // CURRENTLY TEST
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("dueDate").value = task.dueDate;
    document.getElementById("category").value = task.category;
    document.getElementById(task.priority).checked = true;
}

function initCancelBtn(task) {
    const cancelBtnRef = document.getElementById('cancel-btn');
    const submitBtnRef = document.getElementById('submit-btn');
    submitBtnRef.innerHTML = "Ok"
    cancelBtnRef.addEventListener("click", () => {
        cancelEdit(task);
    });
}

function cancelEdit(task) {
    taskDialogRef.innerHTML = returnTaskView(task);
    initTaskDialogButtons(task);
}

function initTaskDialogButtons(task) {
    initCloseTaskButton();
    initEditTaskButton(task);
    initDeleteTaskButton(task);
}

// OPTIONAL RESET:
// Add a reset button with type="button" and call resetEditForm(task)
// in its click listener to restore the original task values.
// function resetEditForm(task) {
//     fillBasicTaskForm(task);
//     renderContacts(contacts, task.assignedTo);
//     setFormSubtasks(task.subtasks);
// }


//_________render Tasks & search________________


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
    renderEmptyColumnMessages()
    initDraggableTasks();
}

function renderEmptyColumnMessages() {
    Object.values(taskContainerMap).forEach(element => {
        if (element.children.length === 0) {
            element.innerHTML = returnNoTaskHTML();
        }        
    });
}

function returnNoTaskHTML() {
    return`<div>No Tasks here</div>`
}

function search() {
    const searchTerm = searchInputRef.value.toLowerCase();
    const filteredTasks = filterTasks(tasks, searchTerm);
    displayTasks(filteredTasks);
    const noResultsMessage = document.getElementById("no-results-message");
    noResultsMessage.hidden = filteredTasks.length !== 0;
}

/**
 * Clears all HTML Task Containers.
 */
function clearTaskHTML() {
    Object.values(taskContainerMap).forEach(taskContainer => { taskContainer.innerHTML = "" });
}

//_________Subtask Progress & AssignedTo for template________________
export function returnSubtaskProgressHTML(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return "";
    }
    const subtaskStats = getSubtaskStats(subtasks);
    return returnSubtaskCompletionHTML(subtaskStats);
}

function getSubtaskStats(subtasks) {
    const subtaskStats = {
        completed: 0,
        total: 0,
        percentage: 0
    };
    subtaskStats.completed = subtasks.filter(subtask => subtask.completion).length;
    subtaskStats.total = subtasks.length;
    subtaskStats.percentage = Math.round(subtaskStats.completed / subtaskStats.total * 100);
    return subtaskStats;
}

export function returnAssignedToHTML(assignedToList, showName = false) {
    if (!assignedToList || assignedToList.length === 0) {
        return "";
    }

    const assignedToHTML = assignedToList.map(contactID =>
        returnContactHTML(
            contacts.find(contact => contact.id === contactID),
            showName
        )
    );
    return assignedToHTML.join("");
}

function returnContactHTML(contact, showName = false) {
    if (!contact) {
        return "";
    }
    return `
    <div class="user-avatar" style="background: ${contact.color};">${getInitials(contact.name)}</div>
    ${showName ? returnNameHTML(contact.name) : ""}
    `;
}

function returnNameHTML(name) {
    return `
        <span>${name}</span>
    `;
}


//_________Drag and Drop________________


/**
 * Stores the id of the dragged task and applies a visual dragging style to the element.
 * 
 * @param {DragEvent} event 
 */
function startDragging(event) {
    currentDraggedTaskId = event.currentTarget.dataset.taskId;
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
//  * Finds the dragged task by its id, updates its status, removes the drop-target highlight, and re-renders the board.
//  * 
//  * @param {string} status 
//  */
async function moveTaskTo(event) {
    event.preventDefault();
    const status = event.currentTarget.dataset.status;
    await updateTaskStatus(currentDraggedTaskId, status);
    document.querySelector(".drag-area-highlight")?.classList.remove("drag-area-highlight");
}

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

init();